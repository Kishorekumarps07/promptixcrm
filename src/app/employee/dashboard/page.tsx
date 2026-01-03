'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardCard from '@/components/ui/DashboardCard';

export default function EmployeeDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/employee/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getAttendanceColor = (status: string) => {
        if (status === 'Approved' || status === 'Present') return 'bg-green-500';
        if (status === 'Pending') return 'bg-yellow-500';
        if (status === 'Rejected') return 'bg-red-500';
        return 'bg-gray-400';
    };

    const AnnouncementsList = () => {
        const [list, setList] = useState<any[]>([]);
        useEffect(() => {
            fetch('/api/announcements')
                .then(res => res.json())
                .then(data => { if (data.announcements) setList(data.announcements.slice(0, 3)); })
                .catch(console.error);
        }, []);

        if (list.length === 0) return <p className="text-gray-500 italic">No recent announcements.</p>;

        return (
            <div className="grid gap-4">
                {list.map(item => (
                    <div key={item._id} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                        <h4 className="font-bold text-navy-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">My Dashboard</h1>
                    <p className="text-gray-500">Overview of your activity</p>
                </header>

                {loading ? (
                    <p className="text-gray-500">Loading dashboard...</p>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardCard
                            title="Today's Status"
                            value={stats.attendance}
                            icon="📅"
                            color={getAttendanceColor(stats.attendance)}
                        />
                        <DashboardCard
                            title="Total Leaves"
                            value={stats.totalLeaves}
                            icon="🌴"
                            color="bg-blue-500"
                        />
                        <DashboardCard
                            title="Pending Requests"
                            value={stats.pendingLeaves}
                            icon="⏳"
                            color="bg-orange-500"
                        />
                        <DashboardCard
                            title="Events (7 Days)"
                            value={stats.upcomingEvents}
                            icon="🎉"
                            color="bg-purple-500"
                        />
                    </div>
                ) : (
                    <p className="text-red-500">Failed to load stats.</p>
                )}

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-navy-900 mb-4">Recent Announcements</h2>
                    <AnnouncementsList />
                </div>
            </main>
        </div>
    );
}
