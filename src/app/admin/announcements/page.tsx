'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', target: 'All' });
    const [submitting, setSubmitting] = useState(false);

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

    const TargetBadge = ({ target }: { target: string }) => {
        let color = 'bg-gray-100 text-gray-800';
        if (target === 'Employees') color = 'bg-blue-100 text-blue-800';
        if (target === 'Students') color = 'bg-green-100 text-green-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{target}</span>;
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-navy-900">Announcement Center</h1>
                        <p className="text-gray-500 mt-1">Manage system-wide broadcasts</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm md:text-base transition-colors shadow-md"
                        style={{ minHeight: '44px' }}
                    >
                        + New
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <Table
                        data={announcements}
                        loading={loading}
                        columns={[
                            {
                                header: "Date",
                                accessor: (item) => <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                            },
                            {
                                header: "Title",
                                accessor: (item) => <span className="font-medium text-navy-900">{item.title}</span>
                            },
                            {
                                header: "Target",
                                accessor: (item) => <TargetBadge target={item.target} />
                            }
                        ]}
                        mobileCard={(item) => (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-navy-900 text-lg leading-tight">{item.title}</div>
                                    <TargetBadge target={item.target} />
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                                    {item.content}
                                </div>
                                <div className="text-xs text-gray-400 text-right">
                                    Posted: {new Date(item.date).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    />
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-navy-900">Create Announcement</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        placeholder="Brief headline..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        placeholder="Write your message here..."
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        rows={4}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                    <select
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none bg-white"
                                    >
                                        <option value="All">All Users</option>
                                        <option value="Employees">Employees Only</option>
                                        <option value="Students">Students Only</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        {submitting ? 'Publishing...' : 'Publish Announcement'}
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
