'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Generate Salaries</h1>
                        <p className="text-gray-500 mt-1">Calculate and create draft salary records</p>
                    </div>
                </header>

                {/* Controls */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 mb-8 flex items-end gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            value={year} onChange={e => setYear(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded w-32"
                        >
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                            value={month} onChange={e => setMonth(Number(e.target.value))}
                            className="p-2 border border-gray-300 rounded w-48"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={`px-6 py-2.5 rounded font-bold text-white transition-all ${generating ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600 shadow-md'
                            }`}
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
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Per Day Rate</th>
                                <th className="p-4">Attended (Days)</th>
                                <th className="p-4">Calculated Salary</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan={5} className="p-6 text-center text-gray-400">No records found for this period.</td></tr>
                            ) : salaries.map(rec => (
                                <tr key={rec._id}>
                                    <td className="p-4 font-medium text-navy-900">
                                        {rec.employeeId?.name || 'Unknown'}
                                        <div className="text-xs text-gray-400">{rec.employeeId?.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">${rec.perDayRate}</td>
                                    <td className="p-4 font-bold">{rec.presentDays} / {rec.workingDays}</td>
                                    <td className="p-4 font-bold text-green-600">${rec.calculatedSalary.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold uppercase">
                                            {rec.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
