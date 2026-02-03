'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EnrollmentChartProps {
    data: any[];
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center">
                <h3 className="text-lg font-bold text-navy-900 mb-2 w-full text-left">Top Courses</h3>
                <p className="text-gray-400">No active enrollments found</p>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Top Courses by Enrollment</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="title"
                            type="category"
                            width={100}
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f9f9f9' }}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Based on currently ongoing enrollments</p>
        </div>
    );
}
