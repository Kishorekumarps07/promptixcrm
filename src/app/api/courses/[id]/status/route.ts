import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
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

// PATCH: Update Course Status (Admin Only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const { status } = await req.json();

        if (!['Active', 'Inactive'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const course = await Course.findByIdAndUpdate(id, { status }, { new: true });
        if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

        return NextResponse.json({ message: 'Course status updated', course });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
