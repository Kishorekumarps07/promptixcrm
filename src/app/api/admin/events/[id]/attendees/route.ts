import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const event = await Event.findById(id).populate('attendees.user', 'name email');

        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 });

        const totalRegistrations = event.attendees.length;
        const attendedCount = event.attendees.filter((a: any) => a.status === 'Attended').length;
        const absentCount = event.attendees.filter((a: any) => a.status === 'Absent').length;

        // Calculate Average Rating
        const feedbacks = event.attendees
            .filter((a: any) => a.feedback && a.feedback.rating)
            .map((a: any) => a.feedback.rating);

        const avgRating = feedbacks.length > 0
            ? (feedbacks.reduce((a: number, b: number) => a + b, 0) / feedbacks.length).toFixed(1)
            : 'N/A';

        return NextResponse.json({
            event: {
                title: event.title,
                date: event.date,
                attendees: event.attendees
            },
            analytics: {
                totalRegistrations,
                attendedCount,
                absentCount,
                attendanceRate: totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0,
                avgRating
            }
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
