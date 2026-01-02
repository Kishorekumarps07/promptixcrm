import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId as string;

        // Fetch Upcoming or Ongoing events only, excluding Announcements
        const events = await Event.find({
            status: { $in: ['Upcoming', 'Ongoing'] },
            type: { $ne: 'Announcement' }
        }).sort({ date: 1 });

        // Map to include registration status
        const eventsWithStatus = events.map(event => ({
            _id: event._id,
            title: event.title,
            description: event.description,
            date: event.date,
            type: event.type,
            status: event.status,
            isRegistered: event.attendees.some((a: any) => a.user.toString() === userId)
        }));

        return NextResponse.json({ events: eventsWithStatus });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
