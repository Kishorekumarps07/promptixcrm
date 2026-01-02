import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseContent from '@/models/CourseContent';
import CourseEnrollment from '@/models/CourseEnrollment';
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

// GET: List Content for a Student (Must be enrolled)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'STUDENT') {
        return NextResponse.json({ message: 'Unauthorized. Student only.' }, { status: 403 });
    }

    const { id: courseId } = await params;

    try {
        // Verify Enrollment
        const enrollment = await CourseEnrollment.findOne({
            studentId: userInfo.userId,
            courseId: courseId
        });

        if (!enrollment) {
            return NextResponse.json({ message: 'You are not enrolled in this course.' }, { status: 403 });
        }

        const content = await CourseContent.find({ courseId })
            .select('title description fileType fileUrl uploadedAt lessonId') // Hide uploadedBy mostly relevant for admin
            .sort({ uploadedAt: -1 });

        return NextResponse.json({ content });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
