import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Event from '@/models/Event';
import LeaveRequest from '@/models/LeaveRequest';
import Attendance from '@/models/Attendance';
import MonthlySalary from '@/models/MonthlySalary';
import PasswordChangeRequest from '@/models/PasswordChangeRequest';
import Goal from '@/models/Goal';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function GET() {
    await dbConnect();

    // Secure this route
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    } catch {
        return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    try {
        // Date calculations for trends and weekly data
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            // Current counts
            employees,
            events,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            pendingAttendance,
            approvedAttendance,

            // Salary stats
            draftSalaries,
            approvedSalaries,
            paidSalaries,

            // Password requests
            pendingPasswordRequests,

            // Goals
            activeGoals,

            // Trend data (last month)
            employeesLastMonth,

            // Weekly attendance data
            weeklyAttendance,

            // Salary Trends
            salaryTrends
        ] = await Promise.all([
            // Current counts
            User.countDocuments({ role: 'EMPLOYEE' }),
            Event.countDocuments({}),
            LeaveRequest.countDocuments({ status: 'Pending' }),
            LeaveRequest.countDocuments({ status: 'Approved' }),
            LeaveRequest.countDocuments({ status: 'Rejected' }),
            Attendance.countDocuments({ status: 'Pending' }),
            Attendance.countDocuments({ status: 'Approved' }),

            // Salary stats
            MonthlySalary.countDocuments({ status: 'Draft' }),
            MonthlySalary.countDocuments({ status: 'Approved' }),
            MonthlySalary.countDocuments({ status: 'Paid' }),

            // Password requests
            PasswordChangeRequest.countDocuments({ status: 'Pending' }),

            // Goals
            Goal.countDocuments({ status: { $ne: 'Completed' } }),

            // Trend data (last month comparison)
            User.countDocuments({
                role: 'EMPLOYEE',
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }),

            // Weekly attendance (last 7 days)
            Attendance.aggregate([
                {
                    $match: {
                        date: { $gte: last7Days, $lte: now }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                            status: '$status'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ]),
            // Salary Trends (Last 6 months)
            MonthlySalary.aggregate([
                {
                    $match: {
                        status: { $in: ['Paid', 'Approved'] },
                        $or: [
                            { year: now.getFullYear(), month: { $lte: now.getMonth() } },
                            { year: now.getFullYear() - 1, month: { $gt: now.getMonth() } }
                        ]
                    }
                },
                {
                    $group: {
                        _id: { month: '$month', year: '$year' },
                        totalAmount: { $sum: '$calculatedSalary' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 6 }
            ])
        ]);

        // Process Salary Trends
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const salaryTrendsData = salaryTrends.map((item: any) => ({
            name: `${monthNames[item._id.month]} ${item._id.year}`,
            amount: item.totalAmount,
            count: item.count
        }));

        // Process weekly attendance data into chart format
        const attendanceMap = new Map();
        weeklyAttendance.forEach((item: any) => {
            const date = item._id.date;
            if (!attendanceMap.has(date)) {
                attendanceMap.set(date, { date, Pending: 0, Approved: 0, Rejected: 0 });
            }
            const entry = attendanceMap.get(date);
            entry[item._id.status] = item.count;
        });

        const weeklyAttendanceData = Array.from(attendanceMap.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate trends
        const employeeTrend = employeesLastMonth > 0
            ? ((employees - employeesLastMonth) / employeesLastMonth * 100).toFixed(1)
            : 0;

        return NextResponse.json({
            employees,
            events,
            pendingLeaves,
            goals: {
                active: activeGoals
            },
            leaves: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves,
                total: pendingLeaves + approvedLeaves + rejectedLeaves
            },
            attendance: {
                pending: pendingAttendance,
                approved: approvedAttendance,
                total: pendingAttendance + approvedAttendance
            },
            salary: {
                draft: draftSalaries,
                approved: approvedSalaries,
                paid: paidSalaries,
                total: draftSalaries + approvedSalaries + paidSalaries
            },
            passwordRequests: {
                pending: pendingPasswordRequests
            },
            weeklyAttendance: weeklyAttendanceData,
            trends: {
                employees: Number(employeeTrend)
            },
            salaryTrends: salaryTrendsData
        });
    } catch (err: any) {
        console.error('Admin Stats Error:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
