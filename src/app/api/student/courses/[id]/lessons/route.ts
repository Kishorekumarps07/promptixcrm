import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';
import CourseEnrollment from '@/models/CourseEnrollment';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

// GET: List Lessons for a Student (Must be enrolled & Course must be Active)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    const { id: courseId } = await params;

    if (!userInfo || userInfo.role !== 'STUDENT') {
        return NextResponse.json({ message: 'Unauthorized. Student only.' }, { status: 403 });
    }

    try {
        // 1. Check Course Status
        const course = await mongoose.model('Course').findById(courseId);
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        if (course.status !== 'Active') {
            return NextResponse.json({ message: 'This course is currently inactive.' }, { status: 403 });
        }

        // 2. Verify Enrollment
        const enrollment = await CourseEnrollment.findOne({
            studentId: userInfo.userId,
            courseId: courseId
        });

        if (!enrollment) {
            return NextResponse.json({ message: 'You are not enrolled in this course.' }, { status: 403 });
        }

        // 3. Fetch Active Lessons
        const lessons = await Lesson.find({
            courseId,
            status: 'Active' // Students only see active lessons
        }).sort({ order: 1 });

        return NextResponse.json({ lessons });
    } catch (err: any) {
        console.error('Student Lesson Fetch Error:', err);
        return NextResponse.json({ message: 'Failed to fetch lessons' }, { status: 500 });
    }
}
