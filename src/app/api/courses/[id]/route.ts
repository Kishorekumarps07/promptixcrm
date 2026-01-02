import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';
import { sendNotification, notifyAdmins } from '@/lib/notification';
import CourseEnrollment from '@/models/CourseEnrollment';

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

// GET: Single Course Details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const course = await Course.findById(id).populate('createdBy', 'name');
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        return NextResponse.json({ course });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// PUT: Update Course
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    const { id } = await params;

    try {
        const body = await req.json();

        // Strict Role Check: Employees cannot change status (Admin only)
        if (userInfo.role === 'EMPLOYEE' && body.status) {
            delete body.status;
        }

        const course = await Course.findByIdAndUpdate(id, body, { new: true });
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

        // Audit Log
        if (course) {
            await logAction({
                action: 'COURSE_UPDATED',
                entityType: 'Course',
                entityId: id,
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { title: course.title, changes: Object.keys(body) }
            });

            // Notify Admins
            await notifyAdmins({
                title: 'Course Updated',
                message: `Course "${course.title}" has been updated.`,
                type: 'COURSE_UPDATED',
                entityType: 'Course',
                entityId: id
            });

            // Notify Enrolled Students
            // Only if important fields changed? Request says "Course is assigned or updated".
            // Let's fetch active enrollments.
            const enrollments = await CourseEnrollment.find({ courseId: id, status: 'Ongoing' }).select('studentId');

            // Loop send (Not ideal for 1000s, but fine for MVP)
            // Or use insertMany if we exposed a bulk helper. For now, loop sendNotification (it's async/fire-and-forget).
            for (const enrollment of enrollments) {
                await sendNotification({
                    recipientId: enrollment.studentId.toString(),
                    recipientRole: 'STUDENT',
                    title: 'Course Updated',
                    message: `The course "${course.title}" you are enrolled in has been updated.`,
                    type: 'COURSE_UPDATED',
                    entityType: 'Course',
                    entityId: id
                });
            }
        }

        return NextResponse.json({ message: 'Course updated', course });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// DELETE: Delete/Deactivate Course
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    // Only Admin can delete/deactivate? Prompt said: "Admin -> create, edit, deactivate". 
    // "Employee -> create, edit". So check for ADMIN.
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized. Admin only.' }, { status: 403 });
    }
    const { id } = await params;

    try {
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

        // Audit Log
        await logAction({
            action: 'COURSE_DELETED',
            entityType: 'Course',
            entityId: id,
            performedBy: userInfo.userId as string,
            role: userInfo.role as string,
            metadata: { title: deletedCourse.title }
        });

        return NextResponse.json({ message: 'Course deleted' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
