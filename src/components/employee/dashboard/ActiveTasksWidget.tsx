'use client';

import Link from 'next/link';
import { CheckSquare, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { cn } from '@/lib/utils';

interface Task {
    _id: string;
    title: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Completed';
    progressPercentage: number;
    createdAt: string;
}

interface ActiveTasksWidgetProps {
    tasks: Task[];
}

export default function ActiveTasksWidget({ tasks }: ActiveTasksWidgetProps) {
    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    const highPriorityCount = pendingTasks.filter(t => t.priority === 'High').length;

    // Get top 3 most urgent tasks (High priority first, then oldest)
    const urgentTasks = [...pendingTasks]
        .sort((a, b) => {
            if (a.priority === 'High' && b.priority !== 'High') return -1;
            if (b.priority === 'High' && a.priority !== 'High') return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .slice(0, 3);

    return (
        <ModernGlassCard className="h-full flex flex-col">
            <div className="p-6 flex justify-between items-start border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                        My Priorities
                    </h3>
                    <p className="text-sm text-gray-500">
                        {pendingTasks.length} active tasks • {highPriorityCount} high priority
                    </p>
                </div>
                <Link
                    href="/employee/tasks"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-navy-900 transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-4">
                {urgentTasks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <CheckSquare className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No active tasks</p>
                    </div>
                ) : (
                    urgentTasks.map(task => (
                        <div key={task._id} className="flex items-center gap-3 group">
                            <div className={cn(
                                "w-1 h-8 rounded-full",
                                task.priority === 'High' ? 'bg-red-500' :
                                    task.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-navy-900 group-hover:text-blue-600 transition-colors truncate">
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {task.priority === 'High' && <AlertCircle className="w-3 h-3 text-red-500" />}
                                    <span>{task.progressPercentage}% Complete</span>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[10px] uppercase font-bold text-gray-500">
                                {task.status === 'In Progress' ? 'WIP' : 'TODO'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link href="/employee/tasks" className="text-xs text-gray-500 hover:text-navy-900 flex items-center justify-center gap-1 transition-colors">
                    View full task list <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </ModernGlassCard>
    );
}
