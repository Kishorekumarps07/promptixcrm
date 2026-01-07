'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function EmployeeAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (data.announcements) setAnnouncements(data.announcements);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Announcements</h1>
                    <p className="text-gray-500">Latest updates from the admin.</p>
                </header>

                {loading ? (
                    <p className="text-gray-500">Loading announcements...</p>
                ) : announcements.length > 0 ? (
                    <div className="space-y-6">
                        {announcements.map((item) => (
                            <div key={item._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-xl font-bold text-navy-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 mb-4">{item.content}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Posted on: {new Date(item.date).toLocaleDateString()}</span>
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                        {item.target}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No announcements found.</p>
                )}
            </main>
        </div>
    );
}
