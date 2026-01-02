import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const { userId, status } = body; // status: 'Attended' or 'Absent'

        const event = await Event.findById(id);
        console.log("Found Event:", event ? event.title : "Not Found", "Status:", event?.status);

        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });

        if (!['Upcoming', 'Ongoing', 'Completed'].includes(event.status)) {
            return NextResponse.json({ message: `Cannot mark attendance for ${event.status} events` }, { status: 400 });
        }

        console.log("Looking for user:", userId);
        console.log("Attendees:", event.attendees.map((a: any) => ({ u: a.user.toString(), s: a.status })));

        const attendee = event.attendees.find((a: any) => a.user.toString() === userId);
        if (!attendee) {
            console.log("Attendee NOT found");
            return NextResponse.json({ message: 'Attendee not found' }, { status: 404 });
        }

        console.log("Updating status to:", status);
        attendee.status = status;
        await event.save();

        return NextResponse.json({ message: 'Attendance updated' });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
