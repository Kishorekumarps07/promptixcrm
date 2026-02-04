'use client';

import React, { useState, useEffect, use } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, MapPin, GraduationCap, Clock, FileText, User as UserIcon } from 'lucide-react';
import AdvancedTable from '@/components/ui/AdvancedTable';

export default function AdminEmployeeProfileDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Tab Data States
    const [attendance, setAttendance] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loadingTab, setLoadingTab] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/admin/employee-profiles/${id}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load profile", err);
                setLoading(false);
            });
    }, [id]);

    // Fetch Tab Data on Change
    useEffect(() => {
        if (!id) return;

        if (activeTab === 'attendance' && attendance.length === 0) {
            setLoadingTab(true);
            fetch(`/api/admin/attendance?userId=${id}`)
                .then(res => res.json())
                .then(res => {
                    setAttendance(res.attendance || []);
                    setLoadingTab(false);
                });
        }
        if (activeTab === 'leaves' && leaves.length === 0) {
            setLoadingTab(true);
            fetch(`/api/admin/leaves?userId=${id}`)
                .then(res => res.json())
                .then(res => {
                    setLeaves(res.leaves || []);
                    setLoadingTab(false);
                });
        }
    }, [activeTab, id]);

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <Sidebar />
                <main className="md:ml-64 p-8 flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </main>
            </div>
        );
    }

    if (!data || !data.user) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <Sidebar />
                <main className="md:ml-64 p-8 flex-1">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-700">User not found</h2>
                        <Link href="/admin/employee-profiles" className="text-orange-500 hover:underline mt-4 inline-block">
                            &larr; Back to List
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const { user, profile } = data;
    const edu = profile?.education?.[0] || {};

    const HeaderItem = ({ icon: Icon, label }: { icon: any, label: string }) => (
        <div className="flex items-center gap-2 text-white/80">
            <Icon size={16} />
            <span>{label}</span>
        </div>
    );

    const DetailItem = ({ label, value }: { label: string, value: string | undefined }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </label>
            <div className="text-gray-800 font-medium">
                {value || <span className="text-gray-400 italic">Not Provided</span>}
            </div>
        </div>
    );

    // Columns for Attendance Table
    const attendanceColumns = [
        { header: 'Date', accessor: (row: any) => new Date(row.date).toLocaleDateString() },
        {
            header: 'Status', accessor: (row: any) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Present' ? 'bg-green-100 text-green-700' :
                        row.status === 'Absent' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Check In', accessor: (row: any) => row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
        { header: 'Check Out', accessor: (row: any) => row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    ];

    // Columns for Leaves Table
    const leaveColumns = [
        { header: 'Type', accessor: 'leaveType' },
        { header: 'Dates', accessor: (row: any) => `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}` },
        {
            header: 'Status', accessor: (row: any) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
        { header: 'Reason', accessor: 'reason' },
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                {/* Back Link */}
                <Link href="/admin/employee-profiles" className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-6 transition-colors">
                    <ArrowLeft size={18} className="mr-1" /> Back to Database
                </Link>

                {/* Profile Header Card */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Briefcase size={120} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/20">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                            <div className="flex items-center gap-3 text-orange-400 font-medium mb-4">
                                <span>{profile?.designation || 'No Designation'}</span>
                                {profile?.department && (
                                    <>
                                        <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                        <span>{profile.department}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm">
                                <HeaderItem icon={Mail} label={user.email} />
                                {profile?.phoneNumber && <HeaderItem icon={Phone} label={profile.phoneNumber} />}
                                {profile?.dateOfJoining && (
                                    <HeaderItem
                                        icon={Calendar}
                                        label={`Joined ${new Date(profile.dateOfJoining).toLocaleDateString()}`}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="md:ml-auto flex flex-col items-end justify-center">
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${profile?.profileCompleted
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                }`}>
                                {profile?.profileCompleted ? 'Profile Completed' : 'Setup Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: Briefcase },
                        { id: 'personal', label: 'Personal Info', icon: UserIcon },
                        { id: 'attendance', label: 'Attendance', icon: Clock },
                        { id: 'leaves', label: 'Leaves', icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Attendance</h3>
                                <div className="text-3xl font-bold text-navy-900">
                                    {/* Placeholder: Real stat would require aggregate API */}
                                    -
                                </div>
                                <p className="text-xs text-green-600 mt-2">Days Present</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium mb-1">Leave Balance</h3>
                                <div className="text-3xl font-bold text-navy-900">
                                    {/* Placeholder */}
                                    12
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Annual Leaves Remaining</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium mb-1">Performance</h3>
                                <div className="text-3xl font-bold text-navy-900">Good</div>
                                <p className="text-xs text-orange-500 mt-2">Based on review</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Personal Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                    <Briefcase size={18} className="text-orange-500" />
                                    <h2 className="font-bold text-gray-800">Employment Details</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 gap-6">
                                    <DetailItem label="Employment Type" value={profile?.employmentType} />
                                    <DetailItem label="Employee Code" value={profile?.employeeCode || "N/A"} />
                                    <DetailItem label="Role" value={user.role} />
                                    <DetailItem label="Joined On" value={profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : undefined} />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                        <MapPin size={18} className="text-orange-500" />
                                        <h2 className="font-bold text-gray-800">Address</h2>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <DetailItem label="Current Address" value={profile?.currentAddress} />
                                        <DetailItem label="Permanent Address" value={profile?.permanentAddress} />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                        <GraduationCap size={18} className="text-orange-500" />
                                        <h2 className="font-bold text-gray-800">Education</h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-4">
                                        <DetailItem label="Degree" value={edu.level} />
                                        <DetailItem label="Institution" value={edu.institution} />
                                        <DetailItem label="Year" value={edu.year} />
                                        <DetailItem label="Grade" value={edu.score} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <AdvancedTable
                                data={attendance}
                                columns={attendanceColumns}
                                keyField="_id"
                                isLoading={loadingTab}
                                searchPlaceholder="Search dates or status..."
                            />
                        </div>
                    )}

                    {activeTab === 'leaves' && (
                        <div>
                            <AdvancedTable
                                data={leaves}
                                columns={leaveColumns}
                                keyField="_id"
                                isLoading={loadingTab}
                                searchPlaceholder="Search leave type..."
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
