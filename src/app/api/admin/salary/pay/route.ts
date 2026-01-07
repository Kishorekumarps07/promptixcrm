import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MonthlySalary from '@/models/MonthlySalary';
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
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

// PATCH: Mark Salary as Paid
export async function PATCH(req: Request) {
    await dbConnect();
    const userInfo = await getUserInfo();

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { salaryId, paymentDate, paymentMethod, transactionReference } = await req.json();

        if (!salaryId) {
            return NextResponse.json({ message: 'Salary ID required' }, { status: 400 });
        }

        // Find the salary record
        const salary = await MonthlySalary.findById(salaryId).populate('employeeId', 'name email');

        if (!salary) {
            return NextResponse.json({ message: 'Salary record not found' }, { status: 404 });
        }

        // Check if salary is approved
        if (salary.status !== 'Approved') {
            return NextResponse.json({
                message: 'Only approved salaries can be marked as paid'
            }, { status: 400 });
        }

        // Update salary status to Paid
        salary.status = 'Paid';
        salary.paidAt = paymentDate ? new Date(paymentDate) : new Date();
        salary.paymentMethod = paymentMethod || 'Bank Transfer';
        salary.transactionReference = transactionReference || '';

        await salary.save();

        // Create audit log
        await AuditLog.create({
            userId: userInfo.userId,
            action: 'SALARY_PAID',
            targetModel: 'MonthlySalary',
            targetId: salary._id,
            details: {
                employeeId: salary.employeeId._id,
                employeeName: salary.employeeId.name,
                month: salary.month,
                year: salary.year,
                amount: salary.calculatedSalary,
                paymentMethod: salary.paymentMethod,
                transactionReference: salary.transactionReference,
                paidAt: salary.paidAt
            }
        });

        return NextResponse.json({
            message: 'Salary marked as paid successfully',
            data: salary
        });

    } catch (error: any) {
        console.error('Error marking salary as paid:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
