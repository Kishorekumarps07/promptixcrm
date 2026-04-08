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
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 w-full min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                        <XAxis 
                            dataKey="name" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b', fontWeight: 600 }}
                            dy={5}
                        />
                        <YAxis 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b', fontWeight: 600 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                        />
                        <Legend 
                            iconType="circle" 
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '25px', fontSize: '11px', fontWeight: 700 }} 
                        />
                        <Bar dataKey="Approved" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                        <Bar dataKey="Pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                        <Bar dataKey="Rejected" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
