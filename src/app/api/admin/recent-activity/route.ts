import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

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
        // Fetch last 15 audit log entries
        const activities = await AuditLog.find({})
            .sort({ timestamp: -1 })
            .limit(15)
            .select('action performedBy details timestamp')
            .lean();

        // Format activities with user-friendly messages and icons
        const formattedActivities = activities.map((activity: any) => {
            let icon = '📋';
            let message = activity.action;
            let color = 'gray';

            switch (activity.action) {
                case 'USER_CREATED':
                    icon = '👤';
                    message = `New user registered: ${activity.details?.name || 'User'}`;
                    color = 'green';
                    break;
                case 'ATTENDANCE_MARKED':
                    icon = '✅';
                    message = `Attendance marked by ${activity.performedBy}`;
                    color = 'blue';
                    break;
                case 'ATTENDANCE_APPROVED':
                    icon = '🟢';
                    message = `Attendance approved for ${activity.details?.userName || 'user'}`;
                    color = 'green';
                    break;
                case 'LEAVE_REQUESTED':
                    icon = '📝';
                    message = `Leave request submitted by ${activity.performedBy}`;
                    color = 'yellow';
                    break;
                case 'LEAVE_APPROVED':
                    icon = '✅';
                    message = `Leave approved for ${activity.details?.userName || activity.performedBy}`;
                    color = 'green';
                    break;
                case 'LEAVE_REJECTED':
                    icon = '❌';
                    message = `Leave rejected for ${activity.details?.userName || activity.performedBy}`;
                    color = 'red';
                    break;
                case 'SALARY_GENERATED':
                    icon = '💰';
                    message = `Salary generated for ${activity.details?.month || 'month'}`;
                    color = 'purple';
                    break;
                case 'SALARY_APPROVED':
                    icon = '✅';
                    message = `Salary approved for ${activity.details?.userName || 'employee'}`;
                    color = 'green';
                    break;
                case 'SALARY_PAID':
                    icon = '💵';
                    message = `Salary marked as paid for ${activity.details?.userName || 'employee'}`;
                    color = 'green';
                    break;
                case 'EVENT_CREATED':
                    icon = '📅';
                    message = `Event created: ${activity.details?.title || 'New Event'}`;
                    color = 'blue';
                    break;
                case 'ANNOUNCEMENT_POSTED':
                    icon = '📢';
                    message = `Announcement posted: ${activity.details?.title || 'New Announcement'}`;
                    color = 'orange';
                    break;
                case 'PASSWORD_RESET':
                    icon = '🔐';
                    message = `Password reset for ${activity.details?.userName || 'user'}`;
                    color = 'red';
                    break;
                case 'COURSE_CREATED':
                    icon = '📚';
                    message = `Course created: ${activity.details?.title || 'New Course'}`;
                    color = 'blue';
                    break;
                default:
                    icon = '📋';
                    message = activity.action ? activity.action.replace(/_/g, ' ').toLowerCase() : 'Unknown Action';
                    color = 'gray';
            }

            return {
                id: activity._id,
                action: activity.action,
                message,
                icon,
                color,
                performedBy: activity.performedBy,
                timestamp: activity.timestamp,
                timeAgo: getTimeAgo(activity.timestamp)
            };
        });

        return NextResponse.json({
            activities: formattedActivities,
            total: formattedActivities.length
        });

    } catch (err: any) {
        console.error('Recent Activity Error:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// Helper function to format time ago
function getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);

    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
    return new Date(timestamp).toLocaleDateString();
}
