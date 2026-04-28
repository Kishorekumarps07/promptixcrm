'use client';

import { useState, useEffect, use } from 'react';
import Sidebar from '@/components/Sidebar';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import PageHeader from '@/components/ui/PageHeader';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths 
} from 'date-fns';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    MessageSquare, 
    Save, 
    X, 
    AlertCircle,
    CheckCircle,
    Info,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function IndividualAttendancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = use(params);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);
    
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [remark, setRemark] = useState('');
    const [status, setStatus] = useState('Approved');
    const [type, setType] = useState('Present');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, empRes] = await Promise.all([
                fetch(`/api/admin/attendance/individual?userId=${userId}&month=${currentMonth.getMonth()}&year=${currentMonth.getFullYear()}`),
                fetch(`/api/admin/users/${userId}`)
            ]);
            
            const attData = await attRes.json();
            const empData = await empRes.json();
            
            setAttendanceData(attData.records || []);
            setEmployee(empData.user || null);
        } catch (e) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (day: Date) => {
        const record = attendanceData.find(a => isSameDay(new Date(a.date), day));
        setSelectedDay(day);
        setRemark(record?.remarks || '');
        setStatus(record?.status || 'Approved');
        setType(record?.type || 'Present');
    };

    const handleSave = async () => {
        if (!selectedDay) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/attendance/individual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    date: selectedDay.toISOString(),
                    status,
                    type,
                    remarks: remark
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            toast.success('Attendance updated');
            setSelectedDay(null);
            fetchData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden relative">
                <PageHeader 
                    title={employee ? `${employee.name}'s Attendance` : 'Employee Attendance'}
                    subtitle="Manage individual records and add remarks"
                    breadcrumbs={[
                        { label: 'Admin', href: '/admin/dashboard' },
                        { label: 'Employees', href: '/admin/employee-profiles' },
                        { label: 'Attendance', href: '#' }
                    ]}
                />

                <div className="flex justify-between items-center mb-6 mt-8 bg-white/40 p-4 rounded-2xl border border-white/60 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-lg transition-all"><ChevronLeft /></button>
                        <h2 className="text-xl font-black text-navy-900 min-w-[180px] text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white rounded-lg transition-all"><ChevronRight /></button>
                    </div>
                </div>

                <ModernGlassCard className="!p-0 overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-fr bg-white/40 min-h-[500px]">
                        {loading ? (
                            <div className="col-span-7 flex justify-center items-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
                        ) : calendarDays.map((day) => {
                            const record = attendanceData.find(a => isSameDay(new Date(a.date), day));
                            const isMonth = isSameMonth(day, monthStart);
                            return (
                                <div 
                                    key={day.toString()}
                                    onClick={() => handleDateClick(day)}
                                    className={`p-2 border-b border-r border-gray-100 min-h-[100px] cursor-pointer hover:bg-white/60 transition-all ${!isMonth ? 'opacity-30' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${isSameDay(day, new Date()) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-navy-900'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {record?.isLocked && <div className="p-1 bg-gray-100 text-gray-400 rounded-md" title="Locked"><Save size={12} className="opacity-50" /></div>}
                                    </div>
                                    
                                    {record && (
                                        <div className="mt-2 space-y-1">
                                            <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                                record.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {record.type || 'Present'}
                                            </div>
                                            {record.remarks && (
                                                <div className="text-[9px] text-gray-500 italic line-clamp-2 leading-tight flex items-center gap-1">
                                                    <MessageSquare size={8} /> {record.remarks}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ModernGlassCard>

                {/* Editor Modal */}
                {selectedDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedDay(null)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="p-6 bg-gradient-to-r from-navy-900 to-indigo-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">{format(selectedDay, 'MMMM d, yyyy')}</h3>
                                    <p className="text-navy-200 text-xs">Update attendance & remarks</p>
                                </div>
                                <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                        <select 
                                            value={status} 
                                            onChange={e => setStatus(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-navy-900"
                                        >
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                                        <select 
                                            value={type} 
                                            onChange={e => setType(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-navy-900"
                                        >
                                            <option value="Present">Present</option>
                                            <option value="WFH">WFH</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Leave">Leave (Mark as Absent)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Remarks</label>
                                    <textarea 
                                        value={remark}
                                        onChange={e => setRemark(e.target.value)}
                                        placeholder="e.g. Excused late check-in..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-navy-900 placeholder:text-gray-400"
                                    />
                                </div>

                                {attendanceData.find(a => isSameDay(new Date(a.date), selectedDay))?.isLocked && (
                                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 text-orange-800">
                                        <AlertCircle className="shrink-0" size={20} />
                                        <p className="text-xs font-medium">This record is locked because payroll for this month has been approved. You cannot save changes.</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || attendanceData.find(a => isSameDay(new Date(a.date), selectedDay))?.isLocked}
                                    className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-navy-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Save Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
