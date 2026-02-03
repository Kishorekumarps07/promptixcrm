import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';
import { generateSalarySlipPDF } from '@/lib/salary-slip-pdf';

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

    // Calculate next payout date (5th of next month)
    const getNextPayoutDate = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        // If today is before 5th, next payout is this month's 5th
        // Otherwise, next payout is next month's 5th
        let payoutMonth = currentDay < 5 ? currentMonth : currentMonth + 1;
        let payoutYear = currentYear;

        // Handle December -> January transition
        if (payoutMonth > 11) {
            payoutMonth = 0;
            payoutYear += 1;
        }

        const nextPayout = new Date(payoutYear, payoutMonth, 5);
        return nextPayout.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format payment date
    const formatPaymentDate = (date: string | Date | null) => {
        if (!date) return 'Not yet paid';
        const payDate = new Date(date);
        return payDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <DashboardWidgetCard
            title="Salary Preview"
            icon="💰"
            actionLabel="View History"
            actionHref="/employee/salary"
        >
            {latestSalary ? (
                <>
                    {/* Salary amount header */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100 mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                            {monthNames[latestSalary.month]} {latestSalary.year}
                        </p>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-navy-900">
                                ${latestSalary.calculatedSalary.toLocaleString()}
                            </span>
                        </div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(latestSalary.status)}`}>
                            {latestSalary.status === 'Paid' ? '✅ Paid' :
                                latestSalary.status === 'Approved' ? '🟡 Approved' :
                                    '📝 Draft'}
                        </span>
                    </div>

                    {/* Payment info */}
                    <div className="space-y-2 text-sm mb-4">
                        {/* Payment date (for paid salaries) */}
                        {latestSalary.status === 'Paid' && latestSalary.paidAt && (
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-100">
                                <span className="text-gray-600 flex items-center gap-1">
                                    <span>💳</span>
                                    <span>Paid On</span>
                                </span>
                                <span className="font-semibold text-green-700">
                                    {formatPaymentDate(latestSalary.paidAt)}
                                </span>
                            </div>
                        )}

                        {/* Next payout date */}
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                            <span className="text-gray-600 flex items-center gap-1">
                                <span>📅</span>
                                <span>Next Payout</span>
                            </span>
                            <span className="font-semibold text-blue-700">
                                {getNextPayoutDate()}
                            </span>
                        </div>
                    </div>

                    {/* Salary breakdown */}
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Working Days</span>
                            <span className="font-medium text-navy-900">{latestSalary.workingDays}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Present Days</span>
                            <span className="font-medium text-navy-900">{latestSalary.presentDays}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Per Day Rate</span>
                            <span className="font-medium text-navy-900">${latestSalary.perDayRate}</span>
                        </div>
                    </div>

                    {/* Download button */}
                    <button
                        onClick={handleDownload}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        📄 Download Payslip
                    </button>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">💰</div>
                    <p className="text-gray-500 text-sm">No salary records yet</p>
                    <p className="text-xs text-gray-400 mt-1">Your salary will appear here once generated</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-600">
                            <span className="font-semibold">Next payout:</span> {getNextPayoutDate()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Salaries are processed on the 5th of every month</p>
                    </div>
                </div>
            )}
        </DashboardWidgetCard>
    );
}
