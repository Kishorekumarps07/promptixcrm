import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
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

export async function GET() {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Determine visibility based on role
        // Admins see all. Employees see All + Employees. Students see All + Students.
        let filter: any = { target: 'All' };
        if (userInfo.role === 'ADMIN') {
            filter = {}; // All
        } else if (userInfo.role === 'EMPLOYEE') {
            filter = { target: { $in: ['All', 'Employees'] } };
        } else if (userInfo.role === 'STUDENT') {
            filter = { target: { $in: ['All', 'Students'] } };
        }

        const announcements = await Announcement.find(filter).sort({ date: -1 });
        return NextResponse.json({ announcements });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const announcement = await Announcement.create({
            ...body,
            createdBy: userInfo.userId
        });
        return NextResponse.json({ announcement });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
