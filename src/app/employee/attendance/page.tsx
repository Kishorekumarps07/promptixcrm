'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import AdvancedTable from '@/components/ui/AdvancedTable';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function EmployeeAttendance() {
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkInType, setCheckInType] = useState('Present');

    useEffect(() => {
        fetchStatus();
        fetchHistory();
        fetchHolidays();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/employee/settings');
            if (res.ok) {
                setSettings(await res.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

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

    const fetchHolidays = async () => {
        try {
            const now = new Date();
            const year = now.getFullYear();

            // Fetch all holidays for the current year (not just current month)
            const res = await fetch(`/api/holidays?year=${year}`);
            const data = await res.json();
            if (data.holidays) {
                // Filter to show only upcoming holidays (from today onwards)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingHolidays = data.holidays.filter((h: any) => {
                    const holidayDate = new Date(h.date);
                    holidayDate.setHours(0, 0, 0, 0);
                    return holidayDate >= today;
                });

                setHolidays(upcomingHolidays);
            }
        } catch (e) {
            console.error('Error fetching holidays:', e);
        }
    };

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/employee/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: checkInType }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(`Error: ${data.message || "Check-in failed"}`);
                return;
            }

            await fetchStatus();
            await fetchHistory();
        } catch (e: any) {
            alert(`Network or Server Error: ${e.message}`);
        } finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24">
                <PageHeader
                    title="Attendance"
                    subtitle="Track your daily work hours and history"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Action Card */}
                    <ModernGlassCard title="Today's Status" className="col-span-1 lg:col-span-2" delay={0.1}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-3xl font-black text-navy-900">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </h3>
                                <p className="text-gray-500 font-medium">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            {!loading && todayRecord && (
                                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${getStatusColor(todayRecord.status)}`}>
                                    {todayRecord.status === 'Approved' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                    {todayRecord.status}
                                </div>
                            )}
                        </div>

                        {!loading && (
                            <div className="bg-white/50 rounded-xl p-1 border border-white/60">
                                {todayRecord ? (
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Check In</span>
                                            <div className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                    <Clock size={16} />
                                                </div>
                                                {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Check Out</span>
                                            {todayRecord.checkOut ? (
                                                <div className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                                        <Clock size={16} />
                                                    </div>
                                                    {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleCheckOut}
                                                    disabled={actionLoading}
                                                    className="w-full h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                                >
                                                    {actionLoading ? '...' : 'Check Out'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-orange-50/50 rounded-lg flex flex-col md:flex-row gap-4 items-center">
                                        <div className="flex-1 w-full">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Work Mode</label>
                                            <select
                                                value={checkInType}
                                                onChange={(e) => setCheckInType(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            >
                                                <option value="Present">🏢 Office</option>
                                                <option value="WFH">🏠 Remote (WFH)</option>
                                                <option value="Leave">🏖️ On Leave</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={actionLoading}
                                            className="w-full md:w-auto px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all active:scale-95 hover:-translate-y-0.5"
                                        >
                                            {actionLoading ? 'Processing...' : 'Check In Now'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModernGlassCard>

                    {/* Upcoming Holidays */}
                    <ModernGlassCard title="Upcoming Holidays" className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100" delay={0.15}>
                        {holidays.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No upcoming holidays</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {holidays.slice(0, 3).map((holiday: any, idx: number) => {
                                    const holidayDate = new Date(holiday.date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    holidayDate.setHours(0, 0, 0, 0);
                                    const isToday = holidayDate.getTime() === today.getTime();

                                    return (
                                        <div
                                            key={holiday._id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isToday
                                                ? 'bg-orange-50 border-orange-200 shadow-sm'
                                                : 'bg-white/50 border-indigo-100 hover:border-indigo-200'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isToday ? 'bg-orange-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                                <Calendar size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-navy-900 text-sm">
                                                    {holiday.name}
                                                    {isToday && <span className="ml-2 text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">Today</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {holidayDate.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ModernGlassCard>

                    {/* Workplace Rules (My Schedule) */}
                    <ModernGlassCard title="My Schedule" className="bg-gradient-to-br from-indigo-50/50 to-white/50 border-indigo-100" delay={0.2}>
                        {!loading && settings ? (
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Shift Start</div>
                                        <div className="text-3xl font-black text-gray-900">{settings.shiftStartTime || "09:00"}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {settings.gracePeriodMinutes || 60} min grace period
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-indigo-50">
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Weekly Offs</div>
                                    <div className="flex gap-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                            const isOff = settings.weeklyOffs.includes(idx);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isOff
                                                            ? 'bg-red-500 text-white shadow-md shadow-red-500/20 scale-110'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}
                                                    title={isOff ? "Weekly Off" : "Working Day"}
                                                >
                                                    {day}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </ModernGlassCard>
                </div>

                <ModernGlassCard title="Attendance History" delay={0.3}>
                    <AdvancedTable
                        data={history}
                        isLoading={loading}
                        keyField="_id"
                        searchPlaceholder="Search dates..."
                        columns={[
                            {
                                header: "Date",
                                accessor: (item) => (
                                    <div className="font-medium text-navy-900 flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(item.date).toLocaleDateString()}
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: "Type",
                                accessor: (item) => (
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${item.type === 'Present' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        item.type === 'WFH' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-gray-50 text-gray-700 border-gray-100'
                                        }`}>
                                        {item.type}
                                    </span>
                                )
                            },
                            {
                                header: "Check In",
                                accessor: (item) => (
                                    <span className="font-mono text-sm text-gray-600">
                                        {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )
                            },
                            {
                                header: "Check Out",
                                accessor: (item) => (
                                    <span className="font-mono text-sm text-gray-600">
                                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </span>
                                )
                            },
                            {
                                header: "Status",
                                accessor: (item) => (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                ),
                                sortable: true
                            }
                        ]}
                        renderGridLayout={(item) => (
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-navy-900">{new Date(item.date).toLocaleDateString()}</div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(item.status)}`}>{item.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg text-sm">
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">In</span>
                                        {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">Out</span>
                                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </ModernGlassCard>
            </main>
        </div>
    );
}
