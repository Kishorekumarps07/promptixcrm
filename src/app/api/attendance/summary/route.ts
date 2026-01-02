import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Aggregation for summary
        const attendanceStats = await Attendance.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Convert array to object { Present: 5, WFH: 2 }
        const summary: any = {};
        attendanceStats.forEach((stat: any) => {
            summary[stat._id] = stat.count;
        });

        const pendingLeaves = await LeaveRequest.countDocuments({ userId, status: 'Pending' });
        const approvedLeaves = await LeaveRequest.countDocuments({ userId, status: 'Approved' });

        return NextResponse.json({ summary: { ...summary, pendingLeaves, approvedLeaves } });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

import mongoose from 'mongoose';
