import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkSettings from '@/models/WorkSettings';
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

export async function GET() {
    await dbConnect();
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        let settings = await WorkSettings.findOne();
        if (!settings) {
            // Return default
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

export async function POST(req: Request) {
    await dbConnect();
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Use findOneAndUpdate with upsert to maintain singleton
        // We use an empty filter {} to match the first document
        const settings = await WorkSettings.findOneAndUpdate(
            {},
            { $set: body },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
