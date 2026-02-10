'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, DollarSign, Bell, CalendarDays, Key, FileText, Briefcase } from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';

export default function QuickActionsCard() {
    const actions = [
        {
            label: "Apply Leave",
            href: "/employee/leaves",
            icon: <Calendar size={20} />,
            color: "bg-blue-500",
            desc: "Request time off"
        },
        {
            label: "My Profile",
            href: "/employee/profile",
            icon: <User size={20} />,
            color: "bg-purple-500",
            desc: "View & edit details"
        },
        {
            label: "Payslips",
            href: "/employee/salary",
            icon: <DollarSign size={20} />,
            color: "bg-green-500",
            desc: "View salary history"
        },
        {
            label: "Policies",
            href: "#", // Placeholder
            icon: <FileText size={20} />,
            color: "bg-orange-500",
            desc: "Company handbook"
        },
        {
            label: "Events",
            href: "/employee/events",
            icon: <CalendarDays size={20} />,
            color: "bg-pink-500",
            desc: "Upcoming events"
        },
        {
            label: "Attendance",
            href: "/employee/attendance", // Assuming this exists or will exist
            icon: <Briefcase size={20} />,
            color: "bg-teal-500",
            desc: "View records"
        }
    ];

    return (
        <ModernGlassCard title="Quick Actions" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white/40 border border-white/60 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-white/80"
                    >
                        <div className={`p-3 rounded-full text-white shadow-md mb-3 ${action.color} group-hover:rotate-12 transition-transform duration-300`}>
                            {action.icon}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{action.label}</span>
                        <span className="text-[10px] text-gray-500 mt-1 hidden md:block">{action.desc}</span>
                    </Link>
                ))}
            </div>
        </ModernGlassCard>
    );
}
