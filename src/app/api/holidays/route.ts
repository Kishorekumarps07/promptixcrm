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

// GET - Fetch holidays (accessible to all authenticated users)
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    // Require authentication but allow both employees and admins
    if (!userInfo) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        // Build query
        const query: any = {};

        if (year && month !== null) {
            // Filter by specific month/year
            const startDate = new Date(parseInt(year), parseInt(month), 1);
            const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);
            endDate.setHours(23, 59, 59, 999);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        } else if (year) {
            // Filter by year only
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31);
            endDate.setHours(23, 59, 59, 999);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Fetch holidays sorted by date
        const holidays = await Holiday.find(query)
            .sort({ date: 1 })
            .lean();

        return NextResponse.json({
            holidays,
            count: holidays.length
        });

    } catch (error: any) {
        console.error('Error fetching holidays:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
