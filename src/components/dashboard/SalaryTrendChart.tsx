'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SalaryTrendChartProps {
    data: any[];
}

export default function SalaryTrendChart({ data }: SalaryTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center">
                <h3 className="text-lg font-bold text-navy-900 mb-2 w-full text-left">Salary Trends</h3>
                <p className="text-gray-400">No salary data available for the last 6 months</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Salary Payout Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9CA3AF' }}
                            dy={10}
                        />
                        <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#9CA3AF' }}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ stroke: '#F97316', strokeWidth: 2 }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Payout']}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#F97316"
                            strokeWidth={3}
                            dot={{ fill: '#F97316', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Total payouts over the last 6 months</p>
        </div>
    );
}
