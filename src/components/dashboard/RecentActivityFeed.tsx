'use client';

import { useEffect, useState } from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Clock, Activity as ActivityIcon, User, CheckCircle, XCircle, FileText, Bell, Target, Calendar, ShieldAlert } from 'lucide-react';

interface Activity {
    id: string;
    action: string;
    message: string;
    icon: string;
    color: string;
    performedBy: string;
    timestamp: Date;
    timeAgo: string;
}

export default function RecentActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 30 * 1000); // 30s
        return () => clearInterval(interval);
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/admin/recent-activity');
            
            if (!res.ok) {
                const text = await res.text();
                console.error(`Activities fetch error (HTTP ${res.status}):`, text.substring(0, 100));
                return;
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Expected JSON activities but got:', contentType, text.substring(0, 100));
                return;
            }

            const data = await res.json();
            setActivities(data.activities || []);
        } catch (error: any) {
            console.error('Failed to fetch activities:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action: string, color: string) => {
        const size = 14;
        const actionUpper = action.toUpperCase();
        
        if (actionUpper.includes('USER')) return <User size={size} />;
        if (actionUpper.includes('APPROVED')) return <CheckCircle size={size} />;
        if (actionUpper.includes('REJECTED')) return <XCircle size={size} />;
        if (actionUpper.includes('PAID') || actionUpper.includes('SALARY')) return <FileText size={size} />;
        if (actionUpper.includes('ANNOUNCEMENT')) return <Bell size={size} />;
        if (actionUpper.includes('GOAL')) return <Target size={size} />;
        if (actionUpper.includes('ATTENDANCE')) return <Calendar size={size} />;
        
        return <ActivityIcon size={size} />;
    };

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-50 text-green-600 border-green-100 ring-green-500/10',
            blue: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100 ring-yellow-500/10',
            red: 'bg-red-50 text-red-600 border-red-100 ring-red-500/10',
            purple: 'bg-purple-50 text-purple-600 border-purple-100 ring-purple-500/10',
            orange: 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/10',
            gray: 'bg-gray-50 text-gray-600 border-gray-100 ring-gray-500/10'
        };
        return colors[color] || colors.gray;
    };

    if (loading) {
        return (
            <ModernGlassCard>
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </ModernGlassCard>
        );
    }

    if (activities.length === 0) {
        return (
            <ModernGlassCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ActivityIcon size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-navy-900">Recent Activity</h3>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ActivityIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">Activity will appear here once actions are performed</p>
                </div>
            </ModernGlassCard>
        );
    }

    return (
        <ModernGlassCard className="flex flex-col">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center">
                        <ActivityIcon size={18} />
                    </div>
                    <h3 className="text-xl font-black text-navy-900 tracking-tight">Recent Activity</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                </span>
            </div>

            <div className="flex-1 relative px-4 pb-6 mt-2">
                {/* Continuous Timeline Line Background - Precisely Centered (16px item padding + 16px icon center) */}
                <div className="absolute left-[28px] top-6 bottom-16 w-[2px] bg-gradient-to-b from-indigo-100 via-gray-100 to-transparent opacity-60"></div>
                
                <div className="list-none space-y-8 relative z-10">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-6 group items-start px-3">
                        <div className={`relative z-20 flex-shrink-0 w-8 h-8 rounded-xl ${getColorClass(activity.color)} border-2 flex items-center justify-center shadow-lg shadow-gray-200/50 ring-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-indigo-500/10`}>
                            {getIcon(activity.action, activity.color)}
                        </div>
 
                        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="max-w-2xl">
                                <p className="text-sm text-navy-900 font-bold leading-relaxed group-hover:text-indigo-600 transition-colors">
                                    {activity.message}
                                </p>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50/50 rounded-lg border border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-tight shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                                    <Clock size={12} className="text-indigo-400" />
                                    <span>{activity.timeAgo}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 italic flex flex-col items-end min-w-[80px]">
                                    <span className="font-bold text-gray-300 not-italic uppercase tracking-widest text-[8px] mb-0.5">Admin</span>
                                    <span className="font-black text-gray-500 tabular-nums">{activity.performedBy.split('@')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </ModernGlassCard>
    );
}
