'use client';

import { useEffect, useState, use } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function EventAttendance({ params }: { params: Promise<{ id: string }> }) {
    const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
    const [event, setEvent] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        params.then(res => setUnwrappedParams(res));
    }, [params]);

    useEffect(() => {
        if (unwrappedParams) fetchAttendees(unwrappedParams.id);
    }, [unwrappedParams]);

    const fetchAttendees = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/events/${id}/attendees`);
            const data = await res.json();
            if (data.event) setEvent(data.event);
            if (data.analytics) setAnalytics(data.analytics);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (userId: string, status: 'Attended' | 'Absent') => {
        if (!unwrappedParams) return;
        console.log("Marking Attendance:", { userId, status, eventId: unwrappedParams.id }); // Debug
        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/events/${unwrappedParams.id}/attendance`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status }),
            });
            console.log("Response Status:", res.status); // Debug
            if (!res.ok) {
                const err = await res.json();
                console.error("API Error:", err);
                alert(`Error: ${err.message}`);
            }
            await fetchAttendees(unwrappedParams.id);
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to update attendance");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <p>Loading attendance...</p>
            </main>
        </div>
    );

    if (!event) return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <p>Event not found.</p>
            </main>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">{event.title}</h1>
                        <p className="text-gray-500">{new Date(event.date).toLocaleDateString()} • Attendance Sheet</p>
                    </div>
                    <button onClick={() => window.location.href = '/admin/events'} className="px-4 py-2 text-sm text-gray-600 hover:text-navy-900">
                        ← Back to Events
                    </button>
                </div>

                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Registrations</div>
                            <div className="text-2xl font-bold text-navy-900 mt-1">{analytics.totalRegistrations}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Present</div>
                            <div className="text-2xl font-bold text-green-600 mt-1">{analytics.attendedCount}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Attendance Rate</div>
                            <div className="text-2xl font-bold text-blue-600 mt-1">{analytics.attendanceRate}%</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Avg Rating</div>
                            <div className="text-2xl font-bold text-orange-500 mt-1">★ {analytics.avgRating}</div>
                        </div>
                    </div>
                )}

                <div className="table-container">
                    <Table
                        data={event.attendees}
                        keyField="_id"
                        columns={[
                            {
                                header: "Attendee",
                                accessor: (item) => (
                                    <div>
                                        <div className="font-medium text-navy-900">{item.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{item.user?.email}</div>
                                    </div>
                                )
                            },
                            {
                                header: "Role",
                                accessor: (item) => <span className="badge badge-info">{item.role}</span>
                            },
                            {
                                header: "Registered At",
                                accessor: (item) => new Date(item.registeredAt).toLocaleDateString()
                            },
                            {
                                header: "Status",
                                accessor: (item) => (
                                    <span className={`badge ${item.status === 'Attended' ? 'badge-success' :
                                        item.status === 'Absent' ? 'badge-error' : 'badge-warning'
                                        }`}>
                                        {item.status}
                                    </span>
                                )
                            },
                            {
                                header: "Actions",
                                accessor: (item) => (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => markAttendance(item.user._id, 'Attended')}
                                            disabled={actionLoading === item.user._id || item.status === 'Attended'}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${item.status === 'Attended' ? 'bg-green-100 text-green-700 opacity-50' : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                        >
                                            Mark Present
                                        </button>
                                        <button
                                            onClick={() => markAttendance(item.user._id, 'Absent')}
                                            disabled={actionLoading === item.user._id || item.status === 'Absent'}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${item.status === 'Absent' ? 'bg-red-100 text-red-700 opacity-50' : 'bg-red-500 text-white hover:bg-red-600'
                                                }`}
                                        >
                                            Mark Absent
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </main>
        </div>
    );
}
