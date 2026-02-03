'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import EnhancedKPICard from '@/components/dashboard/EnhancedKPICard';
import AlertsSection from '@/components/dashboard/AlertsSection';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import WeeklyAttendanceChart from '@/components/dashboard/WeeklyAttendanceChart';
import EnrollmentChart from '@/components/dashboard/EnrollmentChart';
import { Users, GraduationCap, Calendar, Clock, DollarSign, Lock } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard stats fetch failed", err);
                setLoading(false);
            });
    }, []);

    const dateTime = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Dashboard</h1>
                        <p className="text-gray-500">Overview of system performance and activities</p>
                    </div>
                    <div className="text-sm bg-white px-4 py-2 rounded-lg shadow-sm text-gray-600 border border-gray-100 font-medium">
                        {dateTime}
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Left Column (Alerts + Charts) - Spans 2 cols */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Alerts Section (Full Width of column) */}
                        <AlertsSection />

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <EnhancedKPICard
                                title="Total Employees"
                                value={stats?.employees || 0}
                                icon={<Users />}
                                color="bg-blue-100 text-blue-600"
                                trend={stats?.trends?.employees}
                                link="/admin/users"
                                loading={loading}
                            />
                            <EnhancedKPICard
                                title="Total Students"
                                value={stats?.students || 0}
                                icon={<GraduationCap />}
                                color="bg-green-100 text-green-600"
                                trend={stats?.trends?.students}
                                link="/admin/users"
                                loading={loading}
                            />
                            <EnhancedKPICard
                                title="Pending Leaves"
                                value={stats?.leaves?.pending || 0}
                                icon={<Clock />}
                                color="bg-orange-100 text-orange-600"
                                link="/admin/leaves"
                                badge={stats?.leaves?.pending}
                                loading={loading}
                            />
                            <EnhancedKPICard
                                title="Pending Attendance"
                                value={stats?.attendance?.pending || 0}
                                icon={<Calendar />}
                                color="bg-yellow-100 text-yellow-600"
                                link="/admin/attendance"
                                badge={stats?.attendance?.pending}
                                loading={loading}
                            />
                            <EnhancedKPICard
                                title="Salary Drafts"
                                value={stats?.salary?.draft || 0}
                                icon={<DollarSign />}
                                color="bg-purple-100 text-purple-600"
                                link="/admin/salary/generate"
                                badge={stats?.salary?.draft}
                                loading={loading}
                            />
                            <EnhancedKPICard
                                title="Password Requests"
                                value={stats?.passwordRequests?.pending || 0}
                                icon={<Lock />}
                                color="bg-red-100 text-red-600"
                                link="/admin/security/password-requests"
                                badge={stats?.passwordRequests?.pending}
                                loading={loading}
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
                            <WeeklyAttendanceChart data={stats?.weeklyAttendance || []} />
                            <EnrollmentChart data={stats?.enrollmentStats || []} />
                        </div>
                    </div>

                    {/* Right Column (Quick Actions + Activity) - Spans 1 col */}
                    <div className="space-y-6">
                        <QuickActionsPanel
                            pendingLeaves={stats?.leaves?.pending}
                            pendingAttendance={stats?.attendance?.pending}
                        />
                        <RecentActivityFeed />
                    </div>
                </div>
            </main>
        </div>
    );
}
