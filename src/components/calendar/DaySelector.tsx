'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DaySelectorProps {
    selectedDays: number[]; // 0-6 (Sunday-Saturday)
    onChange: (days: number[]) => void;
    label?: string;
}

const DAYS = [
    { label: 'S', value: 0, full: 'Sunday' },
    { label: 'M', value: 1, full: 'Monday' },
    { label: 'T', value: 2, full: 'Tuesday' },
    { label: 'W', value: 3, full: 'Wednesday' },
    { label: 'T', value: 4, full: 'Thursday' },
    { label: 'F', value: 5, full: 'Friday' },
    { label: 'S', value: 6, full: 'Saturday' },
];

export default function DaySelector({ selectedDays, onChange, label = "Weekly Offs" }: DaySelectorProps) {
    const toggleDay = (dayValue: number) => {
        if (selectedDays.includes(dayValue)) {
            onChange(selectedDays.filter(d => d !== dayValue));
        } else {
            onChange([...selectedDays, dayValue].sort());
        }
    };

    return (
        <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
                {DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                        <motion.button
                            key={day.value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleDay(day.value)}
                            title={day.full}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm",
                                isSelected
                                    ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-red-500/30 shadow-lg"
                                    : "bg-white/50 dark:bg-black/20 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 border border-white/20"
                            )}
                        >
                            {day.label}
                        </motion.button>
                    );
                })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                Selected days will be marked as non-working days.
            </p>
        </div>
    );
}
