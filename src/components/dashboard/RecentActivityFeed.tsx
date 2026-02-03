'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

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
        // Poll every 30 seconds for new activities
        const interval = setInterval(fetchActivities, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/admin/recent-activity');
            if (res.ok) {
                const data = await res.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-blue-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
            gray: 'bg-gray-100 text-gray-600'
        };
        return colors[color] || colors.gray;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-navy-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-navy-900">Recent Activity</h3>
                </div>
                <p className="text-sm text-gray-500">No recent activity to display.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-navy-900">Recent Activity</h3>
                <span className="ml-auto text-xs text-gray-500">Updates every 30s</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3 group">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getColorClass(activity.color)} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <span className="text-sm">{activity.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium break-words">
                                {activity.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                        </div>

                        {/* Timeline line (except for last item) */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[28px] top-10 w-0.5 h-full bg-gray-200 -z-10"></div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                }
            `}</style>
        </div>
    );
}
