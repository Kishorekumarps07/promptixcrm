import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseContent from '@/models/CourseContent';
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

// GET: List Content for a Course
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();
    const { id: courseId } = await params;

    // Students can view, Admins/Employees can view
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const content = await CourseContent.find({ courseId }).sort({ uploadedAt: -1 }).populate('uploadedBy', 'name');
        return NextResponse.json({ content });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// POST: Add Content to Course (Metadata Only - File Uploaded Client-Side)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only Admin/Employee can upload
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id: courseId } = await params;

    try {
        const { title, description, fileType, fileUrl, lessonId } = await req.json();

        if (!title || !fileType || !fileUrl) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Validate Course Status
        const course = await import('@/models/Course').then(mod => mod.default.findById(courseId));
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }
        if (course.status !== 'Active') {
            return NextResponse.json({ message: 'Cannot upload content to an inactive course' }, { status: 400 });
        }

        const newContent = await CourseContent.create({
            courseId,
            lessonId: lessonId || undefined,
            title,
            description,
            fileType,
            fileUrl,
            uploadedBy: userInfo.userId
        });

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'COURSE_CONTENT_UPLOADED',
                entityType: 'CourseContent',
                entityId: newContent._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { courseId: courseId, title: title, type: fileType }
            });
        }

        return NextResponse.json({ message: 'Content added successfully', content: newContent });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
