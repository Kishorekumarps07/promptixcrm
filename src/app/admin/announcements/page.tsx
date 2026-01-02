'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', target: 'All' });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        if (data.announcements) setAnnouncements(data.announcements);
    };

    const handeCreate = async (e: React.FormEvent) => {
        e.preventDefault();
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
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <div className="page-header">
                    <h1>Announcement Center</h1>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ New Announcement</button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map(ann => (
                                <tr key={ann._id}>
                                    <td>{new Date(ann.date).toLocaleDateString()}</td>
                                    <td>{ann.title}</td>
                                    <td><span className="badge badge-info">{ann.target}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>Create Announcement</h2>
                            <form onSubmit={handeCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="field-input" style={{ padding: '0.5rem' }} />
                                <textarea placeholder="Message Content" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required className="field-input" style={{ padding: '0.5rem', minHeight: '100px' }} />
                                <select value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} className="field-input" style={{ padding: '0.5rem' }}>
                                    <option value="All">All Users</option>
                                    <option value="Employees">Employees Only</option>
                                    <option value="Students">Students Only</option>
                                </select>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Publish</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
