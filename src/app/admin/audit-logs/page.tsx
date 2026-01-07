"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

interface AuditLog {
    _id: string;
    actionType: string;
    entityType: string;
    entityId: string;
    performedBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    performerRole: string;
    metadata: any;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterAction, setFilterAction] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [performedBy, setPerformedBy] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, filterAction, startDate, endDate, performedBy]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (filterAction) params.append('actionType', filterAction);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (performedBy) params.append('performedBy', performedBy);

            const res = await fetch(`/api/admin/audit-logs?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 w-full">
                <header className="page-header">
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">System Audit Logs</h1>
                        <p className="text-gray-500 text-sm mt-1">Track and monitor all system activities</p>
                    </div>
                </header>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                    >
                        <option value="">All Actions</option>
                        <option value="ATTENDANCE_APPROVED">Attendance Approved</option>
                        <option value="ATTENDANCE_REJECTED">Attendance Rejected</option>
                        <option value="LEAVE_APPROVED">Leave Approved</option>
                        <option value="LEAVE_REJECTED">Leave Rejected</option>
                        <option value="USER_ACTIVATED">User Activated</option>
                        <option value="USER_DEACTIVATED">User Deactivated</option>
                        <option value="COURSE_CREATED">Course Created</option>
                        <option value="COURSE_UPDATED">Course Updated</option>
                        <option value="COURSE_DELETED">Course Deleted</option>
                        <option value="STUDENT_COURSE_ASSIGNED">Student Assigned Course</option>
                        <option value="LESSON_CREATED">Lesson Created</option>
                        <option value="LESSON_UPDATED">Lesson Updated</option>
                        <option value="LESSON_DELETED">Lesson Deleted</option>
                        <option value="LESSON_REORDERED">Lesson Reordered</option>
                        <option value="EVENT_CREATED">Event Created</option>
                        <option value="EVENT_UPDATED">Event Updated</option>
                        <option value="EVENT_DELETED">Event Deleted</option>
                        <option value="STUDENT_ONBOARDING_EDITED">Onboarding Edited</option>
                        <option value="EVENT_FEEDBACK_SUBMITTED">Feedback Submitted</option>
                    </select>
                    <input
                        type="date"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                    <input
                        type="text"
                        placeholder="User ID / Name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none"
                        onChange={(e) => setPerformedBy(e.target.value)}
                    />
                    <button
                        onClick={() => fetchLogs()}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
                    >
                        Refresh Logs
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    <Table
                        columns={[
                            {
                                header: 'Time',
                                accessor: (log: AuditLog) => <div className="text-sm text-gray-600">{new Date(log.createdAt).toLocaleString()}</div>
                            },
                            {
                                header: 'Action',
                                accessor: (log: AuditLog) => (
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                                    ${(log.actionType.includes('APPROVED') || log.actionType.includes('ACTIVATED') || log.actionType.includes('CREATED') || log.actionType.includes('ASSIGNED') || log.actionType.includes('REGISTERED') || log.actionType.includes('SUBMITTED') || log.actionType.includes('UPLOADED')) ? 'bg-green-100 text-green-700' : ''}
                                    ${(log.actionType.includes('REJECTED') || log.actionType.includes('DEACTIVATED') || log.actionType.includes('DELETED')) ? 'bg-red-100 text-red-700' : ''}
                                    ${(log.actionType.includes('UPDATED') || log.actionType.includes('EDITED') || log.actionType.includes('REORDERED')) ? 'bg-blue-100 text-blue-700' : ''}
                                    ${!log.actionType.match(/(APPROVED|REJECTED|CREATED|UPDATED|DELETED|ACTIVATED|DEACTIVATED|ASSIGNED|EDITED|REORDERED|REGISTERED|SUBMITTED|UPLOADED)/) ? 'bg-gray-100 text-gray-700' : ''}
                                `}>
                                        {log.actionType.replace(/_/g, ' ')}
                                    </span>
                                )
                            },
                            {
                                header: 'Performed By',
                                accessor: (log: AuditLog) => (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{log.performedBy?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{log.performedBy?.email} ({log.performerRole})</div>
                                    </div>
                                )
                            },
                            {
                                header: 'Entity',
                                accessor: (log: AuditLog) => (
                                    <div className="text-sm text-gray-600">
                                        {log.entityType} <br />
                                        <span className="text-xs text-gray-400 font-mono">{log.entityId.substring(0, 8)}...</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Metadata',
                                accessor: (log: AuditLog) => (
                                    <div className="text-sm text-gray-500 font-mono text-xs max-w-xs truncate" title={JSON.stringify(log.metadata, null, 2)}>
                                        {JSON.stringify(log.metadata)}
                                    </div>
                                )
                            }
                        ]}
                        mobileCard={(log) => {
                            const actionColor = `
                            ${(log.actionType.includes('APPROVED') || log.actionType.includes('ACTIVATED') || log.actionType.includes('CREATED') || log.actionType.includes('ASSIGNED') || log.actionType.includes('REGISTERED') || log.actionType.includes('SUBMITTED') || log.actionType.includes('UPLOADED')) ? 'bg-green-100 text-green-700' : ''}
                            ${(log.actionType.includes('REJECTED') || log.actionType.includes('DEACTIVATED') || log.actionType.includes('DELETED')) ? 'bg-red-100 text-red-700' : ''}
                            ${(log.actionType.includes('UPDATED') || log.actionType.includes('EDITED') || log.actionType.includes('REORDERED')) ? 'bg-blue-100 text-blue-700' : ''}
                            ${!log.actionType.match(/(APPROVED|REJECTED|CREATED|UPDATED|DELETED|ACTIVATED|DEACTIVATED|ASSIGNED|EDITED|REORDERED|REGISTERED|SUBMITTED|UPLOADED)/) ? 'bg-gray-100 text-gray-700' : ''}
                        `;

                            return (
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-navy-900 text-sm">{log.performedBy?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{log.performedBy?.role}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${actionColor} text-[10px]`}>
                                            {log.actionType.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 p-2 rounded-md border border-gray-100 flex flex-col gap-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="text-gray-400 text-xs font-semibold uppercase">Entity</span>
                                            <div className="text-right">
                                                <span className="font-medium text-navy-700 block text-xs">{log.entityType}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">#{log.entityId.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                        <div className="font-mono text-[10px] text-gray-600 break-all line-clamp-2">
                                            {JSON.stringify(log.metadata)}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 text-right">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            );
                        }}
                        data={logs}
                        loading={loading}
                    />
                </div>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 px-1">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-white bg-white shadow-sm"
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-white bg-white shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
}
