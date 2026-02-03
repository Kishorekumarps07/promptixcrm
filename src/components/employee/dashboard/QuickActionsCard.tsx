import React from 'react';
import Link from 'next/link';
import DashboardWidgetCard from './DashboardWidgetCard';

export default function QuickActionsCard() {
    const actions = [
        {
            label: 'Mark Attendance',
            icon: '📅',
            href: '/employee/attendance',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            label: 'Apply Leave',
            icon: '🌴',
            href: '/employee/leaves',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            label: 'View Salary',
            icon: '💰',
            href: '/employee/salary',
            color: 'bg-orange-500 hover:bg-orange-600'
        },
        {
            label: 'Change Password',
            icon: '🔑',
            href: '/employee/profile',
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            label: 'Announcements',
            icon: '📢',
            href: '/employee/announcements',
            color: 'bg-pink-500 hover:bg-pink-600'
        },
        {
            label: 'Events',
            icon: '🎉',
            href: '/employee/events',
            color: 'bg-indigo-500 hover:bg-indigo-600'
        }
    ];

    return (
        <DashboardWidgetCard title="Quick Actions" icon="⚡">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        href={action.href}
                        className={`${action.color} text-white rounded-lg p-4 text-center transition-all hover:scale-105 hover:shadow-md`}
                        style={{ minHeight: '80px' }}
                    >
                        <div className="text-2xl mb-2">{action.icon}</div>
                        <div className="text-xs md:text-sm font-medium">{action.label}</div>
                    </Link>
                ))}
            </div>
        </DashboardWidgetCard>
    );
}
