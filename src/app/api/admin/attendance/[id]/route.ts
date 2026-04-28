import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role as string };
    } catch {
        return null;
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const record = await Attendance.findById(id);
        if (!record) {
            return NextResponse.json({ message: 'Attendance record not found' }, { status: 404 });
        }

        if (record.isLocked) {
            return NextResponse.json({ message: 'This record is locked and cannot be deleted.' }, { status: 400 });
        }

        await Attendance.findByIdAndDelete(id);

        // Audit Log
        await logAction({
            action: 'ATTENDANCE_DELETE',
            entityType: 'Attendance',
            entityId: id,
            performedBy: userInfo.userId,
            role: 'ADMIN',
            metadata: { date: record.date, userId: record.userId }
        });

        return NextResponse.json({ message: 'Attendance record deleted' });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
