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

export async function GET(req: Request) {
    await dbConnect();
    if (!(await checkAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    try {
        const query: any = {};
        if (year) {
            const y = parseInt(year);
            const start = new Date(y, 0, 1);
            const end = new Date(y + 1, 0, 0); // End of year

            if (month) {
                const m = parseInt(month);
                const monthStart = new Date(y, m, 1);
                const monthEnd = new Date(y, m + 1, 0);
                query.date = { $gte: monthStart, $lte: monthEnd };
            } else {
                query.date = { $gte: start, $lte: end };
            }
        }

        const holidays = await Holiday.find(query).sort({ date: 1 });
        return NextResponse.json(holidays);
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
        const { date, name, type } = await req.json();

        if (!date || !name) {
            return NextResponse.json({ message: 'Date and Name required' }, { status: 400 });
        }

        const holiday = await Holiday.create({
            date: new Date(date),
            name,
            type: type || 'Holiday'
        });

        return NextResponse.json(holiday);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Holiday already exists on this date' }, { status: 400 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
