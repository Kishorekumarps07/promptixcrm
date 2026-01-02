import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';

export async function GET() {
    await dbConnect();
    try {
        const leaves = await LeaveRequest.find({})
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json({ leaves });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
