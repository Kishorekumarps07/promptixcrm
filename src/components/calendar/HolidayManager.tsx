'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Trash2, PartyPopper } from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Holiday {
    _id?: string;
    date: string;
    name: string;
    type: string;
}

interface HolidayManagerProps {
    holidays: Holiday[];
    onAddHoliday: (holiday: { date: string; name: string; type: string }) => Promise<void>;
    onDeleteHoliday: (id: string) => Promise<void>;
    onSyncIndianHolidays: () => Promise<void>;
    syncLoading: boolean;
}

export default function HolidayManager({
    holidays,
    onAddHoliday,
    onDeleteHoliday,
    onSyncIndianHolidays,
    syncLoading
}: HolidayManagerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [holidayName, setHolidayName] = useState('');
    const [view, setView] = useState<'calendar' | 'list'>('calendar');

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        // If a holiday exists, maybe show details? For now, prep to add
        const existingHoliday = holidays.find(h => isSameDay(new Date(h.date), day));
        if (existingHoliday) {
            toast.info(`Holiday: ${existingHoliday.name}`);
        }
    };

    const handleSubmitHoliday = async () => {
        if (!selectedDate || !holidayName.trim()) {
            toast.error("Please select a date and enter a name");
            return;
        }
        await onAddHoliday({
            date: selectedDate.toISOString(),
            name: holidayName,
            type: 'Holiday'
        });
        setHolidayName('');
        setSelectedDate(null);
    };

    return (
        <ModernGlassCard
            title="Holiday Calendar"
            description="Manage company holidays and events"
            className="h-full"
            action={
                <div className="flex bg-white/20 dark:bg-black/20 rounded-lg p-1">
                    <button
                        onClick={() => setView('calendar')}
                        className={cn("px-3 py-1 rounded-md text-sm transition-all", view === 'calendar' ? "bg-white dark:bg-gray-800 shadow-sm" : "text-gray-500")}
                    >
                        Calendar
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={cn("px-3 py-1 rounded-md text-sm transition-all", view === 'list' ? "bg-white dark:bg-gray-800 shadow-sm" : "text-gray-500")}
                    >
                        List
                    </button>
                </div>
            }
        >
            <div className="p-1">
                {/* Header Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    <button
                        onClick={onSyncIndianHolidays}
                        disabled={syncLoading}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                    >
                        {syncLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PartyPopper className="w-4 h-4" />}
                        Sync Indian Holidays
                    </button>
                </div>

                {/* Calendar View */}
                {view === 'calendar' && (
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((day, dayIdx) => {
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                            const holiday = holidays.find(h => isSameDay(new Date(h.date), day));
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "relative min-h-[80px] p-2 rounded-xl border transition-all cursor-pointer group hover:shadow-md",
                                        !isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-900/20 text-gray-400 border-transparent" : "bg-white/40 dark:bg-black/20 border-white/20 dark:border-white/5",
                                        isSelected ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 z-10" : "",
                                        holiday ? "bg-amber-50/80 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30" : ""
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                            isToday(day) ? "bg-blue-500 text-white" : "text-gray-700 dark:text-gray-300"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {holiday && (
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        )}
                                    </div>

                                    {holiday && (
                                        <div className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
                                            {holiday.name}
                                        </div>
                                    )}

                                    {/* Add Button shown on hover or selection */}
                                    {!holiday && (isSelected || selectedDate === null) && (
                                        <div className={cn(
                                            "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                                            isSelected && "opacity-100"
                                        )}>
                                            <Plus className="w-5 h-5 text-blue-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {holidays
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((holiday) => (
                                <motion.div
                                    key={holiday._id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800 dark:text-white">{holiday.name}</div>
                                            <div className="text-sm text-gray-500">{format(new Date(holiday.date), 'EEEE, MMMM do yyyy')}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDeleteHoliday(holiday._id!)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        {holidays.length === 0 && (
                            <div className="text-center py-10 text-gray-400">No upcoming holidays</div>
                        )}
                    </div>
                )}

                {/* Quick Add Form (Bottom) */}
                <AnimatePresence>
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:absolute md:bottom-auto md:left-auto md:translate-x-0 md:relative md:mt-6 w-[90%] md:w-full bg-white dark:bg-gray-900 shadow-2xl md:shadow-none border md:border-none p-4 rounded-xl md:bg-transparent z-50 md:z-0"
                        >
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                <div className="w-full">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                                        Add Holiday for {format(selectedDate, 'MMM do')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Holiday Name (e.g. Diwali)"
                                        value={holidayName}
                                        onChange={(e) => setHolidayName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitHoliday()}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleSubmitHoliday}
                                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModernGlassCard>
    );
}
