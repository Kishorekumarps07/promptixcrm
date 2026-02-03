import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface AnnouncementsCardProps {
    announcements: any[];
}

export default function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
    // Show latest 3 announcements
    const latestAnnouncements = announcements.slice(0, 3);

    return (
        <DashboardWidgetCard
            title="Announcements"
            icon="📢"
            actionLabel="View All"
            actionHref="/employee/announcements"
        >
            {latestAnnouncements.length > 0 ? (
                <div className="space-y-3">
                    {latestAnnouncements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors"
                        >
                            <h4 className="font-semibold text-navy-900 text-sm mb-1">
                                {announcement.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {announcement.content}
                            </p>
                            <span className="text-xs text-gray-400">
                                {new Date(announcement.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📢</div>
                    <p className="text-gray-500 text-sm">No announcements yet</p>
                    <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                </div>
            )}
        </DashboardWidgetCard>
    );
}
