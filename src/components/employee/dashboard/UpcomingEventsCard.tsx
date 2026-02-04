'use client';

import React from 'react';
import Link from 'next/link';
import ModernGlassCard from '@/components/ui/ModernGlassCard';

interface UpcomingEventsCardProps {
    events: any[];
}

export default function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
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

    const ViewAllButton = (
        <Link href="/employee/events" className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            View All
        </Link>
    );

    return (
        <ModernGlassCard title="Upcoming Events" headerAction={ViewAllButton} delay={0.4}>
            {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event._id}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-white/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getEventTypeBadge(event.type)}`}>
                                    {event.type}
                                </span>
                                <span className="text-xs font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <h4 className="font-bold text-navy-900 text-sm mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {event.title}
                            </h4>

                            {event.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                                    {event.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium border-t border-gray-100 pt-2">
                                {event.attendees && (
                                    <span className="flex items-center gap-1">
                                        👥 <span className="text-gray-600">{event.attendees.length}</span> registered
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 opacity-70">
                    <div className="text-4xl mb-2 grayscale">🎉</div>
                    <p className="text-gray-900 font-medium text-sm">No upcoming events</p>
                    <p className="text-xs text-gray-500 mt-1">Stay tuned for updates!</p>
                </div>
            )}
        </ModernGlassCard>
    );
}
