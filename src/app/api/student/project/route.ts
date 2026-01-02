import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.userId;

        const student = await User.findById(userId).populate('mentorId', 'name email');

        return NextResponse.json({
            title: student.projectTitle,
            status: student.internshipStatus, // 'Not Started', 'In Progress', 'Completed'
            mentor: student.mentorId ? {
                name: student.mentorId.name,
                email: student.mentorId.email
            } : null,
            remarks: student.projectFeedback
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
