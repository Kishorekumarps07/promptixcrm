import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Event from '@/models/Event';
import LeaveRequest from '@/models/LeaveRequest';
import Attendance from '@/models/Attendance';
import CourseEnrollment from '@/models/CourseEnrollment';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();

    // Secure this route
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    } catch {
        return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    try {
        const [
            employees,
            students,
            events,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            pendingAttendance,
            approvedAttendance,
            enrollmentStats
        ] = await Promise.all([
            User.countDocuments({ role: 'EMPLOYEE' }),
            User.countDocuments({ role: 'STUDENT' }),
            Event.countDocuments({}),
            LeaveRequest.countDocuments({ status: 'Pending' }),
            LeaveRequest.countDocuments({ status: 'Approved' }),
            LeaveRequest.countDocuments({ status: 'Rejected' }),
            Attendance.countDocuments({ status: 'Pending' }),
            Attendance.countDocuments({ status: 'Approved' }),
            CourseEnrollment.aggregate([
                { $match: { status: 'Ongoing' } },
                { $group: { _id: '$courseId', count: { $sum: 1 } } },
                { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
                { $unwind: '$course' },
                { $project: { _id: 0, title: '$course.title', count: '$count' } }
            ])
        ]);

        return NextResponse.json({
            employees,
            students,
            events,
            leaves: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves,
                total: pendingLeaves + approvedLeaves + rejectedLeaves
            },
            attendance: {
                pending: pendingAttendance,
                approved: approvedAttendance,
                total: pendingAttendance + approvedAttendance // + Rejected if needed
            },
            enrollmentStats
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
