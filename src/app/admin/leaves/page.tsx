'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function AdminLeaves() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/admin/leaves');
            const data = await res.json();
            if (data.leaves) setLeaves(data.leaves);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
        // if (!window.confirm(`Mark this leave request as ${status}?`)) return; // Removed for debugging

        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/leaves/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();

            if (res.ok) {
                await fetchLeaves();
                alert(`Leave ${status} successfully`);
            } else {
                alert(data.message || 'Failed to update status');
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
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <h1 className="text-3xl font-bold text-navy-900 mb-8">Employee Leaves</h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    {loading ? <p>Loading records...</p> : (
                        <Table
                            data={leaves}
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
                                    header: "Period",
                                    accessor: (item) => (
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium">{new Date(item.fromDate).toLocaleDateString()}</span>
                                            <span className="text-gray-500 text-xs">to {new Date(item.toDate).toLocaleDateString()}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: "Reason",
                                    accessor: (item) => <span className="truncate max-w-xs block" title={item.reason}>{item.reason}</span>
                                },
                                {
                                    header: "Applied On",
                                    accessor: (item) => new Date(item.createdAt).toLocaleDateString()
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
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
