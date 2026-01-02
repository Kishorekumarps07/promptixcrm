import { NextResponse } from 'next/server';
import Lesson from '@/models/Lesson';
import CourseContent from '@/models/CourseContent';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';
import { notifyAdmins } from '@/lib/notification';

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

// PUT: Update Lesson
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const userInfo = await getUserInfo();
    const { id } = await params;

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const lesson = await Lesson.findByIdAndUpdate(
            id,
            {
                title: body.title,
                description: body.description,
                status: body.status
            },
            { new: true, runValidators: true }
        );

        if (!lesson) {
            return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
        }

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'LESSON_UPDATED',
                entityType: 'Lesson',
                entityId: id,
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { title: lesson.title, changes: Object.keys(body) }
            });

            // Notify Admins
            await notifyAdmins({
                title: 'Lesson Updated',
                message: `Lesson "${lesson.title}" has been updated.`,
                type: 'LESSON_UPDATED',
                entityType: 'Lesson',
                entityId: id
            });
        }

        return NextResponse.json({ message: 'Lesson updated', lesson });
    } catch (error: any) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ message: 'Failed to update lesson' }, { status: 500 });
    }
}

// DELETE: Delete Lesson
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const userInfo = await getUserInfo();
    const { id } = await params;

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
        }

        // Logic choice: Delete all content associated with this lesson OR restrict delete?
        // User didn't specify, but "Delete" usually implies cleanup or cascading.
        // For safety, let's just detach content for now (set lessonId to null) or delete it.
        // Given hierarchies, deleting the lesson usually means deleting the structural container.
        // Let's detach the content so it doesn't disappear unexpectedly, effectively moving it to "General".

        await CourseContent.updateMany({ lessonId: id }, { $unset: { lessonId: "" } });
        await Lesson.findByIdAndDelete(id);

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'LESSON_DELETED',
                entityType: 'Lesson',
                entityId: id,
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { title: lesson.title }
            });
        }

        return NextResponse.json({ message: 'Lesson deleted successfully. Content moved to general.' });
    } catch (error: any) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ message: 'Failed to delete lesson' }, { status: 500 });
    }
}
