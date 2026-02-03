'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Search, Eye, Filter } from 'lucide-react';

export default function AdminEmployeeProfiles() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/admin/employee-profiles')
            .then(res => res.json())
            .then(data => {
                setEmployees(data.employees || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load profiles", err);
                setLoading(false);
            });
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.profile?.designation || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">Employee Database</h1>
                        <p className="text-sm text-gray-500 mt-1">View and manage employee profiles</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="p-4 font-semibold border-b">Employee</th>
                                    <th className="p-4 font-semibold border-b">Designation</th>
                                    <th className="p-4 font-semibold border-b">Department</th>
                                    <th className="p-4 font-semibold border-b">Status</th>
                                    <th className="p-4 font-semibold border-b">Joined</th>
                                    <th className="p-4 font-semibold border-b text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            Loading profiles...
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No employees found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="p-4">
                                                <div className="font-medium text-navy-900">{emp.name}</div>
                                                <div className="text-xs text-gray-500">{emp.email}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-700">
                                                {emp.profile?.designation || <span className="text-gray-400 italic">Not set</span>}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700">
                                                {emp.profile?.department || <span className="text-gray-400 italic">-</span>}
                                            </td>
                                            <td className="p-4">
                                                {emp.profile?.completed ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(emp.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={`/admin/employee-profiles/${emp._id}`}
                                                    className="inline-flex items-center justify-center p-2 text-navy-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                                                    title="View Full Profile"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
