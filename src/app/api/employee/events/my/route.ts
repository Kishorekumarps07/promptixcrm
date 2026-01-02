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

        const events = await Event.find({
            'attendees.user': userId
        }).sort({ date: -1 });

        const myEvents = events.map(event => {
            const attendee = event.attendees.find((a: any) => a.user.toString() === userId);
            return {
                _id: event._id,
                title: event.title,
                date: event.date,
                status: attendee ? attendee.status : 'Registered',
                feedback: attendee ? attendee.feedback : null
            };
        });

        return NextResponse.json({ events: myEvents });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
