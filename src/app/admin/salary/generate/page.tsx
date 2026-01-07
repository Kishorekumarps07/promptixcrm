'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';
import { generateSalarySlipPDF } from '@/lib/salary-slip-pdf';

export default function SalaryGeneration() {
    const [month, setMonth] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1); // Default previous month
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
                // bypassDateCheck: true can be added here for testing if needed
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

            const data = await res.json();
            if (res.ok) {
                alert('Salary approved successfully!');
                fetchSalaries();
            } else {
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
                alert('Salary marked as paid successfully!');
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

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-navy-900">Generate Salaries</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Calculate and create draft salary records</p>
                    </div>
                </header>

                {/* Controls */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            value={year} onChange={e => setYear(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                            value={month} onChange={e => setMonth(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={`w-full px-6 py-2.5 rounded font-bold text-white transition-all shadow-sm ${generating ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600 shadow-md'
                            }`}
                        style={{ minHeight: '44px' }}
                    >
                        {generating ? 'Generating...' : 'Generate Batch'}
                    </button>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-navy-800">Draft Salaries ({salaries.length})</h3>
                        <span className="text-xs text-gray-500">Status: {salaries.length > 0 ? 'Generated' : 'Pending'}</span>
                    </div>

                    <Table
                        data={salaries}
                        columns={[
                            {
                                header: "Employee",
                                accessor: (rec) => (
                                    <div>
                                        <div className="font-medium text-navy-900">{rec.employeeId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{rec.employeeId?.email}</div>
                                    </div>
                                )
                            },
                            {
                                header: "Per Day Rate",
                                accessor: (rec) => `$${rec.perDayRate}`
                            },
                            {
                                header: "Attended (Days)",
                                accessor: (rec) => <span className="font-bold">{rec.presentDays} / {rec.workingDays}</span>
                            },
                            {
                                header: "Calculated Salary",
                                accessor: (rec) => <span className="font-bold text-green-600">${rec.calculatedSalary.toLocaleString()}</span>
                            },
                            {
                                header: "Status",
                                accessor: (rec) => {
                                    const statusColors: any = {
                                        Draft: 'bg-yellow-100 text-yellow-700',
                                        Approved: 'bg-blue-100 text-blue-700',
                                        Paid: 'bg-green-100 text-green-700'
                                    };
                                    return (
                                        <span className={`px-2 py-1 ${statusColors[rec.status] || 'bg-gray-100 text-gray-700'} rounded text-xs font-bold uppercase`}>
                                            {rec.status}
                                        </span>
                                    );
                                }
                            },
                            {
                                header: "Actions",
                                accessor: (rec) => (
                                    <div className="flex gap-2">
                                        {rec.status === 'Draft' && (
                                            <button
                                                onClick={() => handleApprove(rec._id)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {rec.status === 'Approved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedSalary(rec);
                                                    setShowPayModal(true);
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDownloadPDF(rec)}
                                            className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600"
                                            title="Download Salary Slip"
                                        >
                                            📄 PDF
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        mobileCard={(rec) => (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-navy-900 text-lg">{rec.employeeId?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{rec.employeeId?.email}</div>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase tracking-wider">
                                        {rec.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Final Salary</span>
                                        <span className="font-bold text-green-600 text-xl">${rec.calculatedSalary.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Attendance</span>
                                        <span className="font-medium text-navy-800 text-lg">{rec.presentDays} <span className="text-gray-400 text-sm font-normal">/ {rec.workingDays}</span></span>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                                        <span>Daily Rate:</span>
                                        <span className="font-mono text-navy-700">${rec.perDayRate}/day</span>
                                    </div>
                                </div>

                                {/* Mobile Actions */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        {rec.status === 'Draft' && (
                                            <button
                                                onClick={() => handleApprove(rec._id)}
                                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
                                                style={{ minHeight: '44px' }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {rec.status === 'Approved' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedSalary(rec);
                                                    setShowPayModal(true);
                                                }}
                                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
                                                style={{ minHeight: '44px' }}
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDownloadPDF(rec)}
                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600"
                                        style={{ minHeight: '44px' }}
                                    >
                                        📄 Download Salary Slip
                                    </button>
                                </div>
                            </div>
                        )}
                        loading={loading}
                    />
                </div>

                {/* Mark as Paid Modal */}
                {showPayModal && selectedSalary && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-navy-900">Mark Salary as Paid</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedSalary.employeeId?.name} - ${selectedSalary.calculatedSalary.toLocaleString()}
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Check">Check</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference (Optional)</label>
                                    <input
                                        type="text"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                        placeholder="e.g., TXN123456"
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPayModal(false);
                                        setSelectedSalary(null);
                                        setPaymentDate('');
                                        setTransactionRef('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50"
                                    style={{ minHeight: '44px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMarkAsPaid}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
                                    style={{ minHeight: '44px' }}
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
