import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

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

// POST: Enroll a Student
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only Admin can manually enroll students (as per prompt "Admin -> assign students")
    // Employee permissions weren't explicitly detailed for assignment, assume Admin only for strict control
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    try {
        const { studentId, courseId } = await req.json();

        // Check if already enrolled
        const existing = await CourseEnrollment.findOne({ studentId, courseId });
        if (existing) {
            return NextResponse.json({ message: 'Student already enrolled' }, { status: 400 });
        }

        const enrollment = await CourseEnrollment.create({
            studentId,
            courseId,
            status: 'Ongoing'
        });

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'STUDENT_ENROLLED',
                entityType: 'CourseEnrollment',
                entityId: enrollment._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { studentId, courseId }
            });
        }

        return NextResponse.json({ message: 'Student enrolled successfully', enrollment });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
