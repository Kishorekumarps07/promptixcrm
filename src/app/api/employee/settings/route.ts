import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkSettings from '@/models/WorkSettings';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function GET() {
    await dbConnect();
    if (!(await checkAuth())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        let settings = await WorkSettings.findOne();
        if (!settings) {
            // Return default if not found
            settings = {
                shiftStartTime: '09:00',
                gracePeriodMinutes: 60,
                weeklyOffs: [0]
            };
        }
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
