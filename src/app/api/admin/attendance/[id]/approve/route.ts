import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getAdminId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return null;
        return payload.userId;
    } catch {
        return null;
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const adminId = await getAdminId();

        // Fetch Attendance record to get checkIn time
        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return NextResponse.json({ message: 'Attendance not found' }, { status: 404 });
        }

        let updates: any = {
            status: 'Approved',
            approvedBy: adminId,
            approvedAt: new Date(),
            isHalfDay: false,
            isLate: false,
            lateMinutes: 0
        };

        // Grace Period Logic
        if (attendance.checkIn) {
            const WorkSettings = (await import('@/models/WorkSettings')).default;
            const settings = await WorkSettings.findOne().lean();

            // Defaults
            const shiftStartStr = settings?.shiftStartTime || '09:00';
            const shiftEndStr = settings?.shiftEndTime || '18:00';
            const graceMinutes = settings?.gracePeriodMinutes || 60;
            const minHours = settings?.minWorkHours || 8;
            const isStrict = settings?.isStrictMode || false;

            const [startHour, startMin] = shiftStartStr.split(':').map(Number);
            const [endHour, endMin] = shiftEndStr.split(':').map(Number);

            const checkInTime = new Date(attendance.checkIn);
            const shiftStart = new Date(checkInTime);
            shiftStart.setHours(startHour, startMin, 0, 0);

            const lateThreshold = new Date(shiftStart.getTime() + graceMinutes * 60000);

            // 1. Check-In Lateness
            if (checkInTime > lateThreshold) {
                updates.isLate = true;
                updates.lateMinutes = Math.floor((checkInTime.getTime() - shiftStart.getTime()) / 60000);
                
                // In strict mode, beyond grace is half day. If not strict, it might just be late.
                // But current logic is: beyond grace = half day. Let's keep that but make it more explicit.
                updates.isHalfDay = true;
            } else if (checkInTime > shiftStart) {
                updates.isLate = true;
                updates.lateMinutes = Math.floor((checkInTime.getTime() - shiftStart.getTime()) / 60000);
                // If strict, maybe even 1 minute late is a half day? 
                // Let's stick to: within grace = Late, beyond grace = Half Day.
            }

            // 2. Check-Out & Work Hours (Strict Mode)
            if (isStrict && attendance.checkOut) {
                const checkOutTime = new Date(attendance.checkOut);
                const workMs = checkOutTime.getTime() - checkInTime.getTime();
                const workHours = workMs / (1000 * 60 * 60);

                if (workHours < minHours) {
                    updates.isHalfDay = true;
                    updates.remarks = (updates.remarks || '') + ` [Short hours: ${workHours.toFixed(1)}h]`;
                }
            } else if (isStrict && !attendance.checkOut) {
                // Missing checkout in strict mode is half day
                updates.isHalfDay = true;
                updates.remarks = (updates.remarks || '') + ' [Missing Check-out]';
            }
        }

        const updated = await Attendance.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );
        return NextResponse.json({ message: 'Attendance Approved', attendance: updated });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
