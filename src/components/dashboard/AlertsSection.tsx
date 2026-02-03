'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, X } from 'lucide-react';

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
        // Refresh alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-navy-900">Requires Attention</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (visibleAlerts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-bold text-navy-900">All Clear!</h3>
                </div>
                <p className="text-sm text-gray-500">No critical items requiring attention at this time.</p>
            </div>
        );
    }

    const getAlertBorderColor = (type: string) => {
        switch (type) {
            case 'critical': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            case 'info': return 'border-l-blue-500';
            default: return 'border-l-gray-500';
        }
    };

    const getAlertBgColor = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-50';
            case 'high': return 'bg-orange-50';
            case 'medium': return 'bg-yellow-50';
            case 'info': return 'bg-blue-50';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-navy-900">
                        Requires Attention ({visibleAlerts.length})
                    </h3>
                </div>
            </div>

            <div className="space-y-3">
                {visibleAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className={`relative ${getAlertBgColor(alert.type)} border-l-4 ${getAlertBorderColor(alert.type)} rounded-lg p-4 transition-all hover:shadow-sm`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{alert.icon}</span>
                                    <h4 className="font-semibold text-navy-900 text-sm">{alert.title}</h4>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                                <Link
                                    href={alert.link}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                                >
                                    {alert.action} →
                                </Link>
                            </div>
                            <button
                                onClick={() => handleDismiss(alert.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
