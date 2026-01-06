import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

// Helper to get CORS headers based on request origin
function getCorsHeaders(origin: string | null) {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://promptix.pro",
        "https://www.promptix.pro"
    ];

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
        // Fallback for non-browser or unknown origins (optional, mostly for direct API calls)
        headers['Access-Control-Allow-Origin'] = '*';
    }

    return headers;
}

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin');
    return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(request: NextRequest) {
    await dbConnect();

    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

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
