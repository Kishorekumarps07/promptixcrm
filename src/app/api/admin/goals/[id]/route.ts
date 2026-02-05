import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Goal from '@/models/Goal';
import User from '@/models/User';
import Task from '@/models/Task';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const adminId = await getAdminId();
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, period, ownerId, status, description } = body;

        // Validation: If ownerId is being changed, ensure it's still an Employee
        if (ownerId) {
            const targetUser = await User.findById(ownerId);
            if (!targetUser) {
                return NextResponse.json({ message: 'Goal owner not found' }, { status: 404 });
            }
            if (targetUser.role !== 'EMPLOYEE') {
                return NextResponse.json({ message: 'Goals can only be assigned to Employees' }, { status: 400 });
            }
        }

        const goal = await Goal.findByIdAndUpdate(
            params.id,
            { title, period, ownerId, status, description },
            { new: true }
        ).populate('tasks');

        if (!goal) {
            return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Goal updated successfully', goal });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const adminId = await getAdminId();
        if (!adminId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const goalId = params.id;

        // Detach tasks instead of deleting them
        await Task.updateMany({ goalId: goalId }, { $set: { goalId: null } });

        const goal = await Goal.findByIdAndDelete(goalId);

        if (!goal) {
            return NextResponse.json({ message: 'Goal not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Goal deleted and tasks detached successfully' });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
