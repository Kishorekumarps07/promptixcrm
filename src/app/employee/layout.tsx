'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await fetch('/api/employee/profile/status');

                // If 401/403, middleware/page will handle it, or we assume handled.
                // But usually APIs return 401 if not logged in.
                if (res.status === 401) {
                    // Not logged in
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    const isCompleted = data.completed;

                    if (!isCompleted && pathname !== '/employee/profile-setup') {
                        // Not completed but trying to access other pages -> Redirect to setup
                        router.push('/employee/profile-setup');
                    } else if (isCompleted && pathname === '/employee/profile-setup') {
                        // Completed but trying to access setup -> Redirect to dashboard
                        router.push('/employee/dashboard');
                    }

                    // Allow rendering
                }
            } catch (e) {
                console.error("Profile check failed", e);
            } finally {
                setChecking(false);
            }
        };

        checkProfile();
    }, [pathname, router]);

    // Show loader while checking, BUT only if we might redirect.
    // If we are on setup page, we might want to show loader to prevent flashes.
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
