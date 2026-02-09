'use client';

import Sidebar from '@/components/Sidebar';
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { toast } from 'sonner';
import { Calendar, Clock, Save, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkSettings {
    shiftStartTime: string;
    gracePeriodMinutes: number;
    weeklyOffs: number[];
}

interface Holiday {
    _id: string;
    date: string;
    name: string;
    type: string;
}

export default function AdminCalendarPage() {
    const [activeTab, setActiveTab] = useState<'settings' | 'holidays'>('settings');
    const [loading, setLoading] = useState(true);

    // Settings State
    const [settings, setSettings] = useState<WorkSettings>({
        shiftStartTime: '09:00',
        gracePeriodMinutes: 60,
        weeklyOffs: [0]
    });

    // Holidays State
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '', type: 'Holiday' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importPreview, setImportPreview] = useState<any>(null);

    // Initial Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, holidaysRes] = await Promise.all([
                fetch('/api/admin/calendar/settings'),
                fetch('/api/admin/calendar/holidays?year=' + new Date().getFullYear())
            ]);

            if (settingsRes.ok) {
                const data = await settingsRes.json();
                setSettings(data);
            }
            if (holidaysRes.ok) {
                setHolidays(await holidaysRes.json());
            }
        } catch (error) {
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('/api/admin/calendar/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Work settings updated!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    const handleAddHoliday = async () => {
        if (!newHoliday.date || !newHoliday.name) {
            toast.error('Date and Name are required');
            return;
        }
        try {
            const res = await fetch('/api/admin/calendar/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHoliday)
            });

            if (res.ok) {
                toast.success('Holiday added');
                setNewHoliday({ date: '', name: '', type: 'Holiday' });
                setIsAddModalOpen(false);
                // Refresh holidays
                const holidaysRes = await fetch('/api/admin/calendar/holidays?year=' + new Date().getFullYear());
                setHolidays(await holidaysRes.json());
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to add holiday');
            }
        } catch (error) {
            toast.error('Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (holidayId: string) => {
        try {
            const res = await fetch(`/api/admin/calendar/holidays/${holidayId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Holiday deleted');
                setHolidays(holidays.filter(h => h._id !== holidayId));
            }
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };

    // Import Indian Holidays
    const handlePreviewImport = async () => {
        setImportLoading(true);
        try {
            const res = await fetch('/api/admin/calendar/import-holidays?regions=All India,Tamil Nadu');
            if (res.ok) {
                const data = await res.json();
                setImportPreview(data);
                toast.success(`Found ${data.summary.new} new holidays to import`);
            } else {
                toast.error('Failed to preview holidays');
            }
        } catch (error) {
            toast.error('Failed to preview holidays');
        } finally {
            setImportLoading(false);
        }
    };

    const handleImportHolidays = async () => {
        setImportLoading(true);
        try {
            const res = await fetch('/api/admin/calendar/import-holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    year: 2026,
                    regions: ['All India', 'Tamil Nadu']
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Imported ${data.imported} holidays! Skipped ${data.skipped} duplicates.`);
                setImportPreview(null);
                fetchData(); // Refresh holidays list
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to import holidays');
            }
        } catch (error) {
            toast.error('Failed to import holidays');
        } finally {
            setImportLoading(false);
        }
    };

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleWeeklyOff = (dayIndex: number) => {
        setSettings(prev => {
            const newOffs = prev.weeklyOffs.includes(dayIndex)
                ? prev.weeklyOffs.filter(d => d !== dayIndex)
                : [...prev.weeklyOffs, dayIndex].sort();
            return { ...prev, weeklyOffs: newOffs };
        });
    };

    if (loading) return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <div className="text-gray-600">Loading configuration...</div>
            </main>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-24">
                <PageHeader
                    title="Calendar & Work Settings"
                    subtitle="Manage organization holidays, working days, and shift timings"
                    actions={
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Configuration
                            </button>
                            <button
                                onClick={() => setActiveTab('holidays')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'holidays' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Holidays
                            </button>
                        </div>
                    }
                />

                <AnimatePresence mode="wait">
                    {activeTab === 'settings' ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <ModernGlassCard title="Shift Timing">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start Time (24h)</label>
                                        <input
                                            type="time"
                                            value={settings.shiftStartTime}
                                            onChange={e => setSettings({ ...settings, shiftStartTime: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Late Grace Period (Minutes)</label>
                                        <input
                                            type="number"
                                            value={settings.gracePeriodMinutes}
                                            onChange={e => setSettings({ ...settings, gracePeriodMinutes: parseInt(e.target.value) })}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Check-ins after {settings.gracePeriodMinutes} mins from start time will be marked as "Half Day".</p>
                                    </div>
                                </div>
                            </ModernGlassCard>

                            <ModernGlassCard title="Weekly Offs">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {daysOfWeek.map((day, idx) => (
                                        <button
                                            key={day}
                                            onClick={() => toggleWeeklyOff(idx)}
                                            className={`p-3 rounded-lg border text-sm transition-all ${settings.weeklyOffs.includes(idx)
                                                ? 'bg-red-50 border-red-300 text-red-700 font-bold'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="font-medium">{day}</div>
                                            <div className="text-xs opacity-70">
                                                {settings.weeklyOffs.includes(idx) ? 'Holiday' : 'Working'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ModernGlassCard>

                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    onClick={handleSaveSettings}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-orange-500/20"
                                >
                                    <Save size={18} />
                                    Save Configuration
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="holidays"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ModernGlassCard
                                title={`Holidays (${new Date().getFullYear()})`}
                                headerAction={
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm text-white transition-colors font-medium shadow-sm"
                                    >
                                        <Plus size={16} />
                                        Add Holiday
                                    </button>
                                }
                            >
                                {/* Import Indian Holidays Section */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-navy-900">🇮🇳 Import Indian Government Holidays 2026</h4>
                                            <p className="text-sm text-gray-600">National + Tamil Nadu State Holidays (24 total)</p>
                                        </div>
                                    </div>

                                    {!importPreview ? (
                                        <button
                                            onClick={handlePreviewImport}
                                            disabled={importLoading}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
                                        >
                                            {importLoading ? 'Loading...' : 'Preview Holidays to Import'}
                                        </button>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-gray-700 mb-3">
                                                ✅ {importPreview.summary.new} new holidays ready • {importPreview.summary.existing} already added
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleImportHolidays}
                                                    disabled={importLoading || importPreview.summary.new === 0}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {importLoading ? 'Importing...' : `Import ${importPreview.summary.new} Holidays`}
                                                </button>
                                                <button
                                                    onClick={() => setImportPreview(null)}
                                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-600 text-sm">
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Name</th>
                                                <th className="py-3 px-4">Type</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {holidays.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-gray-500">
                                                        No holidays found for this year.
                                                    </td>
                                                </tr>
                                            ) : (
                                                holidays.map(holiday => (
                                                    <tr key={holiday._id} className="text-sm hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 px-4 text-gray-900 font-medium">
                                                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-700">{holiday.name}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
                                                                {holiday.type}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteHoliday(holiday._id)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </ModernGlassCard>

                            {/* Add Holiday Modal Overlay */}
                            {isAddModalOpen && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Holiday</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={newHoliday.name}
                                                    onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                                    placeholder="e.g. Christmas"
                                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                <input
                                                    type="date"
                                                    value={newHoliday.date}
                                                    onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-8">
                                            <button
                                                onClick={() => setIsAddModalOpen(false)}
                                                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddHoliday}
                                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                                            >
                                                Add Holiday
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
