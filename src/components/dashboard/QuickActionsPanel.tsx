'use client';

import Link from 'next/link';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { UserPlus, Calendar, DollarSign, Megaphone, CheckCircle, Clock, Zap } from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    link: string;
    gradient: string;
    badge?: number;
}

interface QuickActionsPanelProps {
    pendingLeaves?: number;
    pendingAttendance?: number;
}

export default function QuickActionsPanel({ pendingLeaves = 0, pendingAttendance = 0 }: QuickActionsPanelProps) {
    const actions: QuickAction[] = [
        {
            id: 'add-user',
            label: 'Add User',
            icon: <UserPlus size={20} />,
            link: '/admin/users',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            id: 'create-event',
            label: 'New Event',
            icon: <Calendar size={20} />,
            link: '/admin/events',
            gradient: 'from-green-500 to-green-600'
        },
        {
            id: 'generate-salary',
            label: 'Run Payroll',
            icon: <DollarSign size={20} />,
            link: '/admin/salary/generate',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            id: 'post-announcement',
            label: 'Announce',
            icon: <Megaphone size={20} />,
            link: '/admin/announcements',
            gradient: 'from-orange-500 to-orange-600'
        },
        {
            id: 'review-leaves',
            label: 'Leaves',
            icon: <CheckCircle size={20} />,
            link: '/admin/leaves',
            gradient: 'from-yellow-500 to-yellow-600',
            badge: pendingLeaves
        },
        {
            id: 'approve-attendance',
            label: 'Attendance',
            icon: <Clock size={20} />,
            link: '/admin/attendance',
            gradient: 'from-red-500 to-red-600',
            badge: pendingAttendance
        }
    ];

    return (
        <ModernGlassCard>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Zap size={18} fill="currentColor" />
                </div>
                <h3 className="text-lg font-bold text-navy-900">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                {actions.map(action => (
                    <Link key={action.id} href={action.link} className="group relative">
                        <div className={`
                            bg-gradient-to-br ${action.gradient} 
                            p-4 rounded-xl text-white shadow-lg shadow-gray-200 
                            transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl
                            flex flex-col items-center justify-center text-center h-24
                        `}>
                            {/* Badge */}
                            {action.badge !== undefined && action.badge > 0 && (
                                <div className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-orange-600 animate-pulse shadow-md">
                                    {action.badge > 99 ? '99+' : action.badge}
                                </div>
                            )}

                            <div className="mb-2 p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                {action.icon}
                            </div>
                            <span className="text-xs font-bold tracking-wide">{action.label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </ModernGlassCard>
    );
}
