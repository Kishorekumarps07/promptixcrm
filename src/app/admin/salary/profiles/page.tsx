'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Salary Management</h1>
                        <p className="text-gray-500 mt-1">Manage employee salary profiles</p>
                    </div>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Monthly Salary</th>
                                <th className="p-4 font-semibold">Per Day Rate (Est.)</th>
                                <th className="p-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading...</td></tr>
                            ) : employees.map(emp => (
                                <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-navy-900">{emp.name}</td>
                                    <td className="p-4 text-sm text-gray-500">{emp.role}</td>
                                    <td className="p-4 font-bold text-navy-700">
                                        {emp.salaryProfile ? `$${emp.salaryProfile.monthlySalary.toLocaleString()}` : <span className="text-gray-300 italic">Not Set</span>}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {emp.salaryProfile ? (
                                            <div>
                                                <span className="font-bold text-orange-600">${emp.calculatedPerDayRate}</span>
                                                <span className="text-xs text-gray-400 block">based on {emp.currentMonthWorkingDays} days</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="px-4 py-2 bg-navy-900 text-white rounded hover:bg-orange-500 transition-colors text-sm font-medium"
                                        >
                                            {emp.salaryProfile ? 'Edit' : 'Assign'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
