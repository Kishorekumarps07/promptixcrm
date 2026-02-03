import React from 'react';
import Link from 'next/link';
import DashboardWidgetCard from './DashboardWidgetCard';

interface LeaveBalanceCardProps {
    total: number;
    pending: number;
    approved: number;
}

export default function LeaveBalanceCard({ total, pending, approved }: LeaveBalanceCardProps) {
    // Default annual leave allocation (can be configured per company)
    // This is informational only - doesn't block leave requests
    const DEFAULT_ANNUAL_ALLOCATION = 24; // Total leaves per year

    // Calculate used leaves (approved leaves count as used)
    const usedLeaves = approved;

    // Calculate remaining leaves
    const remainingLeaves = DEFAULT_ANNUAL_ALLOCATION - usedLeaves;

    // Calculate percentage used
    const percentageUsed = Math.round((usedLeaves / DEFAULT_ANNUAL_ALLOCATION) * 100);

    return (
        <DashboardWidgetCard
            title="Leave Balance"
            icon="🌴"
            actionLabel="View All"
            actionHref="/employee/leaves"
        >
            {/* Header with allocated leaves */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-4 mb-4">
                <p className="text-sm opacity-90 mb-1">Annual Allocation</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{DEFAULT_ANNUAL_ALLOCATION}</span>
                    <span className="text-sm opacity-90">days</span>
                </div>
            </div>

            {/* Balance breakdown */}
            <div className="space-y-3 mb-4">
                {/* Used leaves */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Used Leaves</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{usedLeaves}</span>
                </div>

                {/* Remaining leaves */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Remaining</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{remainingLeaves}</span>
                </div>

                {/* Pending requests */}
                {pending > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Pending Approval</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{pending}</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Usage</span>
                    <span>{percentageUsed}% used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${percentageUsed > 80 ? 'bg-red-500' :
                                percentageUsed > 50 ? 'bg-yellow-500' :
                                    'bg-green-500'
                            }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Info note */}
            <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-3 text-xs text-gray-600">
                ℹ️ <span className="font-medium">Note:</span> Leave requests are informational. Submit requests anytime - approval is at manager's discretion.
            </div>

            {/* Apply for leave button */}
            <Link
                href="/employee/leaves"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
                Apply for Leave
            </Link>
        </DashboardWidgetCard>
    );
}
