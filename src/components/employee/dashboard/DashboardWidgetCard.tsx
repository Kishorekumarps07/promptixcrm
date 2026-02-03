import React, { ReactNode } from 'react';
import Link from 'next/link';

interface DashboardWidgetCardProps {
    title: string;
    icon?: string;
    actionLabel?: string;
    actionHref?: string;
    children: ReactNode;
    className?: string;
}

export default function DashboardWidgetCard({
    title,
    icon,
    actionLabel,
    actionHref,
    children,
    className = ''
}: DashboardWidgetCardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
                </div>
                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                        {actionLabel} →
                    </Link>
                )}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}
