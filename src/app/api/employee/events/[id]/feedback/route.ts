import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId;
        const { id } = await params;
        const { rating, comment } = await req.json();

        const event = await Event.findById(id);
        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });

        const attendee = event.attendees.find((a: any) => a.user.toString() === userId);

        if (!attendee) {
            return NextResponse.json({ message: 'Not registered' }, { status: 400 });
        }

        if (event.status !== 'Completed') {
            return NextResponse.json({ message: 'Feedback allowed only for Completed events' }, { status: 400 });
        }

        if (attendee.status !== 'Attended') {
            return NextResponse.json({ message: 'Cannot submit feedback for unattended events' }, { status: 400 });
        }

        if (attendee.feedback && attendee.feedback.rating) {
            return NextResponse.json({ message: 'Feedback already submitted' }, { status: 400 });
        }

        attendee.feedback = { rating, comment };
        await event.save();

        return NextResponse.json({ message: 'Feedback submitted' });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
