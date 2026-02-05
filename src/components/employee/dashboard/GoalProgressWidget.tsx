'use client';

import Link from 'next/link';
import { Target, ArrowRight, TrendingUp } from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { cn } from '@/lib/utils';

interface Goal {
    _id: string;
    title: string;
    period: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage: number;
}

interface GoalProgressWidgetProps {
    goals: Goal[];
}

export default function GoalProgressWidget({ goals }: GoalProgressWidgetProps) {
    // Show top 2 most relevant goals (active ones first)
    const activeGoals = goals
        .filter(g => g.status !== 'Completed')
        .slice(0, 2);

    return (
        <ModernGlassCard className="h-full flex flex-col">
            <div className="p-6 flex justify-between items-start border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        My Goals
                    </h3>
                    <p className="text-sm text-gray-500">
                        {goals.length} total objectives
                    </p>
                </div>
                <Link
                    href="/employee/goals"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-navy-900 transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                {activeGoals.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Target className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No active goals</p>
                    </div>
                ) : (
                    activeGoals.map(goal => (
                        <div key={goal._id} className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-navy-900 truncate max-w-[70%]">{goal.title}</span>
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{goal.period}</span>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    <span>Progress</span>
                                    <span>{goal.progressPercentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    <div
                                        style={{ width: `${goal.progressPercentage}%` }}
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 bg-gradient-to-r",
                                            goal.progressPercentage >= 100 ? 'from-emerald-500 to-emerald-400' : 'from-blue-500 to-cyan-400'
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/employee/goals" className="text-xs text-gray-500 hover:text-navy-900 flex items-center justify-center gap-1 transition-colors">
                    View active objectives <TrendingUp className="w-3 h-3" />
                </Link>
            </div>
        </ModernGlassCard>
    );
}
