'use client';

import React, { useEffect, useState } from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AttendanceSnapshotCard() {
    const [summary, setSummary] = useState<any>(null);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Month navigation state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch(`/api/employee/attendance/summary?month=${selectedMonth}&year=${selectedYear}`).then(res => res.json()),
            fetch(`/api/holidays?year=${selectedYear}&month=${selectedMonth}`).then(res => res.json())
        ])
            .then(([summaryData, holidaysData]) => {
                setSummary(summaryData);
                setHolidays(holidaysData.holidays || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching attendance summary:', err);
                setLoading(false);
            });
    };

    const goToPreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const goToCurrentMonth = () => {
        setSelectedMonth(new Date().getMonth());
        setSelectedYear(new Date().getFullYear());
    };

    // Check if a date is a holiday
    const isHoliday = (dateString: string) => {
        return holidays.some(h => {
            const holidayDate = new Date(h.date);
            const checkDate = new Date(dateString);
            return holidayDate.toDateString() === checkDate.toDateString();
        });
    };

    const getDayColor = (day: any) => {
        // Check if it's a holiday first
        if (isHoliday(day.date)) {
            return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold shadow-md ring-2 ring-indigo-200';
        }

        // Check if it's Sunday (day of week === 0)
        const dayOfWeek = new Date(day.date).getDay();
        if (dayOfWeek === 0) {
            return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold shadow-md ring-2 ring-orange-200';
        }

        if (day.isToday) return 'bg-orange-500 text-white font-bold ring-2 ring-orange-200';
        if (day.isWeekend) return 'bg-gray-100/50 text-gray-400';
        if (!day.status) return 'bg-white/50 border border-white/60 text-gray-600';

        if (day.status === 'Approved') {
            if (day.type === 'Present') return 'bg-green-500 text-white shadow-sm';
            if (day.type === 'WFH') return 'bg-blue-500 text-white shadow-sm';
            if (day.type === 'Leave') return 'bg-purple-500 text-white shadow-sm';
        }
        if (day.status === 'Pending') return 'bg-yellow-400 text-white shadow-sm';
        if (day.status === 'Rejected') return 'bg-red-500 text-white shadow-sm';

        return 'bg-white/50 border border-white/60 text-gray-600';
    };

    const ViewFullButton = (
        <a href="/employee/attendance" className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            View Full
        </a>
    );

    if (loading) {
        return (
            <ModernGlassCard title="Attendance Snapshot" headerAction={ViewFullButton}>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading attendance...</p>
                </div>
            </ModernGlassCard>
        );
    }

    if (!summary) {
        return (
            <ModernGlassCard title="Attendance Snapshot" headerAction={ViewFullButton}>
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500 text-sm">No attendance data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start marking your attendance!</p>
                </div>
            </ModernGlassCard>
        );
    }

    return (
        <ModernGlassCard title="Attendance Snapshot" headerAction={ViewFullButton} delay={0.2} hoverEffect>
            {/* Month Header with Navigation */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 mb-4 shadow-lg shadow-blue-500/20">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Previous Month"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="text-center">
                        <h4 className="text-sm font-medium opacity-90">{summary.monthName} {summary.year}</h4>
                    </div>

                    <button
                        onClick={goToNextMonth}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Next Month"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Today Button */}
                {(selectedMonth !== new Date().getMonth() || selectedYear !== new Date().getFullYear()) && (
                    <button
                        onClick={goToCurrentMonth}
                        className="w-full mb-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                    >
                        Go to Today
                    </button>
                )}

                {/* Stats */}
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{summary.totalMarked}</span>
                    <span className="text-sm opacity-90">/ {summary.workingDays} working days</span>
                    <span className="ml-auto text-sm font-bold bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        {summary.percentage}%
                    </span>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="bg-green-50/80 rounded-lg p-2 border border-green-100">
                    <div className="font-bold text-green-700 mb-1">Present</div>
                    <div className="text-xl font-black text-green-800">{summary.present}</div>
                </div>
                <div className="bg-blue-50/80 rounded-lg p-2 border border-blue-100">
                    <div className="font-bold text-blue-700 mb-1">WFH</div>
                    <div className="text-xl font-black text-blue-800">{summary.wfh}</div>
                </div>
                <div className="bg-purple-50/80 rounded-lg p-2 border border-purple-100">
                    <div className="font-bold text-purple-700 mb-1">Leave</div>
                    <div className="text-xl font-black text-purple-800">{summary.leave}</div>
                </div>
            </div>

            {summary.pending > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4 text-center flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    <span className="text-yellow-700 text-xs font-bold">
                        {summary.pending} pending approval
                    </span>
                </div>
            )}

            {/* Mini Calendar */}
            <div className="border border-white/60 rounded-xl p-3 bg-white/40 backdrop-blur-sm">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Monthly Calendar</div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty cells */}
                    {summary.calendar.length > 0 &&
                        Array.from({ length: new Date(summary.calendar[0].date).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))
                    }

                    {/* Actual days */}
                    {summary.calendar.map((day: any, index: number) => {
                        const holiday = holidays.find(h => {
                            const holidayDate = new Date(h.date);
                            const dayDate = new Date(day.date);
                            return holidayDate.toDateString() === dayDate.toDateString();
                        });

                        const getTooltip = () => {
                            if (holiday) return `🎉 ${holiday.name}`;
                            const dayOfWeek = new Date(day.date).getDay();
                            if (dayOfWeek === 0) return '🌞 Sunday - Weekly Off';
                            if (day.status) return `${day.type} - ${day.status}`;
                            if (day.isWeekend) return 'Weekend';
                            return 'No record';
                        };

                        return (
                            <div
                                key={index}
                                className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium cursor-default transition-transform hover:scale-110 ${getDayColor(day)}`}
                                title={getTooltip()}
                            >
                                {day.day}
                            </div>
                        );
                    })}
                </div>

                {/* Color Legend */}
                <div className="mt-3 pt-3 border-t border-white/60">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Legend</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gradient-to-br from-indigo-500 to-purple-500 ring-1 ring-indigo-200"></div>
                            <span className="text-gray-600 font-medium">Holiday</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-400 to-orange-500 ring-1 ring-orange-200"></div>
                            <span className="text-gray-600 font-medium">Sunday</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span className="text-gray-600 font-medium">Present</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span className="text-gray-600 font-medium">WFH</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-purple-500"></div>
                            <span className="text-gray-600 font-medium">Leave</span>
                        </div>
                    </div>
                </div>
            </div>
        </ModernGlassCard>
    );
}
