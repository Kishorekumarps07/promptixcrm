import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Holiday from '@/models/Holiday';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

// POST - Drop the unique index on date field
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only admins can drop indexes
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Get the Holiday collection
        const collection = (Holiday as any).collection;

        // Drop the unique index on date field
        try {
            await collection.dropIndex('date_1');
            return NextResponse.json({
                message: 'Successfully dropped unique index on date field',
                success: true
            });
        } catch (dropError: any) {
            // Index might not exist
            if (dropError.code === 27 || dropError.codeName === 'IndexNotFound') {
                return NextResponse.json({
                    message: 'Index already removed or does not exist',
                    success: true
                });
            }
            throw dropError;
        }

    } catch (error: any) {
        console.error('Error dropping index:', error);
        return NextResponse.json({
            message: error.message,
            error: error.toString()
        }, { status: 500 });
    }
}
