import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Event from '@/models/Event';
import CourseEnrollment from '@/models/CourseEnrollment';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId;

        const student = await User.findById(userId).populate('mentorId', 'name email');

        // Upcoming Events
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const upcomingEvents = await Event.countDocuments({
            date: { $gte: today, $lte: nextWeek },
            isActive: true,
            type: { $ne: 'Announcement' }
        });

        // Announcements (Latest 3)
        const announcements = await Event.find({
            type: 'Announcement',
            isActive: true
        }).sort({ createdAt: -1 }).limit(3);

        // Fetch Active Course
        const enrollment = await CourseEnrollment.findOne({
            studentId: userId,
            status: 'Ongoing'
        }).populate('courseId', 'title category');

        const activeCourse = enrollment && enrollment.courseId ? enrollment.courseId : null;

        return NextResponse.json({
            program: activeCourse ? `${activeCourse.title} (${activeCourse.category})` : 'Not Assigned',
            courseCategory: activeCourse?.category, // Optional separate field if needed UI-side
            mentor: student.mentorId ? student.mentorId.name : 'Unassigned',
            mentorEmail: student.mentorId ? student.mentorId.email : '',
            status: student.internshipStatus,
            project: student.projectTitle || 'Not Assigned',
            upcomingEvents,
            announcements
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
