'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">Event Management</h1>
                    </div>
                    <button
                        className="btn btn-primary bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        onClick={openCreateModal}
                        style={{ minHeight: '44px' }}
                    >
                        + New Event
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <Table
                        data={events}
                        loading={false}
                        columns={[
                            { header: 'Date', accessor: (e) => new Date(e.date).toLocaleDateString() },
                            {
                                header: 'Title', accessor: (e) => (
                                    <div>
                                        <div className="font-bold text-navy-900">{e.title}</div>
                                        <div className="text-xs text-gray-500">{e.description}</div>
                                    </div>
                                )
                            },
                            { header: 'Type', accessor: (e) => <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">{e.type}</span> },
                            {
                                header: 'Status', accessor: (e) => (
                                    <select
                                        value={e.status || 'Upcoming'}
                                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                                        className={`px-2 py-1 rounded text-xs border-none cursor-pointer font-semibold ${e.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            e.status === 'Archived' ? 'bg-gray-200 text-gray-600' :
                                                e.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                )
                            },
                            {
                                header: 'Actions', accessor: (e) => (
                                    <div className="flex gap-2">
                                        <button onClick={() => window.location.href = `/admin/events/${e._id}`} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">Attendance</button>
                                        <button onClick={() => openEditModal(e)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                                        <button onClick={() => deleteEvent(e._id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
                                    </div>
                                )
                            }
                        ]}
                        mobileCard={(e) => (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-navy-900">{e.title}</div>
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">{e.type}</span>
                                </div>
                                <div className="text-sm text-gray-600">{e.description}</div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{new Date(e.date).toLocaleDateString()}</span>
                                    <select
                                        value={e.status || 'Upcoming'}
                                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                                        className={`px-2 py-1 rounded text-xs border-none cursor-pointer font-semibold ${e.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            e.status === 'Archived' ? 'bg-gray-200 text-gray-600' :
                                                e.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button onClick={() => window.location.href = `/admin/events/${e._id}`} className="text-center py-2 bg-indigo-50 text-indigo-600 text-xs font-medium rounded shadow-sm">Attendance</button>
                                    <button onClick={() => openEditModal(e)} className="text-center py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded shadow-sm">Edit</button>
                                    <button onClick={() => deleteEvent(e._id)} className="text-center py-2 bg-red-50 text-red-600 text-xs font-medium rounded shadow-sm">Delete</button>
                                </div>
                            </div>
                        )}
                    />
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
