'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import DashboardCard from '@/components/ui/DashboardCard';

export default function AdminDashboard() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    const formattedDate = mounted
        ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    // Mock data for visualization since stats API is just counters
    const attendanceData = [
        { name: 'Mon', Present: 40, Absent: 10 },
        { name: 'Tue', Present: 42, Absent: 8 },
        { name: 'Wed', Present: 45, Absent: 5 },
        { name: 'Thu', Present: 38, Absent: 12 },
        { name: 'Fri', Present: 41, Absent: 9 },
    ];

    const roleData = stats ? [
        { name: 'Employees', value: stats.employees },
        { name: 'Students', value: stats.students },
    ] : [];

    const COLORS = ['#FF6B00', '#001529'];

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Dashboard Overview</h1>
                        <p className="text-gray-500">Welcome back, Admin</p>
                    </div>
                    <div className="text-sm bg-white px-4 py-2 rounded shadow text-gray-600">
                        {formattedDate}
                    </div>
                </header>

                {/* KPI Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <DashboardCard title="Total Employees" value={stats.employees} icon="👥" color="bg-blue-500" />
                        <DashboardCard title="Total Students" value={stats.students} icon="🎓" color="bg-green-500" />
                        <DashboardCard title="Active Events" value={stats.events} icon="📅" color="bg-orange-500" />
                        <DashboardCard title="Pending Leaves" value={stats.pendingLeaves} icon="🕒" color="bg-red-500" />
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-navy-900 mb-4">Weekly Attendance</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f4f4f4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="Present" fill="#001529" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="Absent" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-navy-900 mb-4">User Distribution</h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Employees</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-navy-900"></span> Students</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
