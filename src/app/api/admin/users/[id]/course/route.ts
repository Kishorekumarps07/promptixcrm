import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User';
import Course from '@/models/Course'; // Ensure Course model is registered
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';
import { sendNotification } from '@/lib/notification';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role as string };
    } catch {
        return null;
    }
}

// PUT: Assign/Update Course for Student
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params; // studentId
        const body = await req.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
        }

        // 1. Verify user is a student
        const student = await User.findById(id);
        if (!student || student.role !== 'STUDENT') {
            return NextResponse.json({ message: 'Target user is not a student' }, { status: 400 });
        }

        // 1.5 Verify Course exists and is Active
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }
        if (course.status !== 'Active') {
            return NextResponse.json({ message: 'Cannot assign an inactive course' }, { status: 400 });
        }

        // 2. Mark previous ongoing enrollments as Inactive
        await CourseEnrollment.updateMany(
            { studentId: id, status: 'Ongoing' },
            { $set: { status: 'Inactive' } }
        );

        // 3. Create new enrollment
        const enrollment = await CourseEnrollment.create({
            studentId: id,
            courseId: courseId,
            status: 'Ongoing',
            enrolledAt: new Date()
        });

        // Notify Student
        await sendNotification({
            recipientId: id,
            recipientRole: 'STUDENT',
            title: 'New Course Assigned',
            message: `You have been assigned to the course: ${course.title}.`,
            type: 'COURSE_ASSIGNED',
            entityType: 'Course',
            entityId: courseId
        });

        // 4. (Optional) Sync legacy field if maintained, but we are using Aggregation now. 
        // student.course = ...; await student.save(); 

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'STUDENT_COURSE_ASSIGNED',
                entityType: 'CourseEnrollment',
                entityId: enrollment._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { studentId: id, courseId: courseId, courseTitle: course.title }
            });
        }

        return NextResponse.json({
            message: 'Course assigned successfully',
            enrollment
        });

    } catch (err: any) {
        console.error('Course Assignment Error:', err);
        return NextResponse.json({ message: err.message || 'Failed to assign course' }, { status: 500 });
    }
}
