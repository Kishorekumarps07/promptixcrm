import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import Goal from '@/models/Goal';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { recalculateGoalProgress } from '@/lib/goals';
import { sendNotification } from '@/lib/notifications';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getAdminId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return null;
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    try {
        const adminId = await getAdminId();
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const tasks = await Task.find({})
            .populate('assignedTo', 'name email role')
            .populate('goalId', 'title period')
            .sort({ createdAt: -1 });

        return NextResponse.json({ tasks });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const adminId = await getAdminId();
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, assignedTo, goalId, priority, status, dueDate } = body;

        // Validation: Ensure assignedTo is an Employee
        const targetUser = await User.findById(assignedTo);
        if (!targetUser) {
            return NextResponse.json({ message: 'Assigned user not found' }, { status: 404 });
        }
        if (targetUser.role !== 'EMPLOYEE') {
            return NextResponse.json({ message: 'Tasks can only be assigned to Employees' }, { status: 400 });
        }

        // Validation: If goalId is provided, ensure Goal exists
        if (goalId) {
            const goal = await Goal.findById(goalId);
            if (!goal) {
                return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
            }
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            goalId,
            priority: priority || 'Medium',
            status: status || 'Pending',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            assignedBy: adminId,
        });

        // Sync Goal Progress
        if (goalId) {
            await recalculateGoalProgress(goalId);
        }

        // Notify the employee
        await sendNotification(
            assignedTo,
            'New Task Assigned',
            `You have been assigned a new task: "${title}".`,
            'TASK_ASSIGNED',
            '/employee/tasks'
        );

        return NextResponse.json({ message: 'Task assigned successfully', task });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
