'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Calendar, MapPin, Star, MessageSquare, Check, Clock, X } from 'lucide-react';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    type: string;
    status: string;
    isRegistered: boolean;
    venue?: string;
}

export default function EmployeeEvents() {
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
            const res = await fetch('/api/employee/events');
            const data = await res.json();
            if (data.events) setEvents(data.events);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchMyEvents = async () => {
        try {
            const res = await fetch('/api/employee/events/my');
            const data = await res.json();
            if (data.events) setMyEvents(data.events);
        } catch (error) { console.error(error); }
    };

    const handleRegister = async (eventId: string) => {
        setActionLoading(eventId);
        try {
            const res = await fetch(`/api/employee/events/${eventId}/register`, { method: 'POST' });
            if (res.ok) {
                // alert('Registered Successfully!'); 
                // Removed alert for better UX, could use toast
                fetchEvents();
                fetchMyEvents();
            } else {
                const d = await res.json();
                alert(d.message || "Registration failed");
            }
        } finally { setActionLoading(null); }
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
            const res = await fetch(`/api/employee/events/${selectedEventId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });
            if (res.ok) {
                setFeedbackModalOpen(false);
                fetchMyEvents();
            } else {
                const d = await res.json();
                alert(d.message || 'Failed');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24">
                <PageHeader
                    title="Company Events"
                    subtitle="Discover upcoming workshops, parties, and team building activities."
                />

                {/* Glass Tabs */}
                <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-xl max-w-md mb-8 border border-white/50 shadow-sm relative z-10">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'upcoming'
                                ? 'bg-white text-orange-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-navy-900'
                            }`}
                    >
                        Upcoming Events
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'history'
                                ? 'bg-white text-orange-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-navy-900'
                            }`}
                    >
                        My History
                    </button>
                </div>

                {activeTab === 'upcoming' ? (
                    loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event, idx) => (
                                <ModernGlassCard
                                    key={event._id}
                                    className="flex flex-col h-full !p-0 overflow-hidden group"
                                    delay={idx * 0.1}
                                    hoverEffect
                                >
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                                                {event.type}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 bg-white/50 px-2 py-1 rounded backdrop-blur-sm border border-white/60">
                                                {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-orange-600 transition-colors">
                                            {event.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                                            {event.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-6">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {event.venue && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    <span>{event.venue}</span>
                                                </div>
                                            )}
                                        </div>

                                        {event.isRegistered ? (
                                            <div className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-xl border border-green-100 flex items-center justify-center gap-2 cursor-default mt-auto">
                                                <Check size={18} strokeWidth={3} /> Registered
                                            </div>
                                        ) : (
                                            <button
                                                className="w-full py-3 bg-navy-900 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 mt-auto disabled:opacity-70 disabled:hover:translate-y-0"
                                                onClick={() => handleRegister(event._id)}
                                                disabled={actionLoading === event._id}
                                            >
                                                {actionLoading === event._id ? 'Registering...' : 'Register Now'}
                                            </button>
                                        )}
                                    </div>
                                </ModernGlassCard>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <div className="text-6xl mb-4 grayscale">🎉</div>
                            <h3 className="text-xl font-bold text-navy-900">No Upcoming Events</h3>
                            <p className="text-gray-500">Check back later for new announcements.</p>
                        </div>
                    )
                ) : (
                    <div className="space-y-4 max-w-4xl">
                        {myEvents.length > 0 ? myEvents.map((event, idx) => (
                            <ModernGlassCard key={event._id} delay={idx * 0.1} className="!p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex flex-col items-center justify-center text-xs font-bold border border-orange-200">
                                        <span className="text-lg leading-none">{new Date(event.date).getDate()}</span>
                                        <span className="uppercase text-[10px] opacity-80">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-navy-900 group-hover:text-orange-600 transition-colors">{event.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${event.status === 'Attended' ? 'bg-green-50 text-green-700 border-green-100' :
                                        event.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {event.status}
                                    </span>
                                    {event.status === 'Attended' && (
                                        event.feedback && event.feedback.rating ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                                                <Star size={12} fill="currentColor" /> {event.feedback.rating}/5
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => openFeedback(event._id)}
                                                className="px-3 py-1.5 text-xs bg-navy-900 text-white rounded-lg font-bold hover:bg-orange-500 transition-colors shadow-sm flex items-center gap-1.5"
                                            >
                                                <MessageSquare size={12} /> Feedback
                                            </button>
                                        )
                                    )}
                                </div>
                            </ModernGlassCard>
                        )) : (
                            <div className="text-center py-20 opacity-50">
                                <p className="text-gray-500 font-medium">No event history found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Glass Feedback Modal */}
                {feedbackModalOpen && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white/90 backdrop-filter backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                                <h2 className="text-lg font-black text-navy-900">Event Feedback</h2>
                                <button
                                    onClick={() => setFeedbackModalOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={submitFeedback} className="p-6">
                                <div className="mb-5 text-center">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Rate your experience</label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-2 rounded-full transition-all hover:scale-110 ${rating >= star ? 'text-orange-400' : 'text-gray-200'}`}
                                            >
                                                <Star size={28} fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center mt-2 text-sm font-bold text-orange-500">
                                        {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Comments</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm resize-none shadow-sm"
                                        rows={3}
                                        required
                                        placeholder="What did you like the most?"
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-bold shadow-lg shadow-navy-900/20 transition-all hover:-translate-y-0.5">
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
