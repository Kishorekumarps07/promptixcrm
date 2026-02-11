import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notifyAdmins } from '@/lib/notification';
import { sendEmail } from '@/lib/email';
import { EmailTemplates } from '@/lib/email-templates';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const ADMIN_EMAIL = process.env.VAL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.VAL_SMTP_USER || process.env.SMTP_USER || 'admin@example.com';

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'EMPLOYEE') return null; // Strict Role Check
        return payload.userId;
    } catch {
        return null;
    }
}

// GET: Check today's status
export async function GET() {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const record = await Attendance.findOne({ userId, date: today });
        return NextResponse.json({ record });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// POST: Check In
export async function POST(req: Request) {
    console.log("Attendance POST received"); // Debug log
    await dbConnect();
    const userId = await getUserId();
    console.log(`Attendance POST UserID: ${userId}`); // Debug log

    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    console.log("Attendance POST Body:", body); // Debug log
    const { type } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const existing = await Attendance.findOne({ userId, date: today });
        if (existing) {
            return NextResponse.json({ message: 'Already checked in today', record: existing }, { status: 400 });
        }

        // Check if on Approved Leave
        const onLeave = await LeaveRequest.findOne({
            userId,
            status: 'Approved',
            fromDate: { $lte: today },
            toDate: { $gte: today }
        });

        if (onLeave) {
            return NextResponse.json({ message: 'You are on approved leave today. Check-in disabled.' }, { status: 403 });
        }

        const record = await Attendance.create({
            userId,
            date: today,
            checkIn: new Date(),
            type: type || 'Present',
            status: 'Pending',
        });

        // Notify Admins (DB Notification)
        await notifyAdmins({
            title: 'Attendance Submitted',
            message: `Employee has checked in for ${new Date(today).toLocaleDateString()}.`,
            type: 'ATTENDANCE_SUBMITTED',
            entityType: 'Attendance',
            entityId: record._id.toString()
        });

        // Notify Admin (Email Alert)
        const user = await User.findById(userId).select('name');
        if (user) {
            console.log(`[EMAIL] Sending Admin Alert for ${user.name} Check-In`);
            // Format time in IST explicitly for the email alert
            const istTime = new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).format(new Date());

            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `📢 Attendance Alert: ${user.name} Checked In`,
                html: EmailTemplates.adminAttendanceAlert(
                    user.name,
                    'CheckIn',
                    istTime,
                    type || 'Present'
                )
            });
        }

        return NextResponse.json({ message: 'Checked in', record });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PATCH: Check Out
export async function PATCH() {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // 1. Find the existing record
        const record = await Attendance.findOne({ userId, date: today });

        if (!record) {
            return NextResponse.json({ message: 'No check-in found for today. Please check in first.' }, { status: 404 });
        }

        // 2. Prevent re-checkout (Lock)
        if (record.checkOut) {
            return NextResponse.json({ message: 'Attendance already completed for today.' }, { status: 400 });
        }

        // 3. Update Check-out time
        record.checkOut = new Date();
        await record.save();

        // Notify Admin (Email Alert)
        const user = await User.findById(userId).select('name');
        if (user) {
            console.log(`[EMAIL] Sending Admin Alert for ${user.name} Check-Out`);
            // Format time in IST explicitly for the email alert
            const istTime = new Intl.DateTimeFormat('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).format(new Date());

            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `📢 Attendance Alert: ${user.name} Checked Out`,
                html: EmailTemplates.adminAttendanceAlert(
                    user.name,
                    'CheckOut',
                    istTime,
                    record.status
                )
            });
        }

        return NextResponse.json({ message: 'Checked out successfully', record });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
