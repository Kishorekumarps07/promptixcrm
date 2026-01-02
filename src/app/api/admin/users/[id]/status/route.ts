import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAction } from '@/lib/audit';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getAdminId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return null;
        return payload.userId as string;
    } catch {
        return null;
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const { status } = await req.json();

        if (!['Active', 'Inactive'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(id, { status }, { new: true });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Audit Log
        await logAction({
            action: status === 'Active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
            entityType: 'User',
            entityId: id,
            performedBy: adminId,
            role: 'ADMIN',
            metadata: { email: user.email, status }
        });

        return NextResponse.json({ message: 'User updated', user });
    } catch (err: any) {
        // Add console.error log for failed update
        console.error(`[ERROR] User Update Failed: ${err.message}`);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
