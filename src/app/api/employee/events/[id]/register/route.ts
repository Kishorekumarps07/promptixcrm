import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function POST(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId;
        const role = payload.role;
        const { id } = await params;

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 });
        }

        if (event.status !== 'Upcoming' && event.status !== 'Ongoing') {
            return NextResponse.json({ message: 'Registration closed' }, { status: 400 });
        }

        const alreadyRegistered = event.attendees.some((a: any) => a.user.toString() === userId);
        if (alreadyRegistered) {
            return NextResponse.json({ message: 'Already registered' }, { status: 400 });
        }

        event.attendees.push({
            user: userId,
            role: role
        });
        await event.save();

        return NextResponse.json({ message: 'Successfully registered' });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
