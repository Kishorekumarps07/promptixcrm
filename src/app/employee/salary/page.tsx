'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function MySalary() {
    const [salaries, setSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            const res = await fetch('/api/employee/salary');
            const data = await res.json();
            setSalaries(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">My Salary History</h1>
                    <p className="text-gray-500 mt-1">View your monthly payout details</p>
                </header>

                <div className="grid gap-6">
                    {loading ? (
                        <p className="text-gray-500">Loading records...</p>
                    ) : salaries.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500">No salary records found yet.</p>
                        </div>
                    ) : salaries.map(rec => (
                        <div key={rec._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                                        {monthNames[rec.month]} {rec.year}
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${rec.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {rec.status}
                                        </span>
                                    </h3>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Per Day Rate: <span className="font-medium text-navy-700">${rec.perDayRate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 mb-1">Net Payable</div>
                                    <div className="text-2xl font-bold text-green-600">${rec.calculatedSalary.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Working Days</div>
                                    <div className="font-semibold text-navy-900 text-lg">{rec.workingDays}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Present</div>
                                    <div className="font-semibold text-green-600 text-lg">{rec.presentDays}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Unpaid Leave</div>
                                    <div className="font-semibold text-red-500 text-lg">{rec.unpaidLeaveDays}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
