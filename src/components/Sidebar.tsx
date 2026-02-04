'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, LogOut } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!user) return null;

    const isActive = (path: string) => pathname.startsWith(path);

    const LinkItem = ({ href, children }: { href: string, children: React.ReactNode }) => (
        <Link
            href={href}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${isActive(href)
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 translate-x-1'
                : 'text-gray-100 hover:bg-white/10 hover:text-white'
                }`}
        >
            <span>{children}</span>
            {isActive(href) && <ChevronRight size={16} className="text-white/80" />}
        </Link>
    );

    const menuItems = {
        ADMIN: [
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/announcements', label: 'Announcements' },
            { href: '/admin/users', label: 'User Management' },
            { href: '/admin/employee-profiles', label: 'Employee Database' },
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
            { href: '/employee/attendance', label: 'Attendance' },
            { href: '/employee/leaves', label: 'Leaves' },
            { href: '/employee/events', label: 'Events' },
            { href: '/employee/salary', label: 'My Salary' }
        ]
    };

    const currentMenu = menuItems[user.role as keyof typeof menuItems] || [];

    return (
        <>
            {/* Mobile Header (Glass with High Contrast) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900/90 backdrop-blur-md z-[50] px-4 flex items-center justify-between border-b border-white/10 shadow-sm">
                <Image
                    src="/logo-new.png"
                    alt="PromptiX"
                    width={100}
                    height={32}
                    className="h-8 w-auto object-contain brightness-0 invert"
                />
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Spacer for Sticky Header */}
            <div className="md:hidden h-16" />

            {/* Mobile Overlay (Backdrop) */}
            <div
                className={`md:hidden fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-[55] transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container (Glassmorphism) */}
            <aside className={`
                fixed left-0 top-0 h-[100dvh] w-[85vw] max-w-[300px] md:w-64 
                bg-navy-900/95 backdrop-blur-xl text-white flex flex-col shadow-2xl z-[60] border-r border-white/10
                transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-white/10 bg-white/5 relative">
                    <Image
                        src="/logo-new.png"
                        alt="PromptiX CRM"
                        width={180}
                        height={60}
                        className="h-10 w-auto object-contain brightness-0 invert"
                        priority
                    />
                    {/* Close button visible only on mobile inside drawer for easier reach */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Profile Summary */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20">
                                <div className="w-full h-full rounded-full bg-navy-900 flex items-center justify-center overflow-hidden border-2 border-white/10">
                                    {user.photo ? (
                                        <Image
                                            src={user.photo}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg font-bold text-orange-500">{user.name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-navy-900 rounded-full box-content"></div>
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-semibold text-white truncate text-base tracking-wide text-shadow-sm">{user.name}</h3>
                            <p className="text-xs text-orange-400 font-bold tracking-wider uppercase">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="text-xs font-bold text-gray-400 mb-3 px-4 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-white/20"></span> Main Menu
                    </div>
                    <div className="space-y-1">
                        {currentMenu.map((item) => (
                            <LinkItem key={item.href} href={item.href}>
                                {item.label}
                            </LinkItem>
                        ))}
                    </div>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="md:hidden mb-4 flex justify-between items-center text-xs text-gray-400 px-2">
                        <span>v1.2.0</span>
                        <span>PromptiX CRM</span>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full py-3 px-4 bg-white/5 hover:bg-red-500/20 text-gray-200 hover:text-white border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-3 group backdrop-blur-sm"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
