import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

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

// GET: Fetch individual attendance for a month
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!userId || !month || !year) {
        return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    try {
        const startDate = new Date(parseInt(year), parseInt(month), 1);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59, 999);

        const records = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        return NextResponse.json({ records });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}

// POST: Upsert attendance record with remarks/overrides
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { userId, date, status, type, remarks } = await req.json();

        if (!userId || !date) {
            return NextResponse.json({ message: 'User ID and Date required' }, { status: 400 });
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Check if locked
        let record = await Attendance.findOne({ userId, date: targetDate });
        
        if (record && record.isLocked) {
            return NextResponse.json({ message: 'Attendance is locked for this period and cannot be modified.' }, { status: 400 });
        }

        if (record) {
            // Update
            record.status = status || record.status;
            record.type = type || record.type;
            record.remarks = remarks !== undefined ? remarks : record.remarks;
            record.approvedBy = userInfo.userId;
            record.approvedAt = new Date();
            await record.save();
        } else {
            // Create
            record = await Attendance.create({
                userId,
                date: targetDate,
                status: status || 'Approved',
                type: type || 'Present',
                remarks: remarks || '',
                approvedBy: userInfo.userId,
                approvedAt: new Date()
            });
        }

        // Audit Log
        await logAction({
            action: 'ATTENDANCE_OVERRIDE',
            entityType: 'Attendance',
            entityId: record._id.toString(),
            performedBy: userInfo.userId,
            role: 'ADMIN',
            metadata: { userId, date, status, type, remarks }
        });

        return NextResponse.json({ message: 'Attendance updated successfully', record });

    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
