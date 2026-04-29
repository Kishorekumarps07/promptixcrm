'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Coffee } from 'lucide-react';
import { format } from 'date-fns';

interface DailySalaryBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    breakdown: any;
}

export default function DailySalaryBreakdownModal({ isOpen, onClose, breakdown }: DailySalaryBreakdownModalProps) {
    if (!isOpen || !breakdown) return null;

    const getStatusStyle = (status: string, type: string) => {
        if (status === 'Present') {
            return type === 'Full Day' 
                ? 'bg-green-50 text-green-700 border-green-100' 
                : 'bg-amber-50 text-amber-700 border-amber-100';
        }
        if (status === 'Leave') return 'bg-blue-50 text-blue-700 border-blue-100';
        if (status === 'Holiday' || status === 'Weekly Off') return 'bg-gray-50 text-gray-500 border-gray-100';
        return 'bg-red-50 text-red-700 border-red-100';
    };

    const getIcon = (status: string, type: string) => {
        if (status === 'Present') return type === 'Full Day' ? <CheckCircle size={14} /> : <Clock size={14} />;
        if (status === 'Leave') return <Calendar size={14} />;
        if (status === 'Holiday' || status === 'Weekly Off') return <Coffee size={14} />;
        return <AlertCircle size={14} />;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-navy-950 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
                        <div>
                            <h3 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">Daily Earnings Breakdown</h3>
                            <p className="text-sm text-gray-500 font-medium">Estimated calculation for the current month</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white dark:bg-navy-950 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-white/5">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-white/5">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 dark:border-white/5 text-right">Earning (Est.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {breakdown.dailyBreakdown.map((day: any, idx: number) => {
                                    const isEarned = day.status === 'Present' || (day.status === 'Leave' && day.type === 'Paid');
                                    const dayEarning = day.status === 'Present' && day.type === 'Half Day' 
                                        ? (breakdown.perDayRate / 2) 
                                        : isEarned ? breakdown.perDayRate : 0;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-navy-900 dark:text-white">
                                                        {format(new Date(day.date), 'MMM do')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase">{format(new Date(day.date), 'EEEE')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(day.status, day.type)}`}>
                                                    {getIcon(day.status, day.type)}
                                                    {day.type === 'Half Day' ? 'Half Day' : day.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-sm font-black ${dayEarning > 0 ? 'text-navy-900 dark:text-white' : 'text-gray-300'}`}>
                                                    ₹{dayEarning.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="p-6 bg-navy-900 text-white flex justify-between items-center">
                        <div className="flex gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-navy-300 uppercase mb-0.5">Payable Days</p>
                                <p className="text-xl font-black">{breakdown.payableDays}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-navy-300 uppercase mb-0.5">Per Day Rate</p>
                                <p className="text-xl font-black">₹{breakdown.perDayRate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-navy-300 uppercase mb-0.5">Estimated Total</p>
                            <p className="text-2xl font-black text-orange-400">₹{breakdown.calculatedSalary.toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
