'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TodayAtGlance from '@/components/employee/dashboard/TodayAtGlance';
import QuickActionsCard from '@/components/employee/dashboard/QuickActionsCard';
import AttendanceSnapshotCard from '@/components/employee/dashboard/AttendanceSnapshotCard';
import LeaveBalanceCard from '@/components/employee/dashboard/LeaveBalanceCard';
import SalaryPreviewCard from '@/components/employee/dashboard/SalaryPreviewCard';
import AnnouncementsCard from '@/components/employee/dashboard/AnnouncementsCard';
import UpcomingEventsCard from '@/components/employee/dashboard/UpcomingEventsCard';

export default function EmployeeDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);
    const [userName, setUserName] = useState<string>('Employee');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all data
        Promise.all([
            fetch('/api/employee/stats').then(res => res.json()),
            fetch('/api/announcements').then(res => res.json()),
            fetch('/api/employee/events').then(res => res.json()),
            fetch('/api/employee/salary').then(res => res.json())
        ])
            .then(([statsData, announcementsData, eventsData, salaryData]) => {
                setStats(statsData);
                setAnnouncements(announcementsData.announcements || []);
                setEvents(eventsData.events || []);
                setSalaries(salaryData.data || []);

                // Get user name from token/session
                const token = document.cookie.split('; ').find(row => row.startsWith('token='));
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUserName(payload.userName || 'Employee');
                    } catch (e) {
                        console.error('Error parsing token:', e);
                    }
                }

                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            });
    }, []);

    // Get latest paid salary
    const latestSalary = salaries.length > 0
        ? salaries.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        })[0]
        : null;

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <Sidebar />
                <main className="md:ml-64 p-4 md:p-8 flex-1">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading your dashboard...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                {/* Page Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-navy-900">My Dashboard</h1>
                    <p className="text-gray-500 mt-1">Your personalized workspace</p>
                </header>

                {/* Dashboard Grid */}
                <div className="space-y-6">
                    {/* Today at a Glance - Full Width */}
                    <TodayAtGlance
                        userName={userName}
                        attendanceStatus={stats?.attendance || 'Not Checked In'}
                        date={new Date()}
                    />

                    {/* Quick Actions - Full Width */}
                    <QuickActionsCard />

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Attendance Snapshot */}
                        <AttendanceSnapshotCard />

                        {/* Leave Balance */}
                        <LeaveBalanceCard
                            total={stats?.stats?.leaves?.total || 0}
                            pending={stats?.stats?.leaves?.pending || 0}
                            approved={stats?.stats?.leaves?.approved || 0}
                        />

                        {/* Salary Preview */}
                        <SalaryPreviewCard
                            latestSalary={latestSalary}
                        />

                        {/* Announcements */}
                        <AnnouncementsCard
                            announcements={announcements}
                        />
                    </div>

                    {/* Upcoming Events - Full Width */}
                    <UpcomingEventsCard
                        events={events}
                    />
                </div>
            </main>
        </div>
    );
}
