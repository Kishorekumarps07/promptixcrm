import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';
import User from '@/models/User';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
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

        // We populate 'tasks' to enable the virtual progressPercentage calculation
        const goals = await Goal.find({})
            .populate('tasks')
            .populate('ownerId', 'name email role')
            .sort({ createdAt: -1 });

        return NextResponse.json({ goals });
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
        const { title, period, ownerId, status, description } = body;

        // Validation: Ensure ownerId is an Employee
        const targetUser = await User.findById(ownerId);
        if (!targetUser) {
            return NextResponse.json({ message: 'Goal owner not found' }, { status: 404 });
        }
        if (targetUser.role !== 'EMPLOYEE') {
            return NextResponse.json({ message: 'Goals can only be assigned to Employees' }, { status: 400 });
        }

        const goal = await Goal.create({
            title,
            period,
            ownerId,
            status: status || 'Not Started',
            description,
            createdBy: adminId,
        });

        // Notify the employee
        await sendNotification(
            ownerId,
            'New Goal Assigned',
            `You have been assigned a new goal: "${title}".`,
            'GOAL_ASSIGNED',
            '/employee/goals'
        );

        return NextResponse.json({ message: 'Goal created successfully', goal }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
