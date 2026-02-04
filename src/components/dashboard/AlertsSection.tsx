'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { AlertCircle, X, Bell, ChevronRight } from 'lucide-react';

interface Alert {
    id: string;
    type: 'critical' | 'high' | 'medium' | 'info';
    priority: number;
    title: string;
    message: string;
    action: string;
    link: string;
    icon: string;
    count: number;
}

export default function AlertsSection() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/admin/stats/alerts');
            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = (alertId: string) => {
        setDismissed(prev => new Set(prev).add(alertId));
    };

    const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

    if (loading) {
        return (
            <ModernGlassCard className="animate-pulse">
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
            </ModernGlassCard>
        );
    }

    if (visibleAlerts.length === 0) return null;

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-50 border-red-100 text-red-900 icon-red-500';
            case 'high': return 'bg-orange-50 border-orange-100 text-orange-900 icon-orange-500';
            case 'medium': return 'bg-yellow-50 border-yellow-100 text-yellow-900 icon-yellow-600';
            default: return 'bg-blue-50 border-blue-100 text-blue-900 icon-blue-500';
        }
    };

    return (
        <ModernGlassCard className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg animate-pulse">
                        <Bell size={18} fill="currentColor" />
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">
                        Requires Attention <span className="text-gray-400 font-medium text-sm ml-1">({visibleAlerts.length})</span>
                    </h3>
                </div>
            </div>

            <div className="space-y-3">
                {visibleAlerts.map(alert => {
                    const style = getAlertStyle(alert.type);
                    return (
                        <div
                            key={alert.id}
                            className={`relative rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${style.split(' icon')[0]}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-2xl pt-0.5">{alert.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm mb-0.5">{alert.title}</h4>
                                    <p className="text-xs opacity-80 mb-2 leading-relaxed">{alert.message}</p>
                                    <Link
                                        href={alert.link}
                                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline"
                                    >
                                        {alert.action} <ChevronRight size={12} strokeWidth={3} />
                                    </Link>
                                </div>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors absolute top-2 right-2"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ModernGlassCard>
    );
}
