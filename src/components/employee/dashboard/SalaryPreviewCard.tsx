'use client';

import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { generateSalarySlipPDF } from '@/lib/salary-slip-pdf';
import Link from 'next/link';

interface SalaryPreviewCardProps {
    latestSalary: any;
    runningSalary: any;
    onViewBreakdown: () => void;
}

export default function SalaryPreviewCard({ latestSalary, runningSalary, onViewBreakdown }: SalaryPreviewCardProps) {
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
        <ModernGlassCard title="Salary Tracking" headerAction={ViewHistoryButton} delay={0.3} hoverEffect>
            <div className="space-y-6">
                {/* Running Estimate for Current Month */}
                {runningSalary && runningSalary.calculatedSalary !== undefined && (
                    <div className="bg-navy-900 dark:bg-navy-950 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-navy-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-xs font-bold text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                    Current Month Progress
                                </p>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-navy-200">
                                    {monthNames[runningSalary.month] || ''} {runningSalary.year || ''}
                                </span>
                            </div>
                            
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-black tracking-tight">
                                    ₹{(runningSalary.calculatedSalary || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-navy-300 font-medium">earned so far</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1.5 mb-4">
                                <div className="flex justify-between text-[10px] font-bold text-navy-300 uppercase">
                                    <span>Earnings Progress</span>
                                    <span>{Math.round(((runningSalary.calculatedSalary || 0) / (runningSalary.monthlySalary || 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, ((runningSalary.calculatedSalary || 0) / (runningSalary.monthlySalary || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Daily Stats Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                    <p className="text-[9px] text-navy-400 font-bold uppercase mb-0.5">Present</p>
                                    <p className="text-sm font-black text-orange-400">{runningSalary.fullDayCount || 0}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                    <p className="text-[9px] text-navy-400 font-bold uppercase mb-0.5">Leaves</p>
                                    <p className="text-sm font-black text-blue-400">{runningSalary.paidLeaveDays || 0}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                    <p className="text-[9px] text-navy-400 font-bold uppercase mb-0.5">Half Day</p>
                                    <p className="text-sm font-black text-amber-400">{runningSalary.halfDayCount || 0}</p>
                                </div>
                            </div>

                            {/* View Detailed Breakdown Button */}
                            <button 
                                onClick={onViewBreakdown}
                                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                View Detailed Breakdown
                            </button>
                        </div>
                    </div>
                )}

                {/* Latest Payslip Info */}
                {latestSalary ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-px flex-1 bg-gray-100"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latest Payslip</span>
                            <div className="h-px flex-1 bg-gray-100"></div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{monthNames[latestSalary.month] || ''} {latestSalary.year || ''}</p>
                                <p className="text-lg font-black text-navy-900">₹{(latestSalary.calculatedSalary || 0).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadge(latestSalary.status)}`}>
                                {latestSalary.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                <span className="text-xs font-medium text-gray-500">📅 Next Payout</span>
                                <span className="text-xs font-bold text-blue-700">{getNextPayoutDate()}</span>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="bg-white hover:bg-gray-50 text-navy-900 border border-gray-200 rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                📄 Payslip PDF
                            </button>
                        </div>
                    </div>
                ) : !runningSalary && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3 grayscale opacity-70">💰</div>
                        <p className="text-gray-900 font-semibold mb-1">No salary records yet</p>
                        <p className="text-xs text-gray-500 mb-4">Your salary will appear here once generated</p>
                        <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-100 inline-block text-left w-full">
                            <p className="text-xs text-gray-700">
                                <span className="font-bold text-blue-700">Next payout:</span> {getNextPayoutDate()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </ModernGlassCard>
    );
}
