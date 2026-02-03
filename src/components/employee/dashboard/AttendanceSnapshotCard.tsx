import React, { useEffect, useState } from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

export default function AttendanceSnapshotCard() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/employee/attendance/summary')
            .then(res => res.json())
            .then(data => {
                setSummary(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching attendance summary:', err);
                setLoading(false);
            });
    }, []);

    const getDayColor = (day: any) => {
        if (day.isToday) return 'bg-orange-500 text-white font-bold';
        if (day.isWeekend) return 'bg-gray-100 text-gray-400';
        if (!day.status) return 'bg-white border border-gray-200 text-gray-600';

        if (day.status === 'Approved') {
            if (day.type === 'Present') return 'bg-green-500 text-white';
            if (day.type === 'WFH') return 'bg-blue-500 text-white';
            if (day.type === 'Leave') return 'bg-purple-500 text-white';
        }
        if (day.status === 'Pending') return 'bg-yellow-400 text-white';
        if (day.status === 'Rejected') return 'bg-red-500 text-white';

        return 'bg-white border border-gray-200 text-gray-600';
    };

    if (loading) {
        return (
            <DashboardWidgetCard
                title="Attendance Snapshot"
                icon="📊"
                actionLabel="View Full"
                actionHref="/employee/attendance"
            >
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading attendance...</p>
                </div>
            </DashboardWidgetCard>
        );
    }

    if (!summary) {
        return (
            <DashboardWidgetCard
                title="Attendance Snapshot"
                icon="📊"
                actionLabel="View Full"
                actionHref="/employee/attendance"
            >
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-500 text-sm">No attendance data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start marking your attendance!</p>
                </div>
            </DashboardWidgetCard>
        );
    }

    return (
        <DashboardWidgetCard
            title="Attendance Snapshot"
            icon="📊"
            actionLabel="View Full"
            actionHref="/employee/attendance"
        >
            {/* Month Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium mb-1">{summary.monthName} {summary.year}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{summary.totalMarked}</span>
                    <span className="text-sm opacity-90">/ {summary.workingDays} days</span>
                    <span className="ml-auto text-sm font-semibold">{summary.percentage}%</span>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="bg-green-50 rounded p-2 border border-green-200">
                    <div className="font-semibold text-green-700">Present</div>
                    <div className="text-lg font-bold text-green-900">{summary.present}</div>
                </div>
                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                    <div className="font-semibold text-blue-700">WFH</div>
                    <div className="text-lg font-bold text-blue-900">{summary.wfh}</div>
                </div>
                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                    <div className="font-semibold text-purple-700">Leave</div>
                    <div className="text-lg font-bold text-purple-900">{summary.leave}</div>
                </div>
            </div>

            {summary.pending > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-center">
                    <span className="text-yellow-700 text-xs font-medium">
                        ⏳ {summary.pending} pending approval
                    </span>
                </div>
            )}

            {/* Mini Calendar */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="text-xs font-semibold text-gray-600 mb-2">Monthly Calendar</div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {summary.calendar.length > 0 &&
                        Array.from({ length: new Date(summary.calendar[0].date).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))
                    }

                    {/* Actual days */}
                    {summary.calendar.map((day: any, index: number) => (
                        <div
                            key={index}
                            className={`aspect-square flex items-center justify-center rounded text-xs ${getDayColor(day)}`}
                            title={day.status ? `${day.type} - ${day.status}` : day.isWeekend ? 'Weekend' : 'No record'}
                        >
                            {day.day}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-gray-600">WFH</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-gray-600">Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="text-gray-600">Today</span>
                    </div>
                </div>
            </div>
        </DashboardWidgetCard>
    );
}
