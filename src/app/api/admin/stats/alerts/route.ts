import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PasswordChangeRequest from '@/models/PasswordChangeRequest';
import LeaveRequest from '@/models/LeaveRequest';
import MonthlySalary from '@/models/MonthlySalary';
import Event from '@/models/Event';

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
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        const alerts = [];

        // Critical: Password requests older than 48 hours
        const oldPasswordRequests = await PasswordChangeRequest.countDocuments({
            status: 'Pending',
            createdAt: { $lt: twoDaysAgo }
        });

        if (oldPasswordRequests > 0) {
            alerts.push({
                id: 'password-requests-old',
                type: 'critical',
                priority: 1,
                title: `${oldPasswordRequests} Password Request${oldPasswordRequests > 1 ? 's' : ''} Pending (48h+)`,
                message: 'These requests have been waiting for more than 2 days',
                action: 'Review Requests',
                link: '/admin/security/password-requests',
                icon: '🔴',
                count: oldPasswordRequests
            });
        }

        // High: Leave requests older than 7 days
        const oldLeaveRequests = await LeaveRequest.countDocuments({
            status: 'Pending',
            createdAt: { $lt: sevenDaysAgo }
        });

        if (oldLeaveRequests > 0) {
            alerts.push({
                id: 'leave-requests-old',
                type: 'high',
                priority: 2,
                title: `${oldLeaveRequests} Leave Request${oldLeaveRequests > 1 ? 's' : ''} Awaiting Approval (7d+)`,
                message: 'Long pending leave requests need attention',
                action: 'Approve Leaves',
                link: '/admin/leaves',
                icon: '🟠',
                count: oldLeaveRequests
            });
        }

        // Medium: Draft salaries not approved (if past 10th of month)
        if (currentDay > 10) {
            const draftSalariesCount = await MonthlySalary.countDocuments({
                status: 'Draft',
                month: currentMonth,
                year: now.getFullYear()
            });

            if (draftSalariesCount > 0) {
                const monthName = now.toLocaleString('default', { month: 'long' });
                alerts.push({
                    id: 'salary-drafts',
                    type: 'medium',
                    priority: 3,
                    title: `${monthName} Salaries Not Finalized`,
                    message: `${draftSalariesCount} draft ${draftSalariesCount > 1 ? 'salaries' : 'salary'} pending approval`,
                    action: 'Review Drafts',
                    link: '/admin/salary/generate',
                    icon: '🟡',
                    count: draftSalariesCount
                });
            }
        }

        // Info: Upcoming events in next 7 days
        const upcomingEvents = await Event.countDocuments({
            date: { $gte: now, $lte: next7Days }
        });

        if (upcomingEvents > 0) {
            alerts.push({
                id: 'upcoming-events',
                type: 'info',
                priority: 4,
                title: `${upcomingEvents} Upcoming Event${upcomingEvents > 1 ? 's' : ''} This Week`,
                message: 'Events scheduled in the next 7 days',
                action: 'View Events',
                link: '/admin/events',
                icon: '🔵',
                count: upcomingEvents
            });
        }

        // Sort by priority
        alerts.sort((a, b) => a.priority - b.priority);

        return NextResponse.json({
            alerts,
            total: alerts.length,
            critical: alerts.filter(a => a.type === 'critical').length,
            high: alerts.filter(a => a.type === 'high').length,
            medium: alerts.filter(a => a.type === 'medium').length
        });

    } catch (err: any) {
        console.error('Admin Alerts Error:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
