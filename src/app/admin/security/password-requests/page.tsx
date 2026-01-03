'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function PasswordRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<any>(null);
    const [modalMode, setModalMode] = useState<'RESET' | 'REJECT' | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/password-requests');
            const data = await res.json();
            setRequests(data.requests || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReq || !modalMode) return;

        if (modalMode === 'RESET' && newPassword.length < 6) {
            alert('Password must be at least 6 chars.');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedReq._id,
                    action: modalMode,
                    newPassword: modalMode === 'RESET' ? newPassword : undefined
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                closeModal();
                fetchRequests();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (req: any, mode: 'RESET' | 'REJECT') => {
        setSelectedReq(req);
        setModalMode(mode);
        setNewPassword('');
    };

    const closeModal = () => {
        setSelectedReq(null);
        setModalMode(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Password Requests</h1>
                    <p className="text-gray-500 mt-1">Review and manage user password reset requests security.</p>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <Table
                        data={requests}
                        columns={[
                            {
                                header: "User",
                                accessor: (req) => (
                                    <div>
                                        <div className="font-medium text-navy-900">{req.userId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{req.userId?.email}</div>
                                    </div>
                                )
                            },
                            {
                                header: "Role",
                                accessor: (req) => <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">{req.role}</span>
                            },
                            {
                                header: "Reason",
                                accessor: (req) => <span className="text-gray-600 italic">"{req.reason}"</span>
                            },
                            {
                                header: "Requested At",
                                accessor: (req) => (
                                    <div className="text-sm text-gray-500">
                                        {new Date(req.requestedAt).toLocaleDateString()} <span className="text-xs block">{new Date(req.requestedAt).toLocaleTimeString()}</span>
                                    </div>
                                )
                            },
                            {
                                header: "Actions",
                                accessor: (req) => (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(req, 'RESET')}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => openModal(req, 'REJECT')}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 font-medium"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ),
                                className: "text-right"
                            }
                        ]}
                        mobileCard={(req) => (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-navy-900 text-lg">{req.userId?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{req.userId?.email}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wider">{req.role}</span>
                                </div>

                                <div className="bg-orange-50 p-3 rounded-md text-sm italic text-navy-800 border border-orange-100 relative">
                                    <span className="absolute -top-2 left-3 bg-orange-100 text-orange-700 text-xs px-2 py-[2px] rounded border border-orange-200 uppercase font-bold">Reason</span>
                                    "{req.reason}"
                                </div>

                                <div className="text-xs text-gray-400">
                                    Requested: {new Date(req.requestedAt).toLocaleString()}
                                </div>

                                <div className="flex gap-3 mt-1 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => openModal(req, 'RESET')}
                                        className="flex-1 btn bg-green-600 text-white hover:bg-green-700 text-sm font-bold shadow-sm"
                                        style={{ minHeight: '44px' }}
                                    >
                                        Reset Password
                                    </button>
                                    <button
                                        onClick={() => openModal(req, 'REJECT')}
                                        className="flex-1 btn bg-white text-red-600 border border-red-200 hover:bg-red-50 text-sm font-medium"
                                        style={{ minHeight: '44px' }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                        loading={loading}
                    />
                </div>

                {/* Modal */}
                {modalMode && selectedReq && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-xl font-bold text-navy-900 mb-4">
                                {modalMode === 'RESET' ? 'Reset Password' : 'Reject Request'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {modalMode === 'RESET'
                                    ? `Set a new temporary password for ${selectedReq.userId?.name}. They will be notified.`
                                    : `Are you sure you want to reject the request from ${selectedReq.userId?.name}?`
                                }
                            </p>

                            <form onSubmit={handleAction}>
                                {modalMode === 'RESET' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter temporary password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`px-4 py-2 text-white rounded font-medium ${modalMode === 'RESET' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {actionLoading ? 'Processing...' : (modalMode === 'RESET' ? 'Confirm Reset' : 'Confirm Reject')}
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
