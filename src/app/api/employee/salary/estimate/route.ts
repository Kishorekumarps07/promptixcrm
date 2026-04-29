import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { calculateEmployeeSalary } from '@/lib/salary-calculation';
import EmployeeSalaryProfile from '@/models/EmployeeSalaryProfile';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    await dbConnect();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        // Get current month and year
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // Get salary profile
        const profile = await EmployeeSalaryProfile.findOne({ employeeId: userId }).lean();
        if (!profile) {
            return NextResponse.json({ message: 'No salary profile found' }, { status: 404 });
        }

        // Calculate running estimate
        const estimate = await calculateEmployeeSalary(
            userId,
            profile.monthlySalary,
            month,
            year
        );

        return NextResponse.json({
            ...estimate,
            monthlySalary: profile.monthlySalary,
            month,
            year
        });
    } catch (error: any) {
        console.error('Error calculating salary estimate:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
