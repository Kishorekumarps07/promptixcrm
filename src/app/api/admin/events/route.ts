import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getAdminId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return null; // Strict Role Check
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    try {
        const events = await Event.find({}).sort({ date: 1 });
        return NextResponse.json({ events });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const adminId = await getAdminId();
        const { title, description, date, type, isActive } = body;

        const event = await Event.create({
            title,
            description,
            date,
            type,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: adminId,
        });

        // Audit Log
        if (adminId) {
            await logAction({
                action: 'EVENT_CREATED',
                entityType: 'Event',
                entityId: event._id.toString(),
                performedBy: adminId as string,
                role: 'ADMIN',
                metadata: { title: event.title, date: event.date }
            });
        }

        return NextResponse.json({ message: 'Event created', event });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
