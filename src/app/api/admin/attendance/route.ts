import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function GET() {
    await dbConnect();
    try {
        const attendance = await Attendance.find({})
            .populate('userId', 'name email')
            .populate('approvedBy', 'name')
            .sort({ date: -1 });
        return NextResponse.json({ attendance });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
