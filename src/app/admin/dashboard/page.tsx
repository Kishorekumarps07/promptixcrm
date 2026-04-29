'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import EnhancedKPICard from '@/components/dashboard/EnhancedKPICard';
import AlertsSection from '@/components/dashboard/AlertsSection';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import WeeklyAttendanceChart from '@/components/dashboard/WeeklyAttendanceChart';
import SalaryTrendChart from '@/components/dashboard/SalaryTrendChart';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Users, Target, Calendar, Clock, IndianRupee, Lock, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
                }
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text();
                    throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}`);
                }
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard stats fetch failed:", err.message);
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
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-12">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-navy-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 font-medium mt-1">System Overview & Performance Metrics</p>
                    </div>
                    <div className="glass-panel px-5 py-2.5 rounded-xl text-sm text-navy-900 font-bold border border-white/50 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {dateTime}
                    </div>
                </header>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Left Column (Alerts + KPIs + Charts) - Spans 3 cols on XL */}
                        <div className="xl:col-span-3 space-y-8">

                        {/* Alerts Section (Full Width of column) */}
                        <AlertsSection />

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <EnhancedKPICard
                                title="Employees"
                                value={stats?.employees || 0}
                                icon={<Users size={24} />}
                                color="text-blue-600 bg-blue-500"
                                trend={stats?.trends?.employees}
                                link="/admin/users"
                                loading={loading}
                                delay={0.1}
                            />
                            <EnhancedKPICard
                                title="Active Goals"
                                value={stats?.goals?.active || 0}
                                icon={<Target size={24} />}
                                color="text-green-600 bg-green-500"
                                trend={stats?.trends?.goals}
                                link="/admin/goals"
                                loading={loading}
                                delay={0.15}
                            />
                            <EnhancedKPICard
                                title="Leave Requests"
                                value={stats?.leaves?.pending || 0}
                                icon={<Clock size={24} />}
                                color="text-orange-600 bg-orange-500"
                                link="/admin/leaves"
                                badge={stats?.leaves?.pending}
                                loading={loading}
                                delay={0.2}
                            />
                            <EnhancedKPICard
                                title="Attendance"
                                value={stats?.attendance?.pending || 0}
                                icon={<Calendar size={24} />}
                                color="text-yellow-600 bg-yellow-500"
                                link="/admin/attendance"
                                badge={stats?.attendance?.pending}
                                loading={loading}
                                delay={0.25}
                            />
                            <EnhancedKPICard
                                title="Salary Drafts"
                                value={stats?.salary?.draft || 0}
                                icon={<IndianRupee size={24} />}
                                color="text-purple-600 bg-purple-500"
                                link="/admin/salary/generate"
                                badge={stats?.salary?.draft}
                                loading={loading}
                                delay={0.3}
                            />
                            <EnhancedKPICard
                                title="Security"
                                value={stats?.passwordRequests?.pending || 0}
                                icon={<Lock size={24} />}
                                color="text-red-600 bg-red-500"
                                link="/admin/security/password-requests"
                                badge={stats?.passwordRequests?.pending}
                                loading={loading}
                                delay={0.35}
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ModernGlassCard title="Attendance Trends" delay={0.4} className="h-full">
                                <div className="h-80 w-full">
                                    <WeeklyAttendanceChart data={stats?.weeklyAttendance || []} />
                                </div>
                            </ModernGlassCard>
                            <ModernGlassCard title="Salary Disbursement" delay={0.5} className="h-full">
                                <div className="h-80 w-full">
                                    <SalaryTrendChart data={stats?.salaryTrends || []} />
                                </div>
                            </ModernGlassCard>
                        </div>

                        {/* Wide Recent Activity Feed */}
                        <RecentActivityFeed />
                    </div>

                    {/* Right Column (Health + Quick Actions) - Spans 1 col */}
                    <div className="xl:col-span-1 space-y-8">
                        {/* System Health Widget */}
                        <ModernGlassCard title="System Health">
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-3.5 bg-green-50/50 rounded-xl border border-green-100/50 group hover:bg-green-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">Database</span>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 bg-white px-2 py-1 rounded-md border border-green-200 uppercase tracking-wider shadow-sm">Operational</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/50 group hover:bg-blue-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                            <Activity size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">API Gateway</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-200 uppercase tracking-wider shadow-sm">Active</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-orange-50/50 rounded-xl border border-orange-100/50 group hover:bg-orange-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                            <Users size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-navy-900">Live Sessions</span>
                                    </div>
                                    <span className="text-[10px] font-black text-orange-600 bg-white px-2 py-1 rounded-md border border-orange-200 uppercase tracking-wider shadow-sm">{stats?.activeSessions || 1} Online</span>
                                </div>
                            </div>
                        </ModernGlassCard>

                        <QuickActionsPanel
                            pendingLeaves={stats?.leaves?.pending}
                            pendingAttendance={stats?.attendance?.pending}
                        />
                    </div>
                </div>
            </div>
        </main>
    </div>
    );
}
