'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function StudentAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (data.announcements) setAnnouncements(data.announcements);
            });
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Announcements</h1>
                    <p className="text-gray-500 mt-1">Stay updated with the latest news</p>
                </header>

                <div className="flex flex-col gap-6 max-w-4xl">
                    {announcements.map(ann => (
                        <div key={ann._id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start gap-4 mb-3">
                                <h3 className="font-bold text-lg text-navy-900 leading-tight">
                                    {ann.title}
                                </h3>
                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                    {new Date(ann.date).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {ann.content}
                            </p>
                        </div>
                    ))}

                    {announcements.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-100 border-dashed">
                            <p>No announcements posted yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
