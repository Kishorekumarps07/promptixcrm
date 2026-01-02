import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const adminId = await getAdminId();
        const updated = await LeaveRequest.findByIdAndUpdate(
            id,
            { status: 'Approved', reviewedBy: adminId },
            { new: true }
        );
        return NextResponse.json({ message: 'Leave Approved', leave: updated });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
