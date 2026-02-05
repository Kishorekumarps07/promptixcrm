'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CheckSquare,
    CreditCard,
    Shield,
    LogOut,
    Search,
    UserCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { user, logout } = useAuth();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!user) return null;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-gray-100 px-3">
                    <Search className="mr-2 h-5 w-5 shrink-0 text-gray-500" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                    <Command.Empty className="py-6 text-center text-sm text-gray-500">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="General" className="text-xs font-medium text-gray-500 mb-2 px-2">
                        <Command.Item
                            onSelect={() => runCommand(() => router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'))}
                            className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => runCommand(() => router.push(user.role === 'ADMIN' ? `/admin/employee-profiles/${user.id}` : '/employee/profile'))}
                            className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                        >
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </Command.Item>
                    </Command.Group>

                    {user.role === 'ADMIN' && (
                        <Command.Group heading="Admin Tools" className="text-xs font-medium text-gray-500 mb-2 px-2 mt-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/users'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                <span>Manage Users</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/tasks'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>Tasks & Goals</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/attendance'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Attendance</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/salary/generate'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Payroll</span>
                            </Command.Item>
                        </Command.Group>
                    )}

                    {user.role === 'EMPLOYEE' && (
                        <Command.Group heading="Employee Tools" className="text-xs font-medium text-gray-500 mb-2 px-2 mt-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/employee/tasks'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>My Tasks</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/employee/attendance/calendar'))}
                                className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 aria-selected:bg-orange-50 aria-selected:text-orange-600 transition-colors"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>My Calendar</span>
                            </Command.Item>
                        </Command.Group>
                    )}

                    <Command.Separator className="my-1 h-px bg-gray-100" />

                    <Command.Group heading="System" className="text-xs font-medium text-gray-500 mb-1 px-2 mt-2">
                        <Command.Item
                            onSelect={() => runCommand(() => logout())}
                            className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 aria-selected:bg-red-50 aria-selected:text-red-700 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </div>
        </Command.Dialog>
    );
}
