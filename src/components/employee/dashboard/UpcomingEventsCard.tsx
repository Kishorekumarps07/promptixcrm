import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

interface UpcomingEventsCardProps {
    events: any[];
}

export default function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
    // Filter and show next 3 upcoming events
    const today = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    const getEventTypeBadge = (type: string) => {
        const badges: Record<string, string> = {
            'Workshop': 'bg-blue-100 text-blue-700',
            'Bootcamp': 'bg-purple-100 text-purple-700',
            'Guest Lecture': 'bg-green-100 text-green-700',
            'Announcement': 'bg-orange-100 text-orange-700'
        };
        return badges[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <DashboardWidgetCard
            title="Upcoming Events"
            icon="🎉"
            actionLabel="View All"
            actionHref="/employee/events"
        >
            {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event._id}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-navy-900 text-sm flex-1">
                                    {event.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getEventTypeBadge(event.type)}`}>
                                    {event.type}
                                </span>
                            </div>

                            {event.description && (
                                <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                    {event.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    📅 {new Date(event.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                {event.attendees && (
                                    <span className="flex items-center gap-1">
                                        👥 {event.attendees.length} registered
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                    <p className="text-xs text-gray-400 mt-1">Stay tuned for new events!</p>
                </div>
            )}
        </DashboardWidgetCard>
    );
}
