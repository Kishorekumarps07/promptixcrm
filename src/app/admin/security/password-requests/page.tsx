'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { Lock, User, RefreshCw, XCircle, CheckCircle, Shield, Key } from 'lucide-react';

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
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24 text-navy-900">
                <PageHeader
                    title="Password Requests"
                    subtitle="Security review queue for account access recovery"
                    breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Security' }]}
                />

                <div className="mt-8 grid grid-cols-1 gap-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-white/50 animate-pulse"></div>
                        ))
                    ) : requests.length > 0 ? (
                        requests.map((req, idx) => (
                            <ModernGlassCard key={req._id} delay={idx * 0.05} className="!p-0 overflow-hidden group hover:border-orange-200 transition-colors">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 flex items-center justify-center text-orange-600 font-bold shadow-sm shrink-0">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-navy-900 text-lg leading-tight">{req.userId?.name || 'Unknown User'}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                                                    {req.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mb-2">{req.userId?.email}</p>
                                            <div className="bg-orange-50/50 p-2 rounded-lg border border-orange-100/50 inline-block">
                                                <p className="text-xs text-gray-600 italic">
                                                    <span className="font-bold text-orange-700 not-italic mr-1">Reason:</span>
                                                    "{req.reason}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 text-right min-w-[140px]">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requested</span>
                                        <span className="text-sm font-bold text-navy-900">{new Date(req.requestedAt).toLocaleDateString()}</span>
                                        <span className="text-xs text-gray-400">{new Date(req.requestedAt).toLocaleTimeString()}</span>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <button
                                            onClick={() => openModal(req, 'RESET')}
                                            className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={14} /> Reset Access
                                        </button>
                                        <button
                                            onClick={() => openModal(req, 'REJECT')}
                                            className="flex-1 md:flex-none px-4 py-2 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold shadow-sm hover:border-red-200 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            </ModernGlassCard>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white/50 rounded-2xl border border-dashed border-gray-300 backdrop-blur-sm">
                            <Shield size={48} className="mx-auto text-green-200 mb-4" />
                            <h3 className="text-lg font-bold text-navy-900">All Secure</h3>
                            <p className="text-gray-500 text-sm">No pending password reset requests.</p>
                        </div>
                    )}
                </div>

                {/* Glass Modal */}
                {modalMode && selectedReq && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in duration-200" onClick={closeModal}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20" onClick={e => e.stopPropagation()}>
                            <div className={`p-6 border-b flex justify-between items-center ${modalMode === 'RESET' ? 'bg-gradient-to-r from-orange-50 to-white border-orange-100' : 'bg-gradient-to-r from-red-50 to-white border-red-100'
                                }`}>
                                <div>
                                    <h2 className={`text-xl font-black tracking-tight ${modalMode === 'RESET' ? 'text-orange-600' : 'text-red-600'}`}>
                                        {modalMode === 'RESET' ? 'Reset Password' : 'Reject Request'}
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        Action for <span className="font-bold text-navy-900">{selectedReq.userId?.name}</span>
                                    </p>
                                </div>
                                <div className={`p-2 rounded-full ${modalMode === 'RESET' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                                    {modalMode === 'RESET' ? <Key size={20} /> : <Shield size={20} />}
                                </div>
                            </div>

                            <form onSubmit={handleAction} className="p-6 space-y-5">
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                    {modalMode === 'RESET'
                                        ? "Generate a temporary password for this user. They will be required to change it upon next login."
                                        : "Are you sure you want to reject this request? The user will be notified via email."
                                    }
                                </p>

                                {modalMode === 'RESET' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-bold text-navy-900"
                                            placeholder="Enter temporary password..."
                                            required
                                            minLength={6}
                                            autoFocus
                                        />
                                        <p className="text-[10px] text-gray-400 font-medium px-1">Must be at least 6 characters.</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-colors text-sm border border-transparent hover:border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm ${modalMode === 'RESET'
                                                ? 'bg-navy-900 hover:bg-orange-600 shadow-navy-900/20 hover:shadow-orange-600/30'
                                                : 'bg-red-600 hover:bg-red-700 shadow-red-600/20 hover:shadow-red-700/30'
                                            }`}
                                    >
                                        {actionLoading ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <CheckCircle size={16} />}
                                        Confirm
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
