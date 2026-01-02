import { NextResponse } from 'next/server';
import Lesson from '@/models/Lesson';
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

// PUT: Reorder Lessons
export async function PUT(req: Request) {
    const userInfo = await getUserInfo();

    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { orderedIds } = await req.json(); // Array of Lesson IDs in desired order

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
        }

        // Validate all lessons belong to the same course to prevent cross-course injection
        const lessons = await Lesson.find({ _id: { $in: orderedIds } }).select('courseId');
        if (lessons.length !== orderedIds.length) {
            return NextResponse.json({ message: 'One or more lessons not found' }, { status: 404 });
        }

        const courseIds = new Set(lessons.map(l => l.courseId.toString()));
        if (courseIds.size > 1) {
            return NextResponse.json({ message: 'Cannot reorder lessons across different courses' }, { status: 400 });
        }

        // Bulk update using transactions or Promise.all
        // Promise.all is simpler for MongoDB without replica set requirements (though transactions are better)
        // Since we are just updating 'order', concurrent edits are rare here.

        const updates = orderedIds.map((id: string, index: number) => {
            return Lesson.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'LESSON_REORDERED',
                entityType: 'Course', // Logging at course level since it affects course structure
                entityId: lessons[0].courseId.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { count: orderedIds.length }
            });
        }

        return NextResponse.json({ message: 'Lessons reordered successfully' });
    } catch (error: any) {
        console.error('Error reordering lessons:', error);
        return NextResponse.json({ message: 'Failed to reorder lessons' }, { status: 500 });
    }
}
