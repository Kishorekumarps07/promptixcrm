'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', date: '', type: 'Workshop', isActive: true });

    const [editingEvent, setEditingEvent] = useState<any>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch('/api/admin/events');
        const data = await res.json();
        if (data.events) setEvents(data.events);
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setFormData({ title: '', description: '', date: '', type: 'Workshop', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (event: any) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0], // Format date for input
            type: event.type,
            isActive: event.isActive
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingEvent ? `/api/admin/events/${editingEvent._id}` : '/api/admin/events';
        const method = editingEvent ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            closeModal();
            fetchEvents();
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        await fetch(`/api/admin/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchEvents();
    };

    const deleteEvent = async (id: string) => {
        // if (!confirm('Are you sure?')) return; // Removed Action Blocker
        await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
        fetchEvents();
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <div className="page-header">
                    <h1>Event Management</h1>
                    <button className="btn btn-primary" onClick={openCreateModal}>+ New Event</button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event._id}>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>
                                        <strong>{event.title}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>{event.description}</div>
                                    </td>
                                    <td><span className="badge badge-info">{event.type}</span></td>
                                    <td>
                                        <select
                                            value={event.status || 'Upcoming'}
                                            onChange={(e) => updateStatus(event._id, e.target.value)}
                                            className={`badge border-none cursor-pointer ${event.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                event.status === 'Archived' ? 'bg-gray-200 text-gray-600' :
                                                    event.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            <option value="Upcoming">Upcoming</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="action-btn" style={{ marginRight: '0.5rem' }} onClick={() => window.location.href = `/admin/events/${event._id}`}>Attendance</button>
                                        <button className="action-btn" style={{ marginRight: '0.5rem' }} onClick={() => openEditModal(event)}>Edit</button>
                                        <button className="action-btn btn-delete" onClick={() => deleteEvent(event._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="field-input" style={{ padding: '0.5rem' }} />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="field-input" style={{ padding: '0.5rem' }} />
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="field-input" style={{ padding: '0.5rem' }} />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="field-input" style={{ padding: '0.5rem' }}>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Bootcamp">Bootcamp</option>
                                    <option value="Guest Lecture">Guest Lecture</option>
                                </select>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button type="button" onClick={closeModal} className="btn">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editingEvent ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
