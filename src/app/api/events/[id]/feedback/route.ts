import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
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

// POST: Submit Feedback
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { feedback, rating } = await req.json();

    try {
        const reg = await EventRegistration.findOne({ eventId: id, userId });

        if (!reg) return NextResponse.json({ message: 'Not registered' }, { status: 400 });
        if (!reg.attended) return NextResponse.json({ message: 'Must attend to leave feedback' }, { status: 400 });

        reg.feedback = feedback;
        reg.rating = rating;
        await reg.save();

        return NextResponse.json({ message: 'Feedback submitted', reg });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
