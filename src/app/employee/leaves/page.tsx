'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function EmployeeLeaves() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ fromDate: '', toDate: '', reason: '' });
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/employee/leaves');
            const data = await res.json();
            if (data.leaves) setLeaves(data.leaves);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSubmitLoading(true);
        try {
            console.log('Submitting leave request:', formData);
            const res = await fetch('/api/employee/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            let data;
            try {
                data = await res.json();
            } catch (err) {
                console.error('Failed to parse JSON:', err);
                throw new Error('Server response was not valid JSON');
            }

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ fromDate: '', toDate: '', reason: '' });
                fetchLeaves();
                alert('Leave request submitted!');
            } else {
                console.error('Submission failed:', data);
                alert(data.message || 'Failed to apply leave');
            }
        } catch (error: any) {
            console.error('Request error:', error);
            alert(`Error: ${error.message || 'Something went wrong'}`);
        } finally {
            setSubmitLoading(false);
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
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Leave Requests</h1>
                        <p className="text-gray-500 mt-1">Manage and track your leave applications</p>
                    </div>
                    <button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow transition-colors font-medium w-full md:w-auto mt-4 md:mt-0"
                        style={{ minHeight: '44px' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Apply Leave
                    </button>
                </header>

                {loading ? <p className="text-center py-8 text-gray-500">Loading records...</p> : (
                    <Table
                        data={leaves}
                        columns={[
                            {
                                header: "Period",
                                accessor: (item) => (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-navy-900">
                                            {new Date(item.fromDate).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            to {new Date(item.toDate).toLocaleDateString()}
                                        </span>
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
                            }
                        ]}
                        mobileCard={(item) => (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Period</span>
                                        <div className="font-bold text-navy-900 mt-1">
                                            {new Date(item.fromDate).toLocaleDateString()} - {new Date(item.toDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-sm italic border border-gray-100 relative mt-1">
                                    <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-gray-400 font-bold uppercase border border-gray-200 rounded">Reason</span>
                                    "{item.reason}"
                                </div>
                                <div className="text-xs text-gray-400 text-right mt-1">
                                    Applied: {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    />
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-navy-900 text-white p-4">
                                <h2 className="text-lg font-bold">Apply For Leave</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={formData.fromDate}
                                            onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={formData.toDate}
                                            onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            min={formData.fromDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <textarea
                                        placeholder="Brief reason for leave..."
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded shadow transition-colors disabled:opacity-50"
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
