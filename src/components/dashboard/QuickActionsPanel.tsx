'use client';

import Link from 'next/link';
import { UserPlus, Calendar, DollarSign, Megaphone, CheckCircle, Clock } from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    link: string;
    color: string;
    badge?: number; // Optional badge count
}

interface QuickActionsPanelProps {
    pendingLeaves?: number;
    pendingAttendance?: number;
}

export default function QuickActionsPanel({ pendingLeaves = 0, pendingAttendance = 0 }: QuickActionsPanelProps) {
    const actions: QuickAction[] = [
        {
            id: 'add-user',
            label: 'Add New User',
            icon: <UserPlus className="w-5 h-5" />,
            link: '/admin/users',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            id: 'create-event',
            label: 'Create Event',
            icon: <Calendar className="w-5 h-5" />,
            link: '/admin/events',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            id: 'generate-salary',
            label: 'Generate Salary',
            icon: <DollarSign className="w-5 h-5" />,
            link: '/admin/salary/generate',
            color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
            id: 'post-announcement',
            label: 'Post Announcement',
            icon: <Megaphone className="w-5 h-5" />,
            link: '/admin/announcements',
            color: 'bg-orange-500 hover:bg-orange-600'
        },
        {
            id: 'review-leaves',
            label: 'Review Pending Leaves',
            icon: <CheckCircle className="w-5 h-5" />,
            link: '/admin/leaves',
            color: 'bg-yellow-500 hover:bg-yellow-600',
            badge: pendingLeaves
        },
        {
            id: 'approve-attendance',
            label: 'Approve Attendance',
            icon: <Clock className="w-5 h-5" />,
            link: '/admin/attendance',
            color: 'bg-red-500 hover:bg-red-600',
            badge: pendingAttendance
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actions.map(action => (
                    <Link
                        key={action.id}
                        href={action.link}
                        className="relative group"
                    >
                        <div className={`${action.color} text-white rounded-lg p-4 transition-all duration-200 transform group-hover:scale-105 group-hover:shadow-lg min-h-[100px] flex flex-col items-center justify-center text-center`}>
                            {/* Badge */}
                            {action.badge !== undefined && action.badge > 0 && (
                                <div className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-orange-600 animate-pulse">
                                    {action.badge > 99 ? '99+' : action.badge}
                                </div>
                            )}

                            {/* Icon */}
                            <div className="mb-2 transform group-hover:scale-110 transition-transform">
                                {action.icon}
                            </div>

                            {/* Label */}
                            <span className="text-xs font-semibold break-words">
                                {action.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
                Click any action to get started quickly
            </p>
        </div>
    );
}
