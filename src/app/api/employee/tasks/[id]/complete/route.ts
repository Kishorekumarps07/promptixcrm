import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { recalculateGoalProgress } from '@/lib/goals';

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Security: Fetch task and check ownership
        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        }
        if (task.assignedTo.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden: You cannot modify this task' }, { status: 403 });
        }

        // Mark as completed
        task.status = 'Completed';
        // Note: The pre-save hook in the model will automatically:
        // 1. Set progressPercentage to 100
        // 2. Set completedAt to current time

        await task.save();

        // Sync Goal Progress
        if (task.goalId) {
            await recalculateGoalProgress(task.goalId.toString());
        }

        return NextResponse.json({ message: 'Task marked as completed', task });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
