import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Holiday from '@/models/Holiday';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.role === 'ADMIN';
    } catch {
        return false;
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await context.params;

        // Find by ID and delete
        const result = await Holiday.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ message: 'Holiday not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Holiday deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting holiday:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
