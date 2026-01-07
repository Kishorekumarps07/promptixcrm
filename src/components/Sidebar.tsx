'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    if (!user) return null;

    const isActive = (path: string) => pathname.startsWith(path);

    const LinkItem = ({ href, children }: { href: string, children: React.ReactNode }) => (
        <Link
            href={href}
            className={`flex items-center px-4 py-3 rounded mb-1 text-sm font-medium transition-colors min-h-[44px] ${isActive(href)
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                }`}
        >
            {children}
        </Link>
    );

    const menuItems = {
        ADMIN: [
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/courses', label: 'Courses' },
            { href: '/admin/announcements', label: 'Announcements' },
            { href: '/admin/users', label: 'User Management' },
            { href: '/admin/attendance', label: 'Attendance' },
            { href: '/admin/leaves', label: 'Leaves' },
            { href: '/admin/events', label: 'Events' },
            { href: '/admin/salary/profiles', label: 'Salary Profiles' },
            { href: '/admin/salary/generate', label: 'Generate Salaries' },
            { href: '/admin/security/password-requests', label: 'Password Requests' },
            { href: '/admin/audit-logs', label: 'Audit Logs' }
        ],
        EMPLOYEE: [
            { href: '/employee/dashboard', label: 'Dashboard' },
            { href: '/employee/profile', label: 'My Profile' },
            { href: '/employee/courses', label: 'Courses' },
            { href: '/employee/attendance', label: 'Attendance' },
            { href: '/employee/leaves', label: 'Leaves' },
            { href: '/employee/students', label: 'My Students' },
            { href: '/employee/events', label: 'Events' },
            { href: '/employee/salary', label: 'My Salary' }
        ],
        STUDENT: [
            { href: '/student/dashboard', label: 'Dashboard' },
            { href: '/student/profile', label: 'My Profile' },
            { href: '/student/courses', label: 'My Courses' },
            { href: '/student/announcements', label: 'Announcements' },
            { href: '/student/events', label: 'Events' }
        ]
    };

    const currentMenu = menuItems[user.role as keyof typeof menuItems] || [];

    return (
        <>
            {/* Mobile Sticky Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 z-[50] px-4 flex items-center justify-between shadow-md">
                <Image
                    src="/logo-new.png"
                    alt="PromptiX"
                    width={100}
                    height={32}
                    className="h-8 w-auto object-contain brightness-0 invert"
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white hover:bg-navy-800 rounded-md"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Spacer for Sticky Header */}
            <div className="md:hidden h-16" />

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-navy-900 text-white flex flex-col shadow-xl z-[60]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-center">
                    <Image
                        src="/logo-new.png"
                        alt="PromptiX CRM"
                        width={220}
                        height={80}
                        className="h-20 w-auto object-contain"
                        priority
                    />
                </div>

                <div className="p-6 border-b border-navy-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy-800 flex items-center justify-center text-xl font-bold text-orange-500 border-2 border-orange-500 overflow-hidden relative">
                        {user.photo ? (
                            <Image
                                src={user.photo}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-semibold truncate">{user.name}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{user.role}</div>
                    </div>
                    {/* Notification Bell */}
                    <div className="ml-auto">
                        <NotificationBell />
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase px-4">Menu</div>
                    {currentMenu.map((item) => (
                        <LinkItem key={item.href} href={item.href}>
                            {item.label}
                        </LinkItem>
                    ))}
                </nav>

                <div className="p-4 border-t border-navy-800">
                    <button
                        onClick={logout}
                        className="w-full py-2 px-4 bg-navy-800 hover:bg-red-600 text-gray-300 hover:text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
