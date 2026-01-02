import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
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

// GET: List Courses
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        let filter: any = {};

        // Students see only Active courses
        if (userInfo.role === 'STUDENT') {
            filter.status = 'Active';
        }
        // Employees and Admins can see all (or we could restrict Employees)
        // For now, let's allow Employees to see all to collaborate or view ecosystem

        const courses = await Course.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name'); // Show who created it

        return NextResponse.json({ courses });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// POST: Create Course
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only Admin and Employee can create
    if (!userInfo || (userInfo.role !== 'ADMIN' && userInfo.role !== 'EMPLOYEE')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const course = await Course.create({
            ...body,
            createdBy: userInfo.userId
        });

        // Audit Log
        if (userInfo.userId) {
            await logAction({
                action: 'COURSE_CREATED',
                entityType: 'Course',
                entityId: (course as any)._id.toString(),
                performedBy: userInfo.userId as string,
                role: userInfo.role as string,
                metadata: { title: (course as any).title, level: (course as any).level }
            });

            // Notify Admins (if Employee created it)
            // Even if Admin created it, maybe notify others? Request says: "Notify Admin when... Course... is created"
            // Let's protect against self-notification inside notifyAdmins if needed, or just broadcast.
            await notifyAdmins({
                title: 'New Course Created',
                message: `A new course "${(course as any).title}" has been created.`,
                type: 'COURSE_CREATED',
                entityType: 'Course',
                entityId: (course as any)._id.toString()
            });
        }

        return NextResponse.json({ message: 'Course created successfully', course });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
