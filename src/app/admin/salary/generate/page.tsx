'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { generateSalarySlipPDF } from '@/lib/salary-slip-pdf';
import { Check, Download, DollarSign, Calendar, CreditCard, Play, FileText, AlertCircle, CheckCircle, Search, X } from 'lucide-react';

export default function SalaryGeneration() {
    const [month, setMonth] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1);
    const [year, setYear] = useState(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());

    const [salaries, setSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<any>(null);
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [transactionRef, setTransactionRef] = useState('');

    useEffect(() => {
        fetchSalaries();
    }, [month, year]);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/salary/generate?month=${month}&year=${year}`);
            const data = await res.json();
            setSalaries(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!confirm(`Generate salaries for ${month + 1}/${year}? This cannot be undone.`)) return;

        setGenerating(true);
        try {
            const res = await fetch('/api/admin/salary/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year, bypassDateCheck: true })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Success! Generated ${data.generatedCount} records.`);
                fetchSalaries();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (e) {
            alert('Failed to generate.');
        } finally {
            setGenerating(false);
        }
    };

    const handleApprove = async (salaryId: string) => {
        if (!confirm('Approve this salary record?')) return;

        try {
            const res = await fetch('/api/admin/salary/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salaryId })
            });

            if (res.ok) {
                fetchSalaries();
            } else {
                const data = await res.json();
                alert(`Error: ${data.message}`);
            }
        } catch (e) {
            alert('Failed to approve salary.');
        }
    };

    const handleMarkAsPaid = async () => {
        if (!selectedSalary) return;

        try {
            const res = await fetch('/api/admin/salary/pay', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    salaryId: selectedSalary._id,
                    paymentDate: paymentDate || new Date().toISOString(),
                    paymentMethod,
                    transactionReference: transactionRef
                })
            });

            const data = await res.json();
            if (res.ok) {
                setShowPayModal(false);
                setSelectedSalary(null);
                setPaymentDate('');
                setTransactionRef('');
                fetchSalaries();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (e) {
            alert('Failed to mark salary as paid.');
        }
    };

    const handleDownloadPDF = (salary: any) => {
        generateSalarySlipPDF({
            employeeName: salary.employeeId?.name || 'Unknown',
            employeeEmail: salary.employeeId?.email || '',
            employeeId: salary.employeeId?._id || '',
            month: salary.month,
            year: salary.year,
            workingDays: salary.workingDays,
            presentDays: salary.presentDays,
            paidLeaveDays: salary.paidLeaveDays || 0,
            unpaidLeaveDays: salary.unpaidLeaveDays || 0,
            perDayRate: salary.perDayRate,
            calculatedSalary: salary.calculatedSalary,
            status: salary.status,
            generatedAt: salary.generatedAt,
            paidAt: salary.paidAt,
            paymentMethod: salary.paymentMethod,
            transactionReference: salary.transactionReference
        });
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24 text-navy-900">
                <PageHeader
                    title="Salary Generation"
                    subtitle="Process monthly payroll and generate slips"
                    breadcrumbs={[
                        { label: 'Admin', href: '/admin/dashboard' },
                        { label: 'Salaries', href: '/admin/salary/generate' }
                    ]}
                    actions={
                        <div className="flex gap-3">
                            <a
                                href="/admin/salary/individual"
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-500 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-sm"
                            >
                                <Search size={18} />
                                Individual Salary
                            </a>
                        </div>
                    }
                />

                <div className="mt-8 mb-8">
                    <ModernGlassCard className="p-8 bg-gradient-to-br from-orange-50/50 via-white to-blue-50/30 border border-orange-100">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            {/* Left Side - Period Selector */}
                            <div className="flex-1 w-full">
                                <h3 className="text-lg font-black text-navy-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" />
                                    Select Payroll Period
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Year</label>
                                        <div className="relative">
                                            <select
                                                value={year} onChange={e => setYear(Number(e.target.value))}
                                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-lg font-bold text-navy-900 appearance-none cursor-pointer hover:border-orange-300"
                                            >
                                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Month</label>
                                        <div className="relative">
                                            <select
                                                value={month} onChange={e => setMonth(Number(e.target.value))}
                                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-lg font-bold text-navy-900 appearance-none cursor-pointer hover:border-orange-300"
                                            >
                                                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Action Button */}
                            <div className="w-full md:w-auto flex flex-col items-center gap-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-white transition-all shadow-2xl flex items-center justify-center gap-3 text-lg transform hover:scale-105 active:scale-95 ${generating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30'
                                        }`}
                                >
                                    {generating ? <div className="animate-spin h-6 w-6 border-3 border-white rounded-full border-t-transparent" /> : <Play size={24} fill="currentColor" />}
                                    {generating ? 'Processing...' : 'Run Payroll Batch'}
                                </button>
                                <p className="text-xs text-gray-500 font-medium text-center">Generate slips for all employees</p>
                            </div>
                        </div>
                    </ModernGlassCard>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
                            Batch Records <span className="bg-navy-100 text-navy-700 px-2 py-0.5 rounded-md text-xs">{salaries.length}</span>
                        </h3>
                        {salaries.length === 0 && !loading && (
                            <span className="text-sm text-gray-500 italic">No records generated for this period yet.</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center opacity-50">
                            <div className="animate-spin h-10 w-10 border-4 border-navy-900 rounded-full border-t-transparent"></div>
                        </div>
                    ) : salaries.length > 0 ? (
                        salaries.map((salary, idx) => (
                            <ModernGlassCard key={salary._id} delay={idx * 0.05} className="!p-0 overflow-hidden hover:border-orange-200 transition-colors">
                                {/* Header Row */}
                                <div className="p-5 bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm">
                                            {salary.employeeId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-navy-900 text-lg leading-tight">{salary.employeeId?.name || 'Unknown'}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{salary.employeeId?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${salary.status === 'Draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            salary.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {salary.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Attendance Breakdown */}
                                <div className="p-5 bg-white">
                                    <div className="mb-4">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Attendance Breakdown</h5>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {/* Working Days */}
                                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-black text-blue-700">{salary.workingDays}</div>
                                                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">Working Days</div>
                                            </div>

                                            {/* Full Days */}
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-black text-green-700">
                                                    {salary.halfDays ? salary.presentDays - salary.halfDays : salary.presentDays}
                                                </div>
                                                <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-1">Full Days</div>
                                            </div>

                                            {/* Half Days */}
                                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-black text-orange-700">{salary.halfDays || 0}</div>
                                                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-1">Half Days</div>
                                            </div>

                                            {/* Paid Leave */}
                                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-black text-purple-700">{salary.paidLeaveDays || 0}</div>
                                                <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mt-1">Paid Leave</div>
                                            </div>

                                            {/* Unpaid Absences */}
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                                                <div className="text-2xl font-black text-red-700">{salary.unpaidLeaveDays || 0}</div>
                                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1">Unpaid Days</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payable Days Calculation */}
                                    <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 border border-indigo-100 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Payable Days Formula</div>
                                                <div className="text-sm font-mono text-gray-700">
                                                    {salary.halfDays ? salary.presentDays - salary.halfDays : salary.presentDays} Full + ({salary.halfDays || 0} × 0.5) + {salary.paidLeaveDays || 0} Paid Leave =
                                                    <span className="font-black text-indigo-700 ml-1">
                                                        {((salary.halfDays ? salary.presentDays - salary.halfDays : salary.presentDays) + (salary.halfDays || 0) * 0.5 + (salary.paidLeaveDays || 0)).toFixed(1)} days
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Salary Calculation */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Per Day Rate</div>
                                                <div className="font-bold text-navy-900 text-lg">${salary.perDayRate}</div>
                                            </div>
                                            <div className="h-12 w-px bg-gray-200"></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Payout</div>
                                                <div className="font-black text-2xl text-green-600">${salary.calculatedSalary.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {salary.status === 'Draft' && (
                                                <button
                                                    onClick={() => handleApprove(salary._id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                    title="Approve Salary"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                            {salary.status === 'Approved' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSalary(salary);
                                                        setShowPayModal(true);
                                                    }}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                                                    title="Mark as Paid"
                                                >
                                                    <DollarSign size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownloadPDF(salary)}
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors tooltip"
                                                title="Download Slip"
                                            >
                                                <FileText size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ModernGlassCard>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white/50 rounded-2xl border border-dashed border-gray-300">
                            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-600">No Data Available</h3>
                            <p className="text-gray-400 text-sm">Click "Run Payroll Batch" to generate records.</p>
                        </div>
                    )}
                </div>

                {/* Pay Modal */}
                {showPayModal && selectedSalary && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-in fade-in" onClick={() => setShowPayModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle size={24} className="text-green-200" /> Confirm Payment</h3>
                                    <p className="text-green-100 text-sm mt-1 opacity-90">Processing payout for {selectedSalary.employeeId?.name}</p>
                                </div>
                                <button onClick={() => setShowPayModal(false)} className="text-white/70 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Amount to Pay</p>
                                    <p className="text-4xl font-black text-green-700">${selectedSalary.calculatedSalary.toLocaleString()}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-navy-900"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-navy-900"
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference ID <span className="text-gray-400 font-normal lowercase">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                        placeholder="e.g. TXN-8839201"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-navy-900 placeholder:font-normal"
                                    />
                                </div>

                                <button
                                    onClick={handleMarkAsPaid}
                                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 hover:shadow-green-600/40 active:scale-95 transition-all mt-2"
                                >
                                    Complete Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
