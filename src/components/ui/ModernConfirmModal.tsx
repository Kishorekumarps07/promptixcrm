'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ModernConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ModernConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info'
}: ModernConfirmModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
        warning: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
        info: 'bg-navy-900 hover:bg-navy-800 shadow-navy-900/20'
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-50',
        warning: 'text-orange-500 bg-orange-50',
        info: 'text-blue-500 bg-blue-50'
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[variant]}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-navy-900 tracking-tight mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">{message}</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-gray-400 hover:text-navy-900 transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all border border-gray-200"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${colors[variant]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
