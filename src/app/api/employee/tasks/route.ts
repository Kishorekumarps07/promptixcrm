import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const tasks = await Task.find({ assignedTo: userId })
            .populate('goalId', 'title period')
            .sort({ createdAt: -1 });

        return NextResponse.json({ tasks });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
