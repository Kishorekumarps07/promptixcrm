'use client';

import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface EnhancedKPICardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    trend?: number; // Percentage change (positive for increase, negative for decrease)
    link?: string; // Make card clickable
    badge?: number; // Show badge for pending items
    loading?: boolean;
}

export default function EnhancedKPICard({
    title,
    value,
    icon,
    color,
    trend,
    link,
    badge,
    loading = false
}: EnhancedKPICardProps) {
    const getTrendIcon = () => {
        if (!trend || trend === 0) return <Minus className="w-4 h-4" />;
        return trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!trend || trend === 0) return 'text-gray-500';
        return trend > 0 ? 'text-green-600' : 'text-red-600';
    };

    const cardContent = (
        <div className={`relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 ${link ? 'hover:shadow-md hover:border-orange-200 cursor-pointer' : ''
            }`}>
            {/* Badge for pending items */}
            {badge !== undefined && badge > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
                    {badge > 99 ? '99+' : badge}
                </div>
            )}

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${color} mb-4 text-3xl`}>
                {loading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                ) : (
                    icon
                )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>

            {/* Value */}
            <div className="flex items-end justify-between">
                {loading ? (
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <p className="text-3xl font-bold text-navy-900">{value}</p>
                )}

                {/* Trend indicator */}
                {trend !== undefined && !loading && (
                    <div className={`flex items-center gap-1 ${getTrendColor()} text-sm font-semibold`}>
                        {getTrendIcon()}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            {/* Trend description */}
            {trend !== undefined && !loading && (
                <p className="text-xs text-gray-500 mt-2">
                    {trend > 0 ? '↑ Increased' : trend < 0 ? '↓ Decreased' : 'No change'} from last month
                </p>
            )}
        </div>
    );

    if (link && !loading) {
        return <Link href={link}>{cardContent}</Link>;
    }

    return cardContent;
}
