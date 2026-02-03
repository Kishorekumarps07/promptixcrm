import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
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

        // Get current month start and end
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const startOfMonth = new Date(year, month, 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(year, month + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Fetch all attendance records for current month
        const attendanceRecords = await Attendance.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: 1 });

        // Calculate working days (excluding weekends)
        let workingDays = 0;
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                workingDays++;
            }
        }

        // Count different statuses
        let present = 0;
        let wfh = 0;
        let leave = 0;
        let pending = 0;
        let rejected = 0;

        attendanceRecords.forEach(record => {
            if (record.status === 'Approved') {
                if (record.type === 'Present') present++;
                else if (record.type === 'WFH') wfh++;
                else if (record.type === 'Leave') leave++;
            } else if (record.status === 'Pending') {
                pending++;
            } else if (record.status === 'Rejected') {
                rejected++;
            }
        });

        // Calculate attendance percentage
        const totalMarked = present + wfh;
        const percentage = workingDays > 0 ? Math.round((totalMarked / workingDays) * 100) : 0;

        // Build calendar array for the entire month
        const calendar = [];
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Find attendance record for this date
            const record = attendanceRecords.find(r =>
                r.date.toISOString().split('T')[0] === dateStr
            );

            calendar.push({
                date: dateStr,
                day: d.getDate(),
                isWeekend,
                isToday: dateStr === now.toISOString().split('T')[0],
                status: record ? record.status : null,
                type: record ? record.type : null
            });
        }

        return NextResponse.json({
            month: month + 1, // 1-based month
            year,
            monthName: now.toLocaleDateString('en-US', { month: 'long' }),
            workingDays,
            present,
            wfh,
            leave,
            pending,
            rejected,
            percentage,
            totalMarked: present + wfh + leave,
            calendar
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
