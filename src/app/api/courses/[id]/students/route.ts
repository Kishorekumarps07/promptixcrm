import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User'; // Ensure User model loaded
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

// GET: List Students in a Course
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const { id } = await params; // course id

    try {
        const enrollments = await CourseEnrollment.find({ courseId: id })
            .populate('studentId', 'name email phone');

        const students = enrollments.map((enrollment: any) => ({
            _id: enrollment.studentId._id,
            name: enrollment.studentId.name,
            email: enrollment.studentId.email,
            phone: enrollment.studentId.phone,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            enrollmentId: enrollment._id
        }));

        return NextResponse.json({ students });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
