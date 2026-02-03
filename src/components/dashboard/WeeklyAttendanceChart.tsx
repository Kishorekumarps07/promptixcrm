'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyAttendanceChartProps {
    data: any[];
}

export default function WeeklyAttendanceChart({ data }: WeeklyAttendanceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center">
                <p className="text-gray-400">No attendance data available for this week</p>
            </div>
        );
    }

    // Format dates to be shorter (e.g., "Mon 12")
    const formattedData = data.map(item => ({
        ...item,
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
    }));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Weekly Attendance Overview</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#f4f4f4' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Approved" name="Present (Approved)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} stackId="a" />
                        <Bar dataKey="Pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} stackId="a" />
                        <Bar dataKey="Rejected" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Data for the last 7 days</p>
        </div>
    );
}
