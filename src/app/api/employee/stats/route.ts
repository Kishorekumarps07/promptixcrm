import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId;

        // 1. Today's Attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ userId, date: { $gte: today } });

        // 2. Leaves
        const totalLeaves = await LeaveRequest.countDocuments({ userId });
        const pendingLeaves = await LeaveRequest.countDocuments({ userId, status: 'Pending' });
        const approvedLeaves = await LeaveRequest.countDocuments({ userId, status: 'Approved' });

        // 3. Attendance Stats
        const totalAttendance = await Attendance.countDocuments({ userId, status: 'Approved', type: { $in: ['Present', 'WFH'] } });

        // 4. Upcoming Events (Next 7 Days)
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const upcomingEventsCount = await Event.countDocuments({
            date: { $gte: today, $lte: nextWeek },
            isActive: true
        });

        return NextResponse.json({
            attendance: attendance ? attendance.status : 'Not Checked In',
            attendanceRecord: attendance, // Return full record for UI state
            stats: {
                leaves: {
                    total: totalLeaves,
                    pending: pendingLeaves,
                    approved: approvedLeaves
                },
                attendance: {
                    present: totalAttendance
                }
            },
            upcomingEvents: upcomingEventsCount
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
