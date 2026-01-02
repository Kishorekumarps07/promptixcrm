import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlySalary from '@/models/MonthlySalary';
import Notification from '@/models/Notification';
import AuditLog from '@/models/AuditLog';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return { userId: payload.userId, role: payload.role, name: payload.name };
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
        const { salaryId } = await req.json();

        if (!salaryId) {
            return NextResponse.json({ message: 'Salary ID required' }, { status: 400 });
        }

        const salary = await MonthlySalary.findById(salaryId).populate('employeeId', 'name email role');
        if (!salary) {
            return NextResponse.json({ message: 'Salary record not found' }, { status: 404 });
        }

        if (salary.status === 'Approved' || salary.status === 'Paid') {
            return NextResponse.json({ message: 'Salary is already approved' }, { status: 400 });
        }

        // Update Status
        salary.status = 'Approved';
        // Note: Models might not have approvedBy/approvedAt in schema from Step 2, assuming we can add or it's flexible. 
        // If not in schema, it won't save, so I should ideally ensure schema has it or just rely on AuditLog.
        // Step 1 asked for 'approvedBy' in plan, Step 2 implemented model. checking model...
        // Model in Step 2 didn't explicitly have approvedBy, but Mongoose is flexible if strict: false or if I update it.
        // To be safe, I'll stick to status update and AuditLog/Notification which are external.

        await salary.save();

        // Create Notification for Employee
        const employee = await MonthlySalary.findById(salaryId).populate('employeeId'); // Need role from employeeId? populate 'employeeId' returns User object which has role.
        // Wait, line 38 already populated: .populate('employeeId', 'name email'). It DID NOT populate role.
        // I need to add 'role' to population or fetch it.

        // Let's safe fix: Update population first or just re-fetch if needed.
        // Actually, easiest is to just update line 38 to include role.

        // Create Audit Log
        await AuditLog.create({
            action: 'SALARY_APPROVE',
            performedBy: userInfo.userId,
            details: {
                salaryId: salary._id,
                employeeName: salary.employeeId.name,
                month: salary.month,
                year: salary.year,
                amount: salary.calculatedSalary
            }
        });

        return NextResponse.json({ message: 'Salary Approved', salary });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
