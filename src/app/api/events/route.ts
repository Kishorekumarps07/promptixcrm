import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

// Permissive CORS for Public API
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let currentUserId: string | null = null;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, SECRET);
            currentUserId = payload.userId as string;
        } catch { }
    }

    try {
        const events = await Event.find({ isActive: true }).sort({ date: 1 });

        // Fetch all registrations for this user
        let userRegistrations: any[] = [];
        if (currentUserId) {
            userRegistrations = await EventRegistration.find({ userId: currentUserId });
        }

        // enhance with isRegistered field if logged in
        const eventsWithStatus = events.map(e => {
            const reg = userRegistrations.find(r => r.eventId.toString() === e._id.toString());
            return {
                ...e.toObject(),
                isRegistered: !!reg,
                isAttended: reg?.attended || false,
                registrationCount: 0, // Need aggregation for real count, skipping for perf now
            };
        });

        return NextResponse.json({ events: eventsWithStatus }, { headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500, headers: corsHeaders });
    }
}
