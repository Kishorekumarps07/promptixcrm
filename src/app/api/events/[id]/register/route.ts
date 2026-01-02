import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
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
        return payload.userId;
    } catch {
        return null;
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userId = await getUserId();
    const { id } = await params;
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Add user to registrations if not already there
        const event = await Event.findById(id);
        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });

        // Check existing registration in new model
        const existing = await EventRegistration.findOne({ eventId: id, userId });
        if (existing) {
            return NextResponse.json({ message: 'Already registered' }, { status: 400 });
        }

        await EventRegistration.create({
            eventId: id,
            userId,
        });

        return NextResponse.json({ message: 'Registered successfully' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
