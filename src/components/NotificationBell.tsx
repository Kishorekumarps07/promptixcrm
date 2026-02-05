'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Loader2 } from 'lucide-react'; // Lucide icons for consistency
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'TASK_ASSIGNED' | 'GOAL_ASSIGNED' | 'GENERAL';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                // Calculate unread count from the list (or trust API if it returned count separately)
                // My API limits to 20, but the count in UI should ideally be accurate.
                // For now, let's count unreads in the fetched list as a reasonable approximation for "recent" unreads
                const unread = data.notifications.filter((n: Notification) => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string, link?: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // API Call
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });

            // Navigation
            if (link) {
                setIsOpen(false); // Close dropdown
                router.push(link);
            }
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const markAllRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            // Correct API call (Bulk PATCH is on /api/notifications)
            await fetch('/api/notifications', { method: 'PATCH' });
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) fetchNotifications();
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'TASK_ASSIGNED': return 'bg-blue-500/20 text-blue-400';
            case 'GOAL_ASSIGNED': return 'bg-emerald-500/20 text-emerald-400';
            default: return 'bg-white/10 text-white/60';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-[10px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown with Crystal Glass styling */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#1a1f3c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/20"
                    >
                        {/* Header */}
                        <div className="py-3 px-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <span className="font-semibold text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center text-white/40 flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="text-sm">Updating...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-white/20 flex flex-col items-center gap-2">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    <span className="text-sm">No new notifications</span>
                                </div>
                            ) : (
                                <ul>
                                    {notifications.map(notification => (
                                        <li
                                            key={notification._id}
                                            onClick={() => markAsRead(notification._id, notification.link)}
                                            className={cn(
                                                "p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative",
                                                notification.isRead ? 'opacity-50 hover:opacity-80' : 'bg-blue-500/5'
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn("w-2 h-2 mt-2 rounded-full shrink-0", !notification.isRead ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-transparent")} />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className={cn("text-sm font-medium leading-none", notification.isRead ? 'text-white/60' : 'text-white')}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-[10px] text-white/20 whitespace-nowrap ml-2">
                                                            {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    {notification.link && (
                                                        <div className="pt-1 flex items-center gap-1 text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="w-3 h-3" /> Click to view
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
