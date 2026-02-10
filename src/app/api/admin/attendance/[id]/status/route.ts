import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';
import { sendNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { EmailTemplates } from '@/lib/email-templates';
import User from '@/models/User';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role as string };
    } catch {
        return null;
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    console.log("Admin Attendance PUT Received"); // Debug
    await dbConnect();
    const userInfo = await getUserInfo();

    // 1. Strict Admin Check
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!['Approved', 'Rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const record = await Attendance.findById(id);
        if (!record) {
            return NextResponse.json({ message: 'Attendance record not found' }, { status: 404 });
        }

        // 2. Prevent multiple approvals/rejections (Optional strictness, but good for audit)
        // If we want to allow re-evaluation, we skip this. 
        // Request says "Prevent multiple approvals", implies once decided it stays? 
        // Usually Admin might need to correct a mistake. Let's allow update but log it implicitly by overwriting.
        // Wait, request said "Prevent multiple approvals on same record". 
        // I will interprete this as: If it's ALREADY Approved, don't re-approve blindly 
        // or prevent accidental double clicks. But Admins usually need to fix mistakes.
        // Let's prevent if status is SAME.

        // Strict "Approve OR Reject only once" rule
        if (record.status !== 'Pending') {
            return NextResponse.json({ message: `Attendance request has already been ${record.status}. Action is final.` }, { status: 400 });
        }

        record.status = status;
        record.approvedBy = userInfo.userId;
        record.approvedAt = new Date();

        await record.save();

        // Notify Employee
        console.log(`[AUDIT] Notifying Employee ${record.userId} of Attendance ${status}`);
        // Notify Employee (DB Notification)
        console.log(`[AUDIT] Notifying Employee ${record.userId} of Attendance ${status}`);
        await sendNotification(
            record.userId.toString(),
            `Attendance ${status}`,
            `Your attendance for ${new Date(record.date).toLocaleDateString()} has been ${status}.`,
            status === 'Approved' ? 'ATTENDANCE_APPROVED' : 'ATTENDANCE_REJECTED',
            '/employee/attendance'
        );

        // Notify Employee (Email)
        // Fetch user email first since it might not be in record
        const employeeUser = await User.findById(record.userId).select('email name');
        if (employeeUser && employeeUser.email) {
            try {
                await sendEmail({
                    to: employeeUser.email,
                    subject: `⏱️ Attendance Update: ${status}`,
                    html: EmailTemplates.attendanceActionEmail(
                        new Date(record.date).toLocaleDateString(),
                        status,
                        employeeUser.name
                    )
                });
            } catch (error) {
                console.error(`[EMAIL ERROR] Failed to send attendance email to ${employeeUser.email}`, error);
            }
        }

        // Audit Log
        await logAction({
            action: status === 'Approved' ? 'ATTENDANCE_APPROVED' : 'ATTENDANCE_REJECTED',
            entityType: 'Attendance',
            entityId: id,
            performedBy: userInfo.userId as string,
            role: 'ADMIN',
            metadata: { originalStatus: record.status, newStatus: status }
        });

        return NextResponse.json({ message: `Attendance ${status} successfully`, record });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
