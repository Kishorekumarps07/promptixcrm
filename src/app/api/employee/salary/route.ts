import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlySalary from '@/models/MonthlySalary';
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

export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const salaryRecords = await MonthlySalary.find({ employeeId: userInfo.userId })
            .sort({ year: -1, month: -1 });

        return NextResponse.json({ data: salaryRecords });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
