import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';
import { sendNotification, notifyAdmins } from '@/lib/notification';

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

        if (role !== 'STUDENT' && role !== 'EMPLOYEE') {
            return NextResponse.json({ message: 'Only Students and Employees can register' }, { status: 403 });
        }
        const { id } = await params;

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ message: 'Event not found' }, { status: 404 });
        }

        if (event.status !== 'Upcoming' && event.status !== 'Ongoing') {
            return NextResponse.json({ message: 'Registration is not open for this event state' }, { status: 400 });
        }

        // Check duplicate using the new 'attendees' array
        const alreadyRegistered = event.attendees.some((a: any) => a.user.toString() === userId);

        if (alreadyRegistered) {
            return NextResponse.json({ message: 'Already registered' }, { status: 400 });
        }

        // Add new attendee with Role
        event.attendees.push({
            user: userId,
            role: role // Storing 'STUDENT' or 'EMPLOYEE'
        });



        await event.save();

        // Audit Log
        await logAction({
            action: 'EVENT_REGISTERED',
            entityType: 'Event',
            entityId: id,
            performedBy: userId as string,
            role: role as string,
            metadata: { title: event.title }
        });

        // Notify Admins
        console.log(`[AUDIT] Notifying Admins of Event Registration: ${event.title}`);
        await notifyAdmins({
            title: 'New Event Registration',
            message: `User ${userId} registered for event: ${event.title}`,
            type: 'EVENT_REGISTERED',
            entityType: 'Event',
            entityId: id
        });

        // Notify User (Confirmation)
        console.log(`[AUDIT] Notifying User ${userId} of Event Registration`);
        await sendNotification({
            recipientId: userId as string,
            recipientRole: role as any,
            title: 'Event Registration Confirmed',
            message: `You have successfully registered for ${event.title}.`,
            type: 'EVENT_REGISTERED',
            entityType: 'Event',
            entityId: id
        });

        return NextResponse.json({ message: 'Successfully registered' });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 }); // Catch server errors
    }
}
