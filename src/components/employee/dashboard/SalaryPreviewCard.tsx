'use client';

import React from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { generateSalarySlipPDF } from '@/lib/salary-slip-pdf';
import Link from 'next/link';

interface SalaryPreviewCardProps {
    latestSalary: any;
}

export default function SalaryPreviewCard({ latestSalary }: SalaryPreviewCardProps) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const handleDownload = () => {
        if (!latestSalary) return;
        generateSalarySlipPDF({
            employeeName: latestSalary.employeeId?.name || 'Employee',
            employeeEmail: latestSalary.employeeId?.email || '',
            employeeId: latestSalary.employeeId?._id || '',
            month: latestSalary.month,
            year: latestSalary.year,
            workingDays: latestSalary.workingDays,
            presentDays: latestSalary.presentDays,
            paidLeaveDays: latestSalary.paidLeaveDays || 0,
            unpaidLeaveDays: latestSalary.unpaidLeaveDays || 0,
            perDayRate: latestSalary.perDayRate,
            calculatedSalary: latestSalary.calculatedSalary,
            status: latestSalary.status,
            generatedAt: latestSalary.generatedAt,
            paidAt: latestSalary.paidAt,
            paymentMethod: latestSalary.paymentMethod,
            transactionReference: latestSalary.transactionReference
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Paid') return 'bg-green-100 text-green-700';
        if (status === 'Approved') return 'bg-blue-100 text-blue-700';
        if (status === 'Draft') return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getNextPayoutDate = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const payoutMonth = today.getDate() < 5 ? currentMonth : currentMonth + 1;
        const payoutYear = today.getFullYear() + (payoutMonth > 11 ? 1 : 0);
        const nextPayout = new Date(payoutYear, payoutMonth % 12, 5);
        return nextPayout.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatPaymentDate = (date: string | Date | null) => {
        if (!date) return 'Not yet paid';
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const ViewHistoryButton = (
        <Link href="/employee/salary" className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
            View History
        </Link>
    );

    return (
        <ModernGlassCard title="Salary Preview" headerAction={ViewHistoryButton} delay={0.3} hoverEffect>
            {latestSalary ? (
                <>
                    {/* Salary amount header */}
                    <div className="bg-gradient-to-r from-orange-100 to-amber-50 rounded-xl p-4 border border-orange-100 mb-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <p className="text-sm text-gray-600 font-medium mb-1">
                            {monthNames[latestSalary.month]} {latestSalary.year}
                        </p>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-black text-navy-900 tracking-tight">
                                ${latestSalary.calculatedSalary.toLocaleString()}
                            </span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(latestSalary.status)}`}>
                            {latestSalary.status === 'Paid' ? (
                                <>
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Paid
                                </>
                            ) : (
                                latestSalary.status
                            )}
                        </span>
                    </div>

                    {/* Payment info */}
                    <div className="space-y-3 mb-5">
                        {latestSalary.status === 'Paid' && latestSalary.paidAt && (
                            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
                                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <span>💳</span> Paid On
                                </span>
                                <span className="text-sm font-bold text-green-700">
                                    {formatPaymentDate(latestSalary.paidAt)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <span>📅</span> Next Payout
                            </span>
                            <span className="text-sm font-bold text-blue-700">
                                {getNextPayoutDate()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-navy-900/20 hover:shadow-navy-900/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        📄 Download Payslip
                    </button>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3 grayscale opacity-70">💰</div>
                    <p className="text-gray-900 font-semibold mb-1">No salary records yet</p>
                    <p className="text-xs text-gray-500 mb-4">Your salary will appear here once generated</p>
                    <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-100 inline-block text-left w-full">
                        <p className="text-xs text-gray-700">
                            <span className="font-bold text-blue-700">Next payout:</span> {getNextPayoutDate()}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">Salaries are usually processed on the 5th.</p>
                    </div>
                </div>
            )}
        </ModernGlassCard>
    );
}
