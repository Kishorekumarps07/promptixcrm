'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Megaphone, Plus, Trash2, Calendar, Users, X, Info } from 'lucide-react';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', target: 'All' });
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            if (data.announcements) setAnnouncements(data.announcements);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', content: '', target: 'All' });
                fetchAnnouncements();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        setDeleting(id);
        try {
            await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(null);
        }
    };

    const TargetBadge = ({ target }: { target: string }) => {
        let color = 'bg-gray-100 text-gray-800 border-gray-200';
        if (target === 'Employees') color = 'bg-blue-50 text-blue-700 border-blue-100';
        if (target === 'Students') color = 'bg-green-50 text-green-700 border-green-100';
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${color}`}>
                <Users size={10} /> {target}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24 text-navy-900">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-navy-900">Announcements</h1>
                        <p className="text-gray-500 font-medium mt-1">Broadcast updates to your organization</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <Plus size={18} strokeWidth={3} /> New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                        </div>
                    ) : announcements.length > 0 ? (
                        announcements.map((item, idx) => (
                            <ModernGlassCard key={item._id} delay={idx * 0.1} className="!p-0 overflow-hidden group">
                                <div className="p-6 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                                                <Megaphone size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-navy-900 leading-tight group-hover:text-orange-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(item.date).toLocaleDateString(undefined, {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <TargetBadge target={item.target} />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            disabled={deleting === item._id}
                                        >
                                            {deleting === item._id ? <span className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent block" /> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                    <div className="pl-[60px]">
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                    </div>
                                </div>
                            </ModernGlassCard>
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <div className="text-6xl mb-4 grayscale">📢</div>
                            <h3 className="text-xl font-bold text-navy-900">No Announcements</h3>
                            <p className="text-gray-500">Create your first broadcast message above.</p>
                        </div>
                    )}
                </div>

                {/* Glass Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                        <div className="bg-white/90 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                                <div>
                                    <h2 className="text-xl font-black text-navy-900 tracking-tight">New Announcement</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Share updates with your team</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-8 flex flex-col gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Headline</label>
                                    <input
                                        placeholder="e.g. Office Closure for Holidays"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-bold text-navy-900 shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message Body</label>
                                    <textarea
                                        placeholder="Type your detailed message here..."
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm resize-none shadow-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Audience</label>
                                    <div className="relative">
                                        <select
                                            value={formData.target}
                                            onChange={e => setFormData({ ...formData, target: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm font-bold text-navy-900 shadow-sm appearance-none"
                                        >
                                            <option value="All">All Users</option>
                                            <option value="Employees">Employees Only</option>
                                            <option value="Students">Students Only</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Users size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-navy-900 text-white rounded-xl hover:bg-orange-500 font-bold shadow-lg shadow-navy-900/20 hover:shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-sm"
                                    >
                                        {submitting ? <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <Megaphone size={16} />}
                                        {submitting ? 'Publishing...' : 'Publish Now'}
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
