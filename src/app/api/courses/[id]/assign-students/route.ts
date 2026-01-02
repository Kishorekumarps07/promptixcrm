import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

import { sendNotification } from '@/lib/notification';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

// POST: Assign Students to Course (Admin Only)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { id: courseId } = await params;

    try {
        const { studentId } = await req.json(); // Expecting single studentId based on previous UI, or array?

        /* 
           If user sends array, loop. 
           But prompt implies singular logic or standard assignment. 
           Let's handle single studentId as per my previous UI modal, 
           but allow future expansion.
        */

        if (!studentId) {
            return NextResponse.json({ message: 'Student ID required' }, { status: 400 });
        }

        // Validate Course Status
        const course = await import('@/models/Course').then(mod => mod.default.findById(courseId));
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }
        if (course.status !== 'Active') {
            return NextResponse.json({ message: 'Cannot assign students to an inactive course' }, { status: 400 });
        }

        // Check if already enrolled in THIS course
        const existing = await CourseEnrollment.findOne({ studentId, courseId, status: 'Ongoing' });
        if (existing) {
            return NextResponse.json({ message: 'Student already enrolled in this course' }, { status: 400 });
        }

        // Deactivate ANY other Ongoing active course to enforce rule
        await CourseEnrollment.updateMany(
            { studentId, status: 'Ongoing' },
            { $set: { status: 'Inactive' } }
        );

        const enrollment = await CourseEnrollment.create({
            studentId,
            courseId,
            status: 'Ongoing'
        });

        // Notify Student
        console.log(`[AUDIT] Notifying Student ${studentId} of Course Assignment: ${course.title}`);
        await sendNotification({
            recipientId: studentId,
            recipientRole: 'STUDENT',
            title: 'New Course Assigned',
            message: `You have been enrolled in the course: ${course.title}`,
            type: 'COURSE_ASSIGNED',
            entityType: 'Course',
            entityId: courseId
        });

        return NextResponse.json({ message: 'Student assigned successfully', enrollment });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
