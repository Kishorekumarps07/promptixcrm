import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.userId as string;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch Upcoming or Ongoing events
        const events = await Event.find({
            status: { $in: ['Upcoming', 'Ongoing'] },
            date: { $gte: today }
        }).sort({ date: 1 });

        // Map events to include 'isRegistered' flag
        const eventsWithStatus = events.map(event => ({
            ...event.toObject(),
            isRegistered: event.attendees.some((a: any) => a.user.toString() === userId)
        }));

        return NextResponse.json({ events: eventsWithStatus });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
