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
        if (payload.role !== 'ADMIN') return null;
        return payload.userId as string;
    } catch {
        return null;
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const body = await req.json();
        // Capture old state if needed, here just logging new state
        const updated = await Event.findByIdAndUpdate(id, body, { new: true });

        // Audit Log
        if (updated) {
            await logAction({
                action: 'EVENT_UPDATED',
                entityType: 'Event',
                entityId: id,
                performedBy: adminId,
                role: 'ADMIN',
                metadata: { title: updated.title, changes: Object.keys(body) }
            });
        }

        return NextResponse.json({ message: 'Event updated', event: updated });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const event = await Event.findByIdAndDelete(id);

        // Audit Log
        if (event) {
            await logAction({
                action: 'EVENT_DELETED',
                entityType: 'Event',
                entityId: id,
                performedBy: adminId,
                role: 'ADMIN',
                metadata: { title: event.title }
            });
        }

        return NextResponse.json({ message: 'Event deleted' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
