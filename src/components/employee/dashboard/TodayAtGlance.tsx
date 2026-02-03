import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface TodayAtGlanceProps {
    userName: string;
    attendanceStatus: string;
    date: Date;
}

export default function TodayAtGlance({ userName, attendanceStatus, date }: TodayAtGlanceProps) {
    // Determine greeting based on time
    const hour = date.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    // Format date
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Status badge color
    const getStatusColor = (status: string) => {
        if (status === 'Approved' || status === 'Present') return 'bg-green-100 text-green-700';
        if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
        if (status === 'Rejected') return 'bg-red-100 text-red-700';
        if (status === 'Not Checked In') return 'bg-gray-100 text-gray-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-gradient-to-r from-navy-900 to-blue-900 rounded-lg shadow-sm border border-gray-100 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">
                        {greeting}, {userName}! 👋
                    </h2>
                    <p className="text-blue-200 text-sm md:text-base">{formattedDate}</p>
                </div>

                {/* Today's Status */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-blue-200 mb-1">Today's Status</p>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(attendanceStatus)}`}>
                            {attendanceStatus === 'Not Checked In' ? '⏰ Not Marked' : `✅ ${attendanceStatus}`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
