import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlySalary from '@/models/MonthlySalary';
import EmployeeSalaryProfile from '@/models/EmployeeSalaryProfile';
import User from '@/models/User';
import { calculateEmployeeSalary } from '@/lib/salary-calculation';
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

// GET - Fetch salary records for a specific employee
export async function GET(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get('employeeId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!employeeId) {
            return NextResponse.json({ message: 'Employee ID required' }, { status: 400 });
        }

        // Build query
        const query: any = { employeeId };
        if (month !== null) query.month = parseInt(month);
        if (year !== null) query.year = parseInt(year);

        // Fetch salary records
        const salaries = await MonthlySalary.find(query)
            .populate('employeeId', 'name email')
            .sort({ year: -1, month: -1 })
            .lean();

        // Fetch employee profile
        const profile = await EmployeeSalaryProfile.findOne({ employeeId })
            .populate('employeeId', 'name email')
            .lean();

        return NextResponse.json({
            salaries,
            profile,
            employee: profile?.employeeId || null
        });

    } catch (error: any) {
        console.error('Error fetching individual salary:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST - Generate or preview salary for individual employee
export async function POST(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { employeeId, month, year, preview = false } = await req.json();

        if (!employeeId || month === undefined || !year) {
            return NextResponse.json({
                message: 'Employee ID, month, and year are required'
            }, { status: 400 });
        }

        // Check if already exists (unless preview mode)
        const existing = await MonthlySalary.findOne({
            employeeId,
            month,
            year
        });

        if (existing && !preview) {
            return NextResponse.json({
                message: 'Salary already generated for this period',
                salary: existing
            }, { status: 400 });
        }

        // Get employee salary profile
        const profile = await EmployeeSalaryProfile.findOne({ employeeId });
        if (!profile) {
            return NextResponse.json({
                message: 'No salary profile found for this employee'
            }, { status: 404 });
        }

        // Calculate salary breakdown
        const breakdown = await calculateEmployeeSalary(
            employeeId,
            profile.monthlySalary,
            month,
            year
        );

        // If preview mode, return calculation without saving
        if (preview) {
            return NextResponse.json({
                preview: true,
                breakdown,
                monthlySalary: profile.monthlySalary
            });
        }

        // Create and save salary record
        const record = await MonthlySalary.create({
            employeeId,
            month,
            year,
            workingDays: breakdown.workingDays,
            presentDays: breakdown.fullDayCount,
            halfDays: breakdown.halfDayCount,
            paidLeaveDays: breakdown.paidLeaveDays,
            unpaidLeaveDays: breakdown.unpaidLeaveDays,
            perDayRate: breakdown.perDayRate,
            calculatedSalary: breakdown.calculatedSalary,
            status: 'Draft'
        });

        const populatedRecord = await MonthlySalary.findById(record._id)
            .populate('employeeId', 'name email')
            .lean();

        return NextResponse.json({
            message: 'Salary generated successfully',
            salary: populatedRecord,
            saved: true
        });

    } catch (error: any) {
        console.error('Error generating individual salary:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
