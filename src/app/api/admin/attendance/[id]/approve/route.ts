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
            const graceMinutes = settings?.gracePeriodMinutes || 60;

            const [startHour, startMin] = shiftStartStr.split(':').map(Number);

            const checkInTime = new Date(attendance.checkIn);
            const shiftStart = new Date(checkInTime);
            shiftStart.setHours(startHour, startMin, 0, 0);

            const lateThreshold = new Date(shiftStart.getTime() + graceMinutes * 60000);

            if (checkInTime > lateThreshold) {
                updates.isHalfDay = true;
                updates.isLate = true;
                updates.lateMinutes = Math.floor((checkInTime.getTime() - shiftStart.getTime()) / 60000);
            } else if (checkInTime > shiftStart) {
                // Just late but within grace (optional tracking)
                updates.isLate = true;
                updates.lateMinutes = Math.floor((checkInTime.getTime() - shiftStart.getTime()) / 60000);
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
