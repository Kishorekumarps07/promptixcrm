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

    if (!userInfo || userInfo.role !== 'EMPLOYEE') {
        return NextResponse.json({ message: 'Unauthorized - Employee access only' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Build query - ONLY for the logged-in employee
        const query: any = { employeeId: userInfo.userId };
        if (month !== null) query.month = parseInt(month);
        if (year !== null) query.year = parseInt(year);

        // Fetch salary records for logged-in employee only
        const salaryRecords = await MonthlySalary.find(query)
            .populate('employeeId', 'name email')
            .sort({ year: -1, month: -1 });

        // Fetch employee's salary profile
        const EmployeeSalaryProfile = (await import('@/models/EmployeeSalaryProfile')).default;
        const profile = await EmployeeSalaryProfile.findOne({ employeeId: userInfo.userId }).lean();

        return NextResponse.json({
            data: salaryRecords,
            profile,
            monthlySalary: profile?.monthlySalary || 0
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
