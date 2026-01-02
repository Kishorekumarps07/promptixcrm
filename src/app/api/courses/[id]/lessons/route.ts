import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Lesson from '@/models/Lesson';
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

// GET: List Lessons for a Course
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const userInfo = await getUserInfo();
    const { id } = await params;

    // Only Admin/Employee can access this generic route (Students use /api/student/...)
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Fetch lessons, sort by order
        const lessons = await Lesson.find({ courseId: id }).sort({ order: 1 });
        return NextResponse.json({ lessons });
    } catch (error: any) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ message: 'Failed to fetch lessons' }, { status: 500 });
    }
}

// POST: Create a new Lesson
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const userInfo = await getUserInfo();
    const { id } = await params;

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Find max order to append to end
        const lastLesson = await Lesson.findOne({ courseId: id }).sort({ order: -1 });
        const newOrder = lastLesson ? lastLesson.order + 1 : 0;

        const lesson = await Lesson.create({
            courseId: id,
            title: body.title,
            description: body.description,
            order: newOrder,
            status: 'Active',
            createdBy: userInfo.userId
        });

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'LESSON_CREATED',
                entityType: 'Lesson',
                entityId: lesson._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { courseId: id, title: lesson.title, order: newOrder }
            });

            // Notify Admins
            await notifyAdmins({
                title: 'New Lesson Added',
                message: `A new lesson "${lesson.title}" has been added to a course.`,
                type: 'LESSON_CREATED',
                entityType: 'Lesson',
                entityId: lesson._id.toString()
            });
        }

        return NextResponse.json({ message: 'Lesson created successfully', lesson }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating lesson:', error);
        if (error.name === 'ValidationError') {
            return NextResponse.json({ message: Object.values(error.errors).map((err: any) => err.message).join(', ') }, { status: 400 });
        }
        return NextResponse.json({ message: 'Failed to create lesson' }, { status: 500 });
    }
}
