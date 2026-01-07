'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function AdminAttendance() {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/admin/attendance');
            const data = await res.json();
            if (data.attendance) setAttendance(data.attendance);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
        // if (!window.confirm(`Mark this attendance as ${status}?`)) return; // Removed for debugging

        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/attendance/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                await fetchAttendance();
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setActionLoading(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'badge-info';
        if (status === 'Approved') color = 'badge-success';
        if (status === 'Rejected') color = 'badge-error';
        if (status === 'Pending') color = 'badge-warning';
        return <span className={`badge ${color}`}>{status}</span>;
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <h1 className="text-3xl font-bold text-navy-900 mb-8">Employee Attendance</h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <Table
                        data={attendance}
                        columns={[
                            {
                                header: "Employee",
                                accessor: (item) => (
                                    <div>
                                        <div className="font-medium text-navy-900">{item.userId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{item.userId?.email}</div>
                                    </div>
                                )
                            },
                            {
                                header: "Date",
                                accessor: (item) => new Date(item.date).toLocaleDateString()
                            },
                            { header: "Type", accessor: "type" },
                            {
                                header: "Check In/Out",
                                accessor: (item) => (
                                    <div className="font-mono text-sm">
                                        {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        <span className="mx-2 text-gray-400">/</span>
                                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                )
                            },
                            {
                                header: "Status",
                                accessor: (item) => <StatusBadge status={item.status} />
                            },
                            {
                                header: "Actions",
                                accessor: (item) => {
                                    if (item.status !== 'Pending') return <span className="text-gray-400 text-sm">Resolved</span>;

                                    return (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(item._id, 'Approved')}
                                                disabled={actionLoading === item._id}
                                                className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                                                disabled={actionLoading === item._id}
                                                className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    );
                                }
                            }
                        ]}
                        mobileCard={(item) => (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-navy-900 text-lg">{item.userId?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Type</span>
                                        <span className="font-medium text-navy-800">{item.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Time</span>
                                        <div className="font-mono text-sm text-navy-800">
                                            {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            <span className="mx-1 text-gray-400">/</span>
                                            {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </div>
                                    </div>
                                </div>

                                {item.status === 'Pending' && (
                                    <div className="flex gap-3 mt-1 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'Approved')}
                                            disabled={actionLoading === item._id}
                                            className="flex-1 btn bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium border border-green-200"
                                            style={{ minHeight: '44px' }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                                            disabled={actionLoading === item._id}
                                            className="flex-1 btn bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium border border-red-200"
                                            style={{ minHeight: '44px' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        loading={loading}
                    />
                </div>
            </main>
        </div>
    );
}
