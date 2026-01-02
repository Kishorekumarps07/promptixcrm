'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardCard from '@/components/ui/DashboardCard';

export default function StudentDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/stats')
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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Student Dashboard</h1>
                    <p className="text-gray-500">Welcome back, Scholar!</p>
                </header>

                {loading ? (
                    <p className="text-gray-500">Loading dashboard...</p>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <DashboardCard
                            title="Internship Status"
                            value={stats.status}
                            icon="🎓"
                            color="bg-blue-500"
                        />
                        <DashboardCard
                            title="Program"
                            value={stats.program}
                            icon="📚"
                            color="bg-purple-500"
                        />
                        <DashboardCard
                            title="Mentor"
                            value={stats.mentor}
                            icon="👨‍🏫"
                            color="bg-orange-500"
                        />
                        <DashboardCard
                            title="Events (7 Days)"
                            value={stats.upcomingEvents}
                            icon="🎉"
                            color="bg-green-500"
                        />
                    </div>
                ) : (
                    <p className="text-red-500">Failed to load stats.</p>
                )}

                {stats && stats.project !== 'Not Assigned' && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-bold text-navy-900 mb-2">Current Project</h3>
                        <p className="text-xl text-gray-700">{stats.project}</p>
                        {stats.mentorEmail && <p className="text-sm text-gray-500 mt-2">Mentor Email: {stats.mentorEmail}</p>}
                    </div>
                )}

                {stats && stats.announcements && stats.announcements.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-navy-900 mb-4">📢 Announcements</h3>
                        <div className="space-y-4">
                            {stats.announcements.map((ann: any) => (
                                <div key={ann._id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold text-gray-800">{ann.title}</h4>
                                        <span className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{ann.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
