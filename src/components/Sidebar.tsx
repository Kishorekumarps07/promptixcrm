'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const isActive = (path: string) => pathname.startsWith(path);

    const LinkItem = ({ href, children }: { href: string, children: React.ReactNode }) => (
        <Link
            href={href}
            className={`block px-4 py-3 rounded mb-1 text-sm font-medium transition-colors ${isActive(href)
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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 text-white flex flex-col shadow-xl z-10">
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
    );
}
