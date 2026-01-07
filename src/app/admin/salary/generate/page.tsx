'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function SalaryGeneration() {
    const [month, setMonth] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1); // Default previous month
    const [year, setYear] = useState(new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear());

    const [salaries, setSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

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
                                accessor: (rec) => (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase">
                                        {rec.status}
                                    </span>
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
                            </div>
                        )}
                        loading={loading}
                    />
                </div>
            </main>
        </div>
    );
}
