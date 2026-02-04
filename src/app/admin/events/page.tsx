'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { Calendar, MapPin, Users, Edit, Trash2, Plus, Clock, CheckCircle, Archive, X, Save, AlertCircle } from 'lucide-react';

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', date: '', type: 'Workshop', isActive: true });
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/events');
            const data = await res.json();
            if (data.events) setEvents(data.events);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
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
            date: event.date.split('T')[0],
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
        if (!confirm('Are you sure you want to delete this event?')) return;
        await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
        fetchEvents();
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-24 text-navy-900">
                <PageHeader
                    title="Event Management"
                    subtitle="Organize workshops, bootcamps, and sessions"
                    breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Events' }]}
                    actions={
                        <button
                            onClick={openCreateModal}
                            className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-navy-900/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                        >
                            <Plus size={18} strokeWidth={3} /> New Event
                        </button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-white/50 animate-pulse"></div>
                        ))
                    ) : events.length > 0 ? (
                        events.map((event, idx) => (
                            <ModernGlassCard key={event._id} delay={idx * 0.1} className="!p-0 flex flex-col h-full group hover:-translate-y-1 transition-transform duration-300">
                                {/* Date Banner */}
                                <div className={`h-24 relative overflow-hidden p-6 flex flex-col justify-between ${event.type === 'Workshop' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                                    event.type === 'Bootcamp' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                                    }`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12 scale-150">
                                        <Calendar size={64} color="white" />
                                    </div>
                                    <div className="relative z-10 flex justify-between items-start text-white">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
                                            {event.type}
                                        </div>
                                        <select
                                            value={event.status || 'Upcoming'}
                                            onChange={(e) => updateStatus(event._id, e.target.value)}
                                            className="bg-black/20 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-white/10 outline-none cursor-pointer hover:bg-black/30 transition-colors appearance-none"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <option value="Upcoming" className="text-navy-900">Upcoming</option>
                                            <option value="Ongoing" className="text-navy-900">Ongoing</option>
                                            <option value="Completed" className="text-navy-900">Completed</option>
                                            <option value="Archived" className="text-navy-900">Archived</option>
                                        </select>
                                    </div>
                                    <div className="relative z-10 text-white mt-auto flex items-end gap-2">
                                        <h3 className="text-3xl font-black leading-none">{new Date(event.date).getDate()}</h3>
                                        <span className="text-sm font-bold opacity-80 mb-1">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-navy-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {event.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => window.location.href = `/admin/events/${event._id}`}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                        >
                                            <Users size={14} /> View Attendees
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(event)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Event"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ModernGlassCard>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold text-navy-900">No Events Scheduled</h3>
                            <p className="text-gray-500">Create your first event to get started.</p>
                        </div>
                    )}
                </div>

                {/* Glass Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in duration-200" onClick={closeModal}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-black text-navy-900 tracking-tight">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {editingEvent ? 'Update event details' : 'Schedule a new company event'}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Title</label>
                                    <input
                                        placeholder="e.g. Annual Tech Symposium"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-navy-900"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-navy-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-navy-900 bg-white"
                                        >
                                            <option value="Workshop">Workshop</option>
                                            <option value="Bootcamp">Bootcamp</option>
                                            <option value="Guest Lecture">Guest Lecture</option>
                                            <option value="Hackathon">Hackathon</option>
                                            <option value="Meeting">Meeting</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        placeholder="Event details, agenda, and location..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-navy-900 text-white rounded-xl hover:bg-indigo-600 font-bold shadow-lg shadow-navy-900/20 hover:shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2 text-sm"
                                    >
                                        <Save size={16} />
                                        {editingEvent ? 'Update Event' : 'Create Event'}
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
