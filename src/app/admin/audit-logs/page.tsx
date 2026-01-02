"use client";

import { useState, useEffect } from 'react';
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">System Audit Logs</h1>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 border rounded-lg"
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
                    <button
                        onClick={() => fetchLogs()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                    <input
                        type="date"
                        className="px-4 py-2 border rounded-lg text-sm"
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        className="px-4 py-2 border rounded-lg text-sm"
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="User ID / Name"
                        className="px-4 py-2 border rounded-lg text-sm w-36"
                        onChange={(e) => setPerformedBy(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4">
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
                    data={logs}
                />
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-gray-50"
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
