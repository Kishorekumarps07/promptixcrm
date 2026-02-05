import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';
// Ensure Task model is registered for population
import '@/models/Task';
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

        // Fetch goals where owner is the current user
        // Populate 'tasks' (virtual) to show details
        const goals = await Goal.find({ ownerId: userId })
            .populate({
                path: 'tasks',
                select: 'title status progressPercentage priority', // Select only needed fields
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ goals });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
