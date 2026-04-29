'use client';

import React from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import DaySelector from './DaySelector';
import { Clock, Hourglass } from 'lucide-react';

interface ShiftConfigProps {
    startTime: string;
    endTime: string;
    gracePeriod: number;
    minWorkHours: number;
    isStrictMode: boolean;
    weeklyOffs: number[];
    onUpdate: (key: string, value: any) => void;
}

export default function ShiftConfiguration({ 
    startTime, 
    endTime,
    gracePeriod, 
    minWorkHours,
    isStrictMode,
    weeklyOffs, 
    onUpdate 
}: ShiftConfigProps) {
    return (
        <ModernGlassCard
            title="Shift Configuration"
            description="Define standard working hours and strict policies"
            className="h-full"
        >
            <div className="space-y-6 p-1">
                {/* Time Group */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Shift Start Time */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            In Time
                        </label>
                        <input
                            type="time"
                            value={startTime || '09:00'}
                            onChange={(e) => onUpdate('shiftStartTime', e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-gray-800 dark:text-white font-bold text-base"
                        />
                    </div>

                    {/* Shift End Time */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            Out Time
                        </label>
                        <input
                            type="time"
                            value={endTime || '18:00'}
                            onChange={(e) => onUpdate('shiftEndTime', e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-gray-800 dark:text-white font-bold text-base"
                        />
                    </div>
                </div>

                {/* Policy Group */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Grace Period */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Hourglass className="w-3.5 h-3.5 text-purple-500" />
                            Grace (Min)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={gracePeriod ?? 0}
                            onChange={(e) => onUpdate('gracePeriodMinutes', Number(e.target.value))}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-800 dark:text-white font-bold text-base"
                        />
                    </div>

                    {/* Min Work Hours */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-green-500" />
                            Min Hours
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="24"
                            value={minWorkHours ?? 8}
                            onChange={(e) => onUpdate('minWorkHours', Number(e.target.value))}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-gray-800 dark:text-white font-bold text-base"
                        />
                    </div>
                </div>

                {/* Strict Mode Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${isStrictMode ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30 shadow-lg shadow-orange-500/5' : 'bg-navy-50/50 dark:bg-white/5 border-navy-100 dark:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-navy-900 dark:text-white">Strict Mode</p>
                                {isStrictMode && <span className="px-1.5 py-0.5 rounded bg-orange-500 text-[8px] font-black text-white uppercase tracking-tighter">Active</span>}
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Automatic half-day for late check-in or short hours</p>
                        </div>
                        <button
                            onClick={() => onUpdate('isStrictMode', !isStrictMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${isStrictMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isStrictMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
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
