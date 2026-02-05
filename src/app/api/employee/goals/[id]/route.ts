import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';
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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Ensure we find the goal AND it belongs to the user
        const goal = await Goal.findOne({ _id: id, ownerId: userId });

        if (!goal) {
            return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
        }

        if (status === 'Completed') {
            goal.status = 'Completed';
            goal.progressPercentage = 100;
            await goal.save();
        } else {
            return NextResponse.json({ message: 'Invalid status update' }, { status: 400 });
        }

        return NextResponse.json({ goal });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
