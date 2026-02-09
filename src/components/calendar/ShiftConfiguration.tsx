'use client';

import React from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import DaySelector from './DaySelector';
import { Clock, Hourglass } from 'lucide-react';

interface ShiftConfigProps {
    startTime: string;
    gracePeriod: number;
    weeklyOffs: number[];
    onUpdate: (key: string, value: any) => void;
}

export default function ShiftConfiguration({ startTime, gracePeriod, weeklyOffs, onUpdate }: ShiftConfigProps) {
    return (
        <ModernGlassCard
            title="Shift Configuration"
            description="Define standard working hours and policies"
            className="h-full"
        >
            <div className="space-y-8 p-1">
                {/* Time & Grace Period Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shift Start Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Shift Start Time
                        </label>
                        <div className="relative">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => onUpdate('shiftStartTime', e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-800 dark:text-white font-mono text-lg"
                            />
                        </div>
                    </div>

                    {/* Grace Period */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Hourglass className="w-4 h-4 text-purple-500" />
                            Grace Period (Minutes)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="120"
                                value={gracePeriod}
                                onChange={(e) => onUpdate('gracePeriodMinutes', Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-800 dark:text-white font-mono text-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Weekly Offs */}
                <DaySelector
                    selectedDays={weeklyOffs}
                    onChange={(days) => onUpdate('weeklyOffs', days)}
                />
            </div>
        </ModernGlassCard>
    );
}
