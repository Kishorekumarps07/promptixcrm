import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
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
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch unread notifications, sorted by newest first
        const notifications = await Notification.find({ recipientId: userId, isRead: false })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ notifications });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function PATCH() {
    // Bulk mark all as read
    await dbConnect();
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ message: 'All notifications marked as read' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
