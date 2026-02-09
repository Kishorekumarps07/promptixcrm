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

// POST - Migrate existing holidays to new schema
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Only admins can migrate
    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Update all existing holidays with old 'Holiday' type to 'Custom'
        const result = await Holiday.updateMany(
            {
                $or: [
                    { type: 'Holiday' },
                    { type: 'Weekend' },
                    { type: { $exists: false } }
                ]
            },
            {
                $set: {
                    type: 'Custom',
                    region: 'All India',
                    isGovernmentHoliday: false
                }
            }
        );

        return NextResponse.json({
            message: 'Migration successful',
            updated: result.modifiedCount
        });

    } catch (error: any) {
        console.error('Error migrating holidays:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
