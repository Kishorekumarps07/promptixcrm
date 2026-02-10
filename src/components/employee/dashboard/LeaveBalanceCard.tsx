'use client';

import React from 'react';
import Link from 'next/link';
import ModernGlassCard from '@/components/ui/ModernGlassCard';

interface LeaveBalanceCardProps {
    total: number;
    pending: number;
    approved: number;
}

export default function LeaveBalanceCard({ total, pending, approved }: LeaveBalanceCardProps) {
    const DEFAULT_ANNUAL_ALLOCATION = 24;
    const usedLeaves = approved;
    const remainingLeaves = DEFAULT_ANNUAL_ALLOCATION - usedLeaves;
    const percentageUsed = Math.round((usedLeaves / DEFAULT_ANNUAL_ALLOCATION) * 100);

    const ViewAllButton = (
        <Link href="/employee/leaves" className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            View All
        </Link>
    );

    return (
        <ModernGlassCard title="Leave Balance" headerAction={ViewAllButton} delay={0.25} hoverEffect>
            {/* Header with allocated leaves */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-4 mb-5 shadow-lg shadow-emerald-500/20">
                <p className="text-sm font-medium opacity-90 mb-1">Annual Allocation</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{DEFAULT_ANNUAL_ALLOCATION}</span>
                    <span className="text-sm opacity-90">days</span>
                </div>
            </div>

            {/* Balance breakdown */}
            <div className="space-y-3 mb-5">
                {/* Used leaves */}
                <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="text-sm font-semibold text-gray-900">Used Leaves</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{usedLeaves}</span>
                </div>

                {/* Remaining leaves */}
                <div className="flex items-center justify-between p-3 bg-green-50/80 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
                        <span className="text-sm font-semibold text-gray-900">Remaining</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{remainingLeaves}</span>
                </div>

                {/* Pending requests */}
                {pending > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50/80 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-sm animate-pulse"></div>
                            <span className="text-sm font-semibold text-gray-900">Pending Approval</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{pending}</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5">
                    <span>Usage</span>
                    <span>{percentageUsed}% used</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${percentageUsed > 80 ? 'bg-red-500' :
                            percentageUsed > 50 ? 'bg-yellow-500' :
                                'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Apply for leave button */}
            <Link
                href="/employee/leaves"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
            >
                + Apply for Leave
            </Link>
        </ModernGlassCard>
    );
}
