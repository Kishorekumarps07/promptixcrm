import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlySalary from '@/models/MonthlySalary';
import EmployeeSalaryProfile from '@/models/EmployeeSalaryProfile';
import Attendance from '@/models/Attendance';
import User from '@/models/User'; // Ensure User model is loaded
import { getWorkingDaysInMonth } from '@/lib/salary-utils'; // You'll need to create/update this
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

export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { month, year, bypassDateCheck } = await req.json(); // bypassDateCheck for testing

        if (month === undefined || !year) {
            return NextResponse.json({ message: 'Month and Year required' }, { status: 400 });
        }

        // 1. Enforce 5th of Month Rule
        const now = new Date();
        const currentDay = now.getDate();

        // If we are trying to generate for previous months, we must be in the next month (at least)
        // Simplification: We usually generate for "Last Month".
        // If today is March 2nd (Year X), we can't generate Feb salary yet (Need 5th March).
        // If we try generating Jan salary in March, that's fine.

        // Logic: allow generation if (currentDate) >= (targetMonth + 1 month, 5th day).
        // Example: Target Feb (1). 
        // Earliest allowed: March (2) 5th.

        const generationThresholdDate = new Date(year, month + 1, 5); // 5th of Next Month

        // Reset times for clean comparison
        now.setHours(0, 0, 0, 0);
        generationThresholdDate.setHours(0, 0, 0, 0);

        if (now < generationThresholdDate && !bypassDateCheck) {
            return NextResponse.json({
                message: `Cannot generate salary before the 5th of the following month.`,
                minDate: generationThresholdDate
            }, { status: 400 });
        }

        // 2. Get Profiles
        const profiles = await EmployeeSalaryProfile.find({});
        if (profiles.length === 0) {
            return NextResponse.json({ message: 'No salary profiles found' }, { status: 404 });
        }

        const results = [];
        const errors = [];

        // 3. Loop Employees
        for (const profile of profiles) {
            try {
                // Check if already exists
                const existing = await MonthlySalary.findOne({
                    employeeId: profile.employeeId,
                    month,
                    year
                });

                if (existing) {
                    errors.push(`Salary already generated for employee ${profile.employeeId}`);
                    continue;
                }

                // Calculate Engine
                const workingDays = getWorkingDaysInMonth(month, year);
                const perDayRate = Number((profile.monthlySalary / workingDays).toFixed(2));

                // Fetch Approved Attendance
                // Start/End of that specific month
                const startOfMonth = new Date(year, month, 1);
                const endOfMonth = new Date(year, month + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);

                const attendanceCount = await Attendance.countDocuments({
                    userId: profile.employeeId,
                    status: 'Approved',
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                });

                // Unpaid Leaves (Future task technically, but field exists)
                // For now assuming hard deduction if prompt requested, 
                // but strictly speaking, if you aren't Present, you aren't paid.
                // Formula: Final Salary = Per Day Rate × Approved Present Days.
                // So we don't need to explicitly subtract leaves unless leaves count as "Present" in some systems (Paid Leave).
                // The prompt says "Unpaid leaves reduce salary" -> "Unpaid leave = absent".
                // So simply NOT counting them as present is sufficient deduction.

                const calculatedSalary = Number((perDayRate * attendanceCount).toFixed(2));

                // Create Record
                const record = await MonthlySalary.create({
                    employeeId: profile.employeeId,
                    month,
                    year,
                    workingDays,
                    presentDays: attendanceCount,
                    unpaidLeaveDays: 0, // Placeholder as we aren't querying this yet
                    perDayRate,
                    calculatedSalary,
                    status: 'Draft'
                });

                results.push(record);

            } catch (err: any) {
                console.error(`Error for ${profile.employeeId}:`, err);
                errors.push(err.message);
            }
        }

        return NextResponse.json({
            message: 'Generation completed',
            generatedCount: results.length,
            errors
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// GET: List Generated Salaries (Drafts or All)
export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) return NextResponse.json({ data: [] });

    try {
        const salaries = await MonthlySalary.find({
            month: parseInt(month),
            year: parseInt(year)
        })
            .populate('employeeId', 'name email')
            .sort({ generatedAt: -1 });

        return NextResponse.json({ data: salaries });
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 });
    }
}
