import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmployeeSalaryProfile from '@/models/EmployeeSalaryProfile';
import User from '@/models/User';
import { getWorkingDaysInMonth } from '@/lib/salary-utils';
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

// GET: Fetch all profiles (merged with Employees)
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // 1. Get all employees
        const employees = await User.find({ role: { $in: ['EMPLOYEE', 'ADMIN'] } })
            .select('name email role photo')
            .lean();

        // 2. Get all salary profiles
        const profiles = await EmployeeSalaryProfile.find({}).lean();

        // 3. Current month info for dynamic rate calc
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const workingDays = getWorkingDaysInMonth(currentMonth, currentYear);

        // 4. Merge
        const merged = employees.map(emp => {
            const profile = profiles.find(p => p.employeeId.toString() === emp._id.toString());
            let perDayRate = 0;
            if (profile) {
                perDayRate = Number((profile.monthlySalary / workingDays).toFixed(2));
            }

            return {
                ...emp,
                salaryProfile: profile || null,
                currentMonthWorkingDays: workingDays,
                calculatedPerDayRate: perDayRate
            };
        });

        return NextResponse.json({ employees: merged });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create or Update Profile
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { employeeId, monthlySalary, effectiveFrom } = await req.json();

        if (!employeeId || !monthlySalary) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const profile = await EmployeeSalaryProfile.findOneAndUpdate(
            { employeeId },
            {
                monthlySalary: Number(monthlySalary),
                effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
                createdBy: userInfo.userId
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ message: 'Salary profile saved', profile });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
