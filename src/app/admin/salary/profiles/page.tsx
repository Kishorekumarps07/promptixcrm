'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';
import { useRouter } from 'next/navigation';

export default function SalaryProfiles() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // Form States
    const [monthlySalary, setMonthlySalary] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState('');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await fetch('/api/admin/salary/profile');
            const data = await res.json();
            if (data.employees) {
                setEmployees(data.employees);
            }
        } catch (error) {
            console.error('Failed to fetch profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (emp: any) => {
        setSelectedEmp(emp);
        setMonthlySalary(emp.salaryProfile?.monthlySalary || '');
        setEffectiveFrom(emp.salaryProfile?.effectiveFrom ? new Date(emp.salaryProfile.effectiveFrom).toISOString().split('T')[0] : '');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/salary/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: selectedEmp._id,
                    monthlySalary,
                    effectiveFrom
                })
            });

            if (res.ok) {
                setShowModal(false);
                fetchProfiles(); // Refresh
                alert('Salary Profile Saved!');
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-navy-900">Salary Management</h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">Manage employee salary profiles</p>
                    </div>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <Table
                        data={employees}
                        columns={[
                            { header: "Employee", accessor: "name", className: "font-medium text-navy-900" },
                            { header: "Role", accessor: "role", className: "text-gray-500" },
                            {
                                header: "Monthly Salary",
                                accessor: (emp) => (
                                    <span className="font-bold text-navy-700">
                                        {emp.salaryProfile ? `$${emp.salaryProfile.monthlySalary.toLocaleString()}` : <span className="text-gray-300 italic">Not Set</span>}
                                    </span>
                                )
                            },
                            {
                                header: "Per Day Rate (Est.)",
                                accessor: (emp) => (
                                    <div className="text-sm text-gray-600">
                                        {emp.salaryProfile ? (
                                            <div>
                                                <span className="font-bold text-orange-600">${emp.calculatedPerDayRate}</span>
                                                <span className="text-xs text-gray-400 block">based on {emp.currentMonthWorkingDays} days</span>
                                            </div>
                                        ) : '-'}
                                    </div>
                                )
                            },
                            {
                                header: "Action",
                                accessor: (emp) => (
                                    <button
                                        onClick={() => handleEdit(emp)}
                                        className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-orange-500 transition-colors text-sm font-medium"
                                    >
                                        {emp.salaryProfile ? 'Edit' : 'Assign'}
                                    </button>
                                )
                            }
                        ]}
                        mobileCard={(emp) => (
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-navy-900 text-lg leading-tight">{emp.name}</h4>
                                        <span className="text-xs badge badge-info mt-1">{emp.role}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Monthly Salary</span>
                                        <div className="font-bold text-navy-700 text-lg">
                                            {emp.salaryProfile ? `$${emp.salaryProfile.monthlySalary.toLocaleString()}` : <span className="text-gray-400 italic text-sm">Not Set</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-xs font-semibold block mb-1 uppercase">Daily Rate</span>
                                        {emp.salaryProfile ? (
                                            <div className="font-bold text-orange-600 text-lg">
                                                ${emp.calculatedPerDayRate}
                                            </div>
                                        ) : '-'}
                                    </div>
                                    {emp.salaryProfile && (
                                        <div className="col-span-2 text-xs text-gray-500 border-t border-gray-200 pt-2 flex justify-between">
                                            <span>Effective From:</span>
                                            <span>{new Date(emp.salaryProfile.effectiveFrom).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleEdit(emp)}
                                    className="w-full btn bg-navy-900 text-white rounded hover:bg-orange-500 transition-colors text-sm font-bold shadow-sm"
                                    style={{ minHeight: '44px' }}
                                >
                                    {emp.salaryProfile ? 'Edit Salary Profile' : 'Assign Salary Profile'}
                                </button>
                            </div>
                        )}
                        loading={loading}
                    />
                </div>

                {/* Modal */}
                {showModal && selectedEmp && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-navy-900 p-6 text-white flex justify-between items-center">
                                <h3 className="text-xl font-bold">Assign Salary: {selectedEmp.name}</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white text-2xl">&times;</button>
                            </div>
                            <form onSubmit={handleSave} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={monthlySalary}
                                        onChange={e => setMonthlySalary(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                        placeholder="E.g. 5000"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                                    <input
                                        type="date"
                                        value={effectiveFrom}
                                        onChange={e => setEffectiveFrom(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Leave blank for today</p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-bold rounded hover:bg-orange-600">Save Profile</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
