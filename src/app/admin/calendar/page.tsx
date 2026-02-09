'use client';

import Sidebar from '@/components/Sidebar';
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ShiftConfiguration from '@/components/calendar/ShiftConfiguration';
import HolidayManager from '@/components/calendar/HolidayManager';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface WorkSettings {
    shiftStartTime: string;
    gracePeriodMinutes: number;
    weeklyOffs: number[];
}

interface Holiday {
    _id: string;
    date: string; // ISO string
    name: string;
    type: string;
}

export default function AdminCalendarPage() {
    const [loading, setLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<WorkSettings>({
        shiftStartTime: '09:00',
        gracePeriodMinutes: 60,
        weeklyOffs: [0]
    });

    // Holidays State
    const [holidays, setHolidays] = useState<Holiday[]>([]);

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

    const handleUpdateSettings = async (key: string, value: any) => {
        // Optimistic update
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        try {
            const res = await fetch('/api/admin/calendar/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (!res.ok) throw new Error();
            toast.success('Settings saved automatically');
        } catch (error) {
            toast.error('Failed to save settings');
            // Revert on failure could be added here, but for simplicity keeping optimistic
        }
    };

    const handleAddHoliday = async (holiday: { date: string; name: string; type: string }) => {
        try {
            const res = await fetch('/api/admin/calendar/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holiday)
            });

            if (res.ok) {
                const savedHoliday = await res.json();
                setHolidays([...holidays, savedHoliday]);
                toast.success('Holiday added');
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/calendar/holidays?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setHolidays(holidays.filter(h => h._id !== id));
                toast.success('Holiday deleted');
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };

    const handleSyncIndianHolidays = async () => {
        setSyncLoading(true);
        try {
            const res = await fetch('/api/admin/calendar/holidays/sync', {
                method: 'POST',
                body: JSON.stringify({ year: new Date().getFullYear(), region: 'IN' })
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(`Synced ${data.count} holidays!`);
                fetchData(); // Refresh list to show new ones
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Failed to sync holidays');
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#f3f4f6] dark:bg-[#0B1120] overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full relative overflow-hidden md:pl-[260px]">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
                    <PageHeader
                        title="Calendar Settings"
                        description="Configure work days, shifts, and holidays"
                        icon={CalendarIcon}
                    />

                    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Left Column: Settings */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="xl:col-span-1 h-full flex flex-col"
                            >
                                <div className="flex-1">
                                    <ShiftConfiguration
                                        startTime={settings.shiftStartTime}
                                        gracePeriod={settings.gracePeriodMinutes}
                                        weeklyOffs={settings.weeklyOffs}
                                        onUpdate={handleUpdateSettings}
                                    />
                                </div>

                                {/* Mini Info Card */}
                                <div className="mt-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                    <div className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                                        Configuration Note
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                        Changes to shift timing and weekly offs apply to all employees immediately for future attendance record generation.
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Column: Holiday Manager */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="xl:col-span-2"
                            >
                                <HolidayManager
                                    holidays={holidays}
                                    onAddHoliday={handleAddHoliday}
                                    onDeleteHoliday={handleDeleteHoliday}
                                    onSyncIndianHolidays={handleSyncIndianHolidays}
                                    syncLoading={syncLoading}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
