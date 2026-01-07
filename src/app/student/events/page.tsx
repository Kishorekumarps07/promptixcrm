'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    type: string;
    status: string;
    isRegistered: boolean;
}

export default function StudentEvents() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [events, setEvents] = useState<Event[]>([]);
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Feedback Modal State
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchEvents();
        fetchMyEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/student/events');
            const data = await res.json();
            if (data.events) setEvents(data.events);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/student/events/my');
            const data = await res.json();
            if (data.events) setMyEvents(data.events);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRegister = async (eventId: string) => {
        // if (!window.confirm("Register for this event?")) return; // Removed Action Blocker
        setActionLoading(eventId);
        try {
            console.log("Registering for event:", eventId);
            const res = await fetch(`/api/student/events/${eventId}/register`, { method: 'POST' });
            if (res.ok) {
                alert('Registration successful!');
                fetchEvents();
                fetchMyEvents();
            } else {
                const d = await res.json();
                console.error("Registration failed:", d);
                alert(d.message || 'Failed');
            }
        } catch (e) {
            console.error("Network error:", e);
            alert("Network error during registration");
        } finally {
            setActionLoading(null);
        }
    };

    const openFeedback = (eventId: string) => {
        setSelectedEventId(eventId);
        setRating(5);
        setComment('');
        setFeedbackModalOpen(true);
    };

    const submitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;

        try {
            const res = await fetch(`/api/student/events/${selectedEventId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });
            if (res.ok) {
                alert('Thank you for your feedback!');
                setFeedbackModalOpen(false);
                fetchMyEvents();
            } else {
                const d = await res.json();
                alert(d.message || 'Failed');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Events & Workshops</h1>
                    <p className="text-gray-500">Discover and register for upcoming learning opportunities.</p>
                </header>

                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'upcoming' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-navy-900'}`}
                    >
                        Upcoming Events
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'history' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-navy-900'}`}
                    >
                        My History
                    </button>
                </div>

                {activeTab === 'upcoming' ? (
                    loading ? <p className="text-gray-500">Loading events...</p> :
                        events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => (
                                    <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                        <div className="h-2 bg-primary-orange"></div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-navy-50 text-navy-800 rounded-full text-xs font-medium">{event.type}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                {event.isRegistered && <span className="text-green-600 text-xs font-bold">✓ Registered</span>}
                                            </div>

                                            <h3 className="text-xl font-bold text-navy-900 mb-2">{event.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4 flex-1">{event.description}</p>

                                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    📅 {new Date(event.date).toLocaleDateString()}
                                                </div>

                                                <button
                                                    onClick={() => handleRegister(event._id)}
                                                    disabled={event.isRegistered || actionLoading === event._id}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${event.isRegistered
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-navy-900 text-white hover:bg-navy-800'
                                                        }`}
                                                >
                                                    {actionLoading === event._id ? 'Processing...' :
                                                        event.isRegistered ? 'Registered' : 'Register Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                                <p className="text-gray-500">No active events found.</p>
                            </div>
                        )
                ) : (
                    <div className="space-y-4">
                        {myEvents.length > 0 ? myEvents.map(event => (
                            <div key={event._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-navy-900">{event.title}</h3>
                                    <p className="text-sm text-gray-500">📅 {new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'Attended' ? 'bg-green-100 text-green-800' :
                                        event.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {event.status}
                                    </span>
                                    {event.status === 'Attended' && (
                                        event.feedback && event.feedback.rating ? (
                                            <span className="text-xs text-orange-500 font-bold">★ {event.feedback.rating}/5 Submitted</span>
                                        ) : (
                                            <button onClick={() => openFeedback(event._id)} className="text-sm text-primary-orange hover:underline font-medium">
                                                Leave Feedback
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )) : <p className="text-gray-500">No event history found.</p>}
                    </div>
                )}

                {feedbackModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-navy-900">Event Feedback</h2>
                            <form onSubmit={submitFeedback}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Rating</label>
                                    <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary-orange">
                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Comment</label>
                                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary-orange" rows={3} required placeholder="Share your experience..."></textarea>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setFeedbackModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary-orange text-white rounded hover:bg-orange-600 transition-colors font-medium">Submit Feedback</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
