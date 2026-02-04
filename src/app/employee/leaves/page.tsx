'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AdvancedTable from '@/components/ui/AdvancedTable';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { X, Calendar, FileText, Clock, Plus } from 'lucide-react';

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
            const res = await fetch('/api/employee/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ fromDate: '', toDate: '', reason: '' });
                fetchLeaves();
            } else {
                alert(data.message || 'Failed to apply leave');
            }
        } catch (error: any) {
            alert(`Error: ${error.message || 'Something went wrong'}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-24">
                <PageHeader
                    title="Leave Requests"
                    subtitle="Manage and track your leave applications"
                    actions={
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                        >
                            <Plus size={18} strokeWidth={3} /> Apply Leave
                        </button>
                    }
                />

                <ModernGlassCard title="Leave History" delay={0.2}>
                    <AdvancedTable
                        data={leaves}
                        isLoading={loading}
                        keyField="_id"
                        searchPlaceholder="Search by reason or status..."
                        columns={[
                            {
                                header: "Period",
                                accessor: (item) => (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-navy-900 flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(item.fromDate).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-6">
                                            to {new Date(item.toDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: "Reason",
                                accessor: (item) => (
                                    <div className="flex items-start gap-2 max-w-xs group relative">
                                        <FileText size={14} className="text-gray-400 mt-1 shrink-0" />
                                        <span className="truncate text-gray-700">{item.reason}</span>
                                        {/* Tooltip for long reasons */}
                                        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                                            {item.reason}
                                        </div>
                                    </div>
                                ),
                                className: "max-w-xs"
                            },
                            {
                                header: "Applied On",
                                accessor: (item) => (
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                ),
                                sortable: true
                            },
                            {
                                header: "Status",
                                accessor: (item) => (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                ),
                                sortable: true
                            }
                        ]}
                        renderGridLayout={(item) => (
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Period</div>
                                        <div className="font-bold text-navy-900 flex items-center gap-2">
                                            <Calendar size={16} className="text-orange-500" />
                                            {new Date(item.fromDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500 ml-6">
                                            to {new Date(item.toDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 relative mt-2">
                                    <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] text-gray-400 font-bold uppercase border border-gray-200 rounded">Reason</span>
                                    "{item.reason}"
                                </div>

                                <div className="flex items-center justify-end text-xs text-gray-400 gap-1 pt-2 border-t border-gray-50">
                                    <Clock size={12} />
                                    Applied: {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    />
                </ModernGlassCard>

                {/* Crystal Glass Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white/90 backdrop-filter backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300" onClick={e => e.stopPropagation()}>
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                                <div>
                                    <h2 className="text-xl font-black text-navy-900 tracking-tight">Apply Leave</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Submit your leave request for approval</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">From</label>
                                        <input
                                            type="date"
                                            value={formData.fromDate}
                                            onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-medium shadow-sm"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">To</label>
                                        <input
                                            type="date"
                                            value={formData.toDate}
                                            onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-medium shadow-sm"
                                            min={formData.fromDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
                                    <textarea
                                        placeholder="Please explain why you need leave..."
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-medium shadow-sm resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all text-sm disabled:opacity-70 flex items-center justify-center gap-2"
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : null}
                                        {submitLoading ? 'Sending...' : 'Submit Form'}
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
