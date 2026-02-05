'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Target } from 'lucide-react';

interface Task {
    _id: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    updatedAt: string;
}

interface TaskPerformanceChartProps {
    tasks: Task[];
}

export default function TaskPerformanceChart({ tasks }: TaskPerformanceChartProps) {
    // simple logic: count statuses
    // For "Current Week", we'd need more complex filtering. 
    // Let's stick to a simple "Task Status Overview" for now as it's more reliable with the current data prop.
    // If we want "Weekly Performance", we'd need to filter `tasks` by `updatedAt` within current week.

    // Let's calculate counts
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;

    const data = [
        { name: 'Pending', count: pending, color: '#94a3b8' }, // gray-400
        { name: 'In Progress', count: inProgress, color: '#3b82f6' }, // blue-500
        { name: 'Completed', count: completed, color: '#10b981' }, // emerald-500
    ];

    return (
        <ModernGlassCard className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-navy-900">Task Performance</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">Status Overview</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Target className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 p-6 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            width={80}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ModernGlassCard>
    );
}
