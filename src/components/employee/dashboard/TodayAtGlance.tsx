'use client';

import React from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { Sun, Moon, CloudSun, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TodayAtGlanceProps {
    userName: string;
    attendanceStatus: string;
    date: Date;
}

export default function TodayAtGlance({ userName, attendanceStatus, date }: TodayAtGlanceProps) {
    const isCheckedIn = attendanceStatus === 'Present' || attendanceStatus === 'Late' || attendanceStatus === 'Approved';

    // Determine greeting and icon
    const hour = date.getHours();
    let greeting = 'Good morning';
    let Icon = Sun;

    if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
        Icon = Sun;
    } else if (hour >= 17) {
        greeting = 'Good evening';
        Icon = Moon; // or CloudSun
    }

    const getStatusColor = () => {
        if (isCheckedIn) return 'bg-green-500 text-white';
        if (attendanceStatus === 'Leave') return 'bg-purple-500 text-white';
        return 'bg-amber-500 text-white';
    }

    return (
        <ModernGlassCard className="relative overflow-hidden border-0 !p-0">
            {/* Rich Gradient Background using Standard Tailwind Colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 z-0"></div>

            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0 pointer-events-none"></div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-100">{userName}</span>! 👋
                    </h2>
                    <p className="text-blue-100/80 font-medium flex items-center gap-2 text-sm md:text-base">
                        <Icon size={18} className="text-orange-300" />
                        {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg hover:bg-white/15 transition-colors cursor-default">
                    <div className={`p-3 rounded-xl shadow-inner ${getStatusColor()}`}>
                        {isCheckedIn ? <CheckCircle size={24} strokeWidth={3} /> : <Clock size={24} strokeWidth={3} />}
                    </div>
                    <div>
                        <p className="text-xs text-blue-200 uppercase font-bold tracking-widest mb-0.5">Current Status</p>
                        <p className="font-bold text-xl tracking-tight">{attendanceStatus}</p>
                    </div>
                </div>
            </div>
        </ModernGlassCard>
    );
}
