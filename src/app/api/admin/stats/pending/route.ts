import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET(req: Request) {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get('month') || '0');
        const year = parseInt(searchParams.get('year') || '0');

        if (!year) return NextResponse.json({ totalPending: 0 });

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const [pendingAtt, pendingLeaves] = await Promise.all([
            Attendance.countDocuments({
                date: { $gte: startDate, $lte: endDate },
                status: 'Pending'
            }),
            LeaveRequest.countDocuments({
                status: 'Pending',
                $or: [
                    { fromDate: { $lte: endDate }, toDate: { $gte: startDate } }
                ]
            })
        ]);

        return NextResponse.json({
            totalPending: pendingAtt + pendingLeaves,
            attendance: pendingAtt,
            leaves: pendingLeaves
        });
    } catch (e) {
        return NextResponse.json({ totalPending: 0 });
    }
}
