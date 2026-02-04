'use client';

import React from 'react';
import Link from 'next/link';
import ModernGlassCard from '@/components/ui/ModernGlassCard';

interface AnnouncementsCardProps {
    announcements: any[];
}

export default function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
    const latestAnnouncements = announcements.slice(0, 3);

    const ViewAllButton = (
        <Link href="/employee/announcements" className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            View All
        </Link>
    );

    return (
        <ModernGlassCard title="Announcements" headerAction={ViewAllButton} delay={0.35} hoverEffect>
            {latestAnnouncements.length > 0 ? (
                <div className="space-y-3">
                    {latestAnnouncements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className="bg-white/60 rounded-xl p-4 border border-white/60 shadow-sm hover:shadow-md hover:bg-white/80 hover:scale-[1.02] transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-navy-900 text-sm group-hover:text-orange-600 transition-colors">
                                    {announcement.title}
                                </h4>
                                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {new Date(announcement.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {announcement.content}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 opacity-70">
                    <div className="text-4xl mb-2 grayscale">📢</div>
                    <p className="text-gray-900 font-medium text-sm">No announcements</p>
                    <p className="text-xs text-gray-500 mt-1">Quiet day today!</p>
                </div>
            )}
        </ModernGlassCard>
    );
}
