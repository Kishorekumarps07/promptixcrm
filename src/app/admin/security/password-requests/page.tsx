'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

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
            <main className="ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Password Requests</h1>
                    <p className="text-gray-500 mt-1">Review and manage user password reset requests security.</p>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4">Requested At</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={5} className="p-6 text-center text-gray-400">No pending requests.</td></tr>
                            ) : requests.map(req => (
                                <tr key={req._id}>
                                    <td className="p-4 font-medium text-navy-900">
                                        {req.userId?.name || 'Unknown'}
                                        <div className="text-xs text-gray-400">{req.userId?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">{req.role}</span>
                                    </td>
                                    <td className="p-4 text-gray-600 italic">"{req.reason}"</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(req.requestedAt).toLocaleDateString()} <span className="text-xs">{new Date(req.requestedAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => openModal(req, 'RESET')}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => openModal(req, 'REJECT')}
                                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
