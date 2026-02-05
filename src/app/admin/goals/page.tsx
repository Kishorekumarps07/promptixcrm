'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import {
    Plus,
    Target,
    Calendar,
    User as UserIcon,
    TrendingUp,
    MoreVertical,
    Edit2,
    Trash2,
    X,
    Filter,
    Search,
    ChevronRight,
    Loader2
} from 'lucide-react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { cn } from '@/lib/utils';

interface Goal {
    _id: string;
    title: string;
    description?: string;
    period: string;
    ownerId: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage: number;
    createdAt: string;
}

interface Employee {
    _id: string;
    name: string;
    email: string;
}

export default function AdminGoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        period: '',
        ownerId: '',
        status: 'Not Started'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [goalsRes, usersRes] = await Promise.all([
                fetch('/api/admin/goals'),
                fetch('/api/admin/users')
            ]);

            const goalsData = await goalsRes.json();
            const usersData = await usersRes.json();

            setGoals(goalsData.goals || []);
            // Filter users to only show employees in the dropdown
            setEmployees(usersData.users?.filter((u: any) => u.role === 'EMPLOYEE') || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                title: goal.title,
                description: goal.description || '',
                period: goal.period,
                ownerId: goal.ownerId._id,
                status: goal.status
            });
        } else {
            setEditingGoal(null);
            setFormData({
                title: '',
                description: '',
                period: '',
                ownerId: '',
                status: 'Not Started'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingGoal ? `/api/admin/goals/${editingGoal._id}` : '/api/admin/goals';
        const method = editingGoal ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const error = await res.json();
                alert(error.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal? Linked tasks will be detached.')) return;

        try {
            const res = await fetch(`/api/admin/goals/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const filteredGoals = goals.filter(goal =>
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.ownerId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 overflow-x-hidden pb-12">
                <div className="space-y-8">
                    {/* Header section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-navy-900 tracking-tight">
                                Organizational Goals
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">Define and track high-level objectives (OKRs)</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl shadow-lg shadow-navy-900/20 transition-all duration-300 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>Create New Goal</span>
                        </button>
                    </div>

                    {/* Quick Stats & Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <ModernGlassCard className="p-4 flex items-center gap-4 bg-white/50">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Total Goals</p>
                                <p className="text-xl font-black text-navy-900">{goals.length}</p>
                            </div>
                        </ModernGlassCard>

                        <div className="md:col-span-3 flex gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-navy-900 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search goals or owners..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-navy-900" />
                            <p>Loading goals...</p>
                        </div>
                    ) : filteredGoals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50">
                            <Target className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-xl font-medium text-navy-900">No goals found</p>
                            <p className="text-sm">Try adjusting your search or create a new objective.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Goal / Objective</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Owner</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Period</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredGoals.map((goal) => (
                                            <tr key={goal._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-navy-900 font-bold group-hover:text-blue-600 transition-colors">{goal.title}</span>
                                                        <span className="text-xs text-gray-500 line-clamp-1 mt-1">{goal.description || 'No description'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-gray-600">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-navy-900/20">
                                                            {goal.ownerId.name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-semibold text-navy-900">{goal.ownerId.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600">
                                                        {goal.period}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="w-full max-w-[200px] space-y-2">
                                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                                                            <span className={cn(
                                                                goal.status === 'Completed' ? 'text-emerald-600' :
                                                                    goal.status === 'In Progress' ? 'text-blue-600' : 'text-gray-400'
                                                            )}>
                                                                {goal.status}
                                                            </span>
                                                            <span className="text-navy-900">{goal.progressPercentage}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${goal.progressPercentage}%` }}
                                                                className={cn(
                                                                    "h-full rounded-full transition-all duration-1000",
                                                                    goal.status === 'Completed' ? 'bg-emerald-500 shadow-sm' :
                                                                        goal.status === 'In Progress' ? 'bg-blue-500 shadow-sm' : 'bg-gray-300'
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(goal)}
                                                            className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(goal._id)}
                                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="grid grid-cols-1 md:hidden gap-4">
                                {filteredGoals.map((goal) => (
                                    <ModernGlassCard key={goal._id} className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-navy-900">{goal.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                                                    <Calendar className="w-3 h-3" />
                                                    {goal.period}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenModal(goal)} className="p-2 bg-gray-100 rounded-lg text-gray-500"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(goal._id)} className="p-2 bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 py-2 border-y border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center font-bold text-white shadow-md">
                                                {goal.ownerId.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">Responsible</p>
                                                <p className="text-sm font-bold text-navy-900">{goal.ownerId.name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                                <span className={cn(
                                                    goal.status === 'Completed' ? 'text-emerald-600' :
                                                        goal.status === 'In Progress' ? 'text-blue-600' : 'text-gray-400'
                                                )}>{goal.status}</span>
                                                <span className="text-navy-900">{goal.progressPercentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${goal.progressPercentage}%` }}
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        goal.status === 'Completed' ? 'bg-emerald-500' :
                                                            goal.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </ModernGlassCard>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Creation/Editing Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-500" />
                                    {editingGoal ? 'Edit Goal' : 'Create Business Objective'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-navy-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-navy-900">Goal Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 font-medium"
                                        placeholder="e.g., Q1 Revenue Target established"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-navy-900">Objective Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 resize-none"
                                        placeholder="Provide more context about this priority..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Operational Period</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.period}
                                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 text-sm font-medium"
                                            placeholder="e.g. Q1 2026"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-navy-900">Initial Status</label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer hover:bg-gray-50"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                            <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-navy-900">Primary Owner (Lead Employee)</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.ownerId}
                                            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer hover:bg-gray-50"
                                        >
                                            <option value="" disabled>Select an employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.name} ({emp.email})
                                                </option>
                                            ))}
                                        </select>
                                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic ml-1">ONLY employees can be designated as goal owners.</p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-[2] py-4 px-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-2xl shadow-lg shadow-navy-900/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingGoal ? 'Update Objective' : 'Deploy Goal'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
