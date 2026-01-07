'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';

export default function EmployeeAttendance() {
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkInType, setCheckInType] = useState('Present');

    useEffect(() => {
        fetchStatus();
        fetchHistory();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/employee/attendance');
            const data = await res.json();
            setTodayRecord(data.record);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/employee/attendance/history');
            const data = await res.json();
            if (data.history) setHistory(data.history);
        } catch (e) { console.error(e); }
    };

    const handleCheckIn = async () => {
        // if (!window.confirm("Confirm Check-In? This cannot be undone.")) return; // Commented out for debugging
        setActionLoading(true);
        try {
            // alert("Starting check-in request..."); // Debug
            const res = await fetch('/api/employee/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: checkInType }),
            });
            // alert(`Response Status: ${res.status}`); // Debug

            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                console.error("JSON Parsing Error:", jsonError);
                throw new Error(`Failed to parse response. Status: ${res.status}`);
            }

            if (!res.ok) {
                alert(`Error: ${data.message || "Check-in failed"}`);
                return;
            }

            await fetchStatus();
            await fetchHistory();
        } catch (e: any) {
            console.error("CheckIn Error:", e);
            alert(`Network or Server Error: ${e.message}`);
        } finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
        // if (!window.confirm("Confirm Check-Out?")) return; // Commented out for debugging
        setActionLoading(true);
        try {
            const res = await fetch('/api/employee/attendance', { method: 'PATCH' });
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Check-out failed");
                return;
            }

            await fetchStatus();
            await fetchHistory();
        } catch (e) {
            alert("Network error");
        } finally { setActionLoading(false); }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'badge-info';
        if (status === 'Approved') color = 'badge-success';
        if (status === 'Rejected') color = 'badge-error';
        if (status === 'Pending') color = 'badge-warning';
        return <span className={`badge ${color}`}>{status}</span>;
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Attendance</h1>
                    <p className="text-gray-500">Track and manage your work hours</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Today's Action Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-navy-900 mb-4">Today's Status</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>

                        {!loading && (
                            <>
                                {todayRecord ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-gray-600 font-medium">Status</span>
                                            <StatusBadge status={todayRecord.status} />
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-gray-600 font-medium">Type</span>
                                            <span className="text-navy-900">{todayRecord.type}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-gray-600 font-medium">Check In</span>
                                            <span className="font-mono text-navy-900">
                                                {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {todayRecord.checkOut ? (
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                <span className="text-gray-600 font-medium">Check Out</span>
                                                <span className="font-mono text-navy-900">
                                                    {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                className="w-full mt-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                                                onClick={handleCheckOut}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Processing...' : 'Check Out Now'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                                            <select
                                                value={checkInType}
                                                onChange={(e) => setCheckInType(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            >
                                                <option value="Present">Present (Office)</option>
                                                <option value="WFH">Work From Home</option>
                                                <option value="Leave">On Leave</option>
                                            </select>
                                        </div>
                                        <button
                                            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors disabled:opacity-50"
                                            onClick={handleCheckIn}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Processing...' : 'Check In Now'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Placeholder for Stats or other widgets if needed, handled by grid layout */}
                    <div className="bg-navy-900 text-white p-6 rounded-lg shadow-sm border border-navy-800 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-orange-500 mb-2">Work Rule</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Please ensure you check in by 10:00 AM. <br />
                            Late check-ins might be marked as half-day. <br />
                            Don't forget to check out before leaving.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-navy-900 mb-6">Attendance History</h3>
                    <Table
                        data={history}
                        columns={[
                            {
                                header: "Date",
                                accessor: (item) => new Date(item.date).toLocaleDateString()
                            },
                            { header: "Type", accessor: "type" },
                            {
                                header: "Check In",
                                accessor: (item) => new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            },
                            {
                                header: "Check Out",
                                accessor: (item) => item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
                            },
                            {
                                header: "Status",
                                accessor: (item) => <StatusBadge status={item.status} />
                            }
                        ]}
                        mobileCard={(item) => (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-navy-900">{new Date(item.date).toLocaleDateString()}</span>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <div>
                                        <span className="text-xs uppercase text-gray-400 font-bold block">Check In</span>
                                        {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase text-gray-400 font-bold block">Check Out</span>
                                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                    <div className="col-span-2 pt-1 border-t border-gray-200 mt-1">
                                        <span className="text-xs uppercase text-gray-400 font-bold">Type: </span> {item.type}
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </main>
        </div>
    );
}
