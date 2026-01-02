import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PasswordChangeRequest from '@/models/PasswordChangeRequest';
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

// GET: Check status of current request
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find the most recent request
        const request = await PasswordChangeRequest.findOne({ userId: userInfo.userId })
            .sort({ requestedAt: -1 });

        return NextResponse.json({ request });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create a new request
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { reason } = await req.json();

        // Check for existing pending request
        const existing = await PasswordChangeRequest.findOne({
            userId: userInfo.userId,
            status: 'Pending'
        });

        if (existing) {
            return NextResponse.json({ message: 'You already have a pending request.' }, { status: 400 });
        }

        const newRequest = await PasswordChangeRequest.create({
            userId: userInfo.userId,
            role: userInfo.role,
            reason: reason || '',
            status: 'Pending'
        });

        return NextResponse.json({ message: 'Request submitted', request: newRequest });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
