import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseEnrollment from '@/models/CourseEnrollment';
import Course from '@/models/Course'; // Ensure Course model is loaded
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

// GET: Get My Courses (Student)
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (userInfo.role !== 'STUDENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    try {
        // Find enrollments for this user
        const enrollments = await CourseEnrollment.find({ studentId: userInfo.userId })
            .populate({
                path: 'courseId',
                select: 'title description category duration status createdBy', // Select fields
                populate: { path: 'createdBy', select: 'name' } // Nested populate for creator? Optional.
            });

        // Map to a cleaner structure if desired, or return as is.
        // Returning enrollments is better as it contains status (Ongoing/Completed).
        return NextResponse.json({ enrollments });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
