'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import {
    Target,
    Calendar,
    Loader2,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle,
    Clock
} from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { cn } from '@/lib/utils';

interface Task {
    _id: string;
    title: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    progressPercentage: number;
    priority: 'Low' | 'Medium' | 'High';
}

interface Goal {
    _id: string;
    title: string;
    description?: string;
    period: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage: number;
    tasks?: Task[];
}

export default function EmployeeGoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/employee/goals');
            const data = await res.json();
            setGoals(data.goals || []);
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async (goalId: string) => {
        if (!confirm('Are you sure you want to mark this objectives as completed? This will set progress to 100%.')) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/employee/goals/${goalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Completed' }),
            });

            if (res.ok) {
                // Refresh local state without full reload
                setGoals(prev => prev.map(g =>
                    g._id === goalId ? { ...g, status: 'Completed', progressPercentage: 100 } : g
                ));
            } else {
                alert('Failed to update goal');
            }
        } catch (error) {
            console.error('Error completing goal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedGoalId(prev => prev === id ? null : id);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-12">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-black text-navy-900 tracking-tight">
                            Strategic Objectives
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Direct impact on company success</p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-navy-900" />
                            <p>Loading objectives...</p>
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                            <Target className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-xl font-medium text-navy-900">No active goals</p>
                            <p className="text-sm">Objectives assigned to you will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {goals.map((goal) => (
                                <ModernGlassCard key={goal._id} className="p-0 overflow-hidden flex flex-col bg-white/60">
                                    {/* Card Header & Main Progress */}
                                    <div
                                        onClick={() => toggleExpand(goal._id)}
                                        className="p-6 cursor-pointer hover:bg-white/40 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-navy-900/5 text-[10px] font-bold text-gray-600 border border-navy-900/10">
                                                        {goal.period}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border",
                                                        goal.status === 'Completed' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' :
                                                            goal.status === 'In Progress' ? 'text-blue-700 bg-blue-100 border-blue-200' : 'text-gray-500 bg-gray-100 border-gray-200'
                                                    )}>
                                                        {goal.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-navy-900">{goal.title}</h3>
                                            </div>
                                            <button className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-100">
                                                {expandedGoalId === goal._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        {goal.description && (
                                            <p className="text-sm text-gray-600 mb-6 line-clamp-2">{goal.description}</p>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-gray-500">Overall Progress</span>
                                                <span className={cn(
                                                    goal.progressPercentage === 100 ? 'text-emerald-600' : 'text-navy-900'
                                                )}>{goal.progressPercentage}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                                                <div
                                                    style={{ width: `${goal.progressPercentage}%` }}
                                                    className={cn(
                                                        "h-full transition-all duration-1000 bg-gradient-to-r",
                                                        goal.status === 'Completed' ? 'from-emerald-500 to-emerald-400' :
                                                            'from-blue-600 to-blue-400'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                        {goal.status !== 'Completed' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleComplete(goal._id);
                                                }}
                                                disabled={isLoading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-bold transition-colors disabled:opacity-50"
                                            >
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>

                                    {/* Task Breakdown (Collapsible) */}
                                    <AnimatePresence>
                                        {expandedGoalId === goal._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-navy-900/5 border-t border-gray-200"
                                            >
                                                <div className="p-6 space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Results / Tasks</h4>

                                                    {!goal.tasks || goal.tasks.length === 0 ? (
                                                        <p className="text-sm text-gray-400 italic">No linked tasks found.</p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {goal.tasks.map(task => (
                                                                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                                                                    <div className={cn(
                                                                        "p-1.5 rounded-full",
                                                                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                                    )}>
                                                                        {task.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <p className={cn(
                                                                                "text-sm font-medium truncate",
                                                                                task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-navy-900'
                                                                            )}>{task.title}</p>
                                                                            <span className={cn(
                                                                                "text-[10px] font-bold px-1.5 py-0.5 rounded border ml-2",
                                                                                task.status === 'Completed' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' :
                                                                                    task.status === 'In Progress' ? 'text-blue-700 border-blue-200 bg-blue-50' : 'text-gray-500 border-gray-200 bg-gray-50'
                                                                            )}>
                                                                                {task.progressPercentage}%
                                                                            </span>
                                                                        </div>
                                                                        {/* Mini progress bar for task */}
                                                                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                style={{ width: `${task.progressPercentage}%` }}
                                                                                className={cn(
                                                                                    "h-full",
                                                                                    task.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </ModernGlassCard>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
