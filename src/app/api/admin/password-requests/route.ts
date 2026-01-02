import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PasswordChangeRequest from '@/models/PasswordChangeRequest';
import User from '@/models/User'; // Ensure User model is loaded
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Fetch all pending requests, populate user details
        const requests = await PasswordChangeRequest.find({ status: 'Pending' })
            .populate('userId', 'name email role')
            .sort({ requestedAt: 1 }); // Oldest first

        return NextResponse.json({ requests });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
