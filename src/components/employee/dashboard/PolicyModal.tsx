'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertCircle, Home, Briefcase, TrendingUp, ShieldCheck, FileText } from 'lucide-react';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
    const sections = [
        {
            title: "Office Timings & Working Hours",
            icon: <Clock className="text-blue-500" size={20} />,
            items: [
                "Standard working hours are 10:30 AM to 6:30 PM.",
                "Total working duration is 9 hours per day (including all breaks such as lunch and tea).",
                "All Saturdays are working days.",
                "Employees must strictly follow in-time and out-time recording in the CRM.",
                "Late login, early logout, or insufficient hours may impact attendance and salary."
            ]
        },
        {
            title: "Attendance Policy",
            icon: <Briefcase className="text-teal-500" size={20} />,
            items: [
                "Marking attendance in the CRM is mandatory.",
                "Employees must record daily in-time and out-time without fail.",
                "Failure to mark attendance will be treated as absent, unless approved.",
                "Attendance records will be used for salary and performance evaluation."
            ]
        },
        {
            title: "Leave Policy",
            icon: <Calendar className="text-purple-500" size={20} />,
            items: [
                "Employees are allowed 1 leave per month with prior approval.",
                "Leave must be applied in advance through the system.",
                "Unapproved leave will be treated as absence."
            ]
        },
        {
            title: "Emergency Leave",
            icon: <AlertCircle className="text-red-500" size={20} />,
            items: [
                "Emergency leave must be supported with proper documentation.",
                "Submission of documents is mandatory.",
                "Providing documents does not guarantee approval; approval is subject to company decision."
            ]
        },
        {
            title: "Work From Home (WFH) Policy",
            icon: <Home className="text-indigo-500" size={20} />,
            items: [
                "Employees are allowed 1 WFH per month with valid reason and prior approval.",
                "Any additional WFH: Will be treated as a half-day leave and may impact salary if not regularized.",
                "Employees must be available and responsive during working hours."
            ]
        },
        {
            title: "Sandwich Leave Policy",
            icon: <FileText className="text-orange-500" size={20} />,
            content: (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                    <p className="text-sm font-medium text-orange-800">Intervening days between a holiday/weekend will also be counted as leave.</p>
                    <div className="mt-2 text-xs text-orange-700 grid grid-cols-2 gap-1">
                        <span>Thursday: Government Holiday</span>
                        <span>Friday: Leave</span>
                        <span>Saturday: Working Day</span>
                        <span>Sunday: Weekend</span>
                        <span className="col-span-2 font-bold mt-1 text-orange-900 pt-1 border-t border-orange-200">Total leave counted = 4 days</span>
                    </div>
                </div>
            )
        },
        {
            title: "Salary & Loss of Pay (LOP)",
            icon: <TrendingUp className="text-green-500" size={20} />,
            content: (
                <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-sm font-bold text-green-900">Salary ÷ Total Working Days = Per-Day Salary</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">LOP applies to:</p>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {["Unapproved leave", "Missing attendance", "Unapproved WFH", "Excess WFH", "Insufficient hours", "Sandwich leave"].map((item, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Performance & Recognition",
            icon: <ShieldCheck className="text-yellow-600" size={20} />,
            items: [
                "Eligible for annual incentives, promotions, and Best Employee recognition.",
                "Evaluation based on: Attendance consistency, work discipline, productivity, and overall contribution."
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-navy-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20"
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-navy-900 tracking-tight">Attendance, Leave & Work Policy</h2>
                                    <p className="text-gray-500 text-sm font-medium">Company standards & employee guidelines</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-navy-900 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {sections.map((section, idx) => (
                                    <div key={idx} className="space-y-3 group">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                                {section.icon}
                                            </div>
                                            <h3 className="font-bold text-navy-900 text-base">{section.title}</h3>
                                        </div>
                                        {section.items && (
                                            <ul className="space-y-2 pl-2">
                                                {section.items.map((item, i) => (
                                                    <li key={i} className="text-sm text-gray-600 leading-relaxed flex gap-2">
                                                        <span className="text-orange-400 font-bold shrink-0">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {section.content}
                                    </div>
                                ))}
                            </div>

                            {/* General Guidelines */}
                            <div className="mt-10 p-6 bg-navy-900 rounded-3xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <ShieldCheck size={24} className="text-orange-400" />
                                            General Guidelines
                                        </h3>
                                        <p className="text-white/70 text-sm max-w-xl leading-relaxed">
                                            Employees must follow all policies strictly. Proper communication and approvals are mandatory.
                                            Any misuse or incorrect entry may lead to disciplinary action.
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <AlertCircle size={20} className="text-orange-400" />
                                        <span className="text-xs font-black uppercase tracking-widest">Acknowledgment Required</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-gray-500 font-medium max-w-md text-center md:text-left">
                                By proceeding, you agree to comply with all company policies. Non-compliance may impact attendance, salary, and performance evaluation.
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full md:w-auto px-10 py-3.5 bg-navy-900 text-white rounded-2xl font-bold hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all duration-300"
                            >
                                Acknowledge & Continue
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
