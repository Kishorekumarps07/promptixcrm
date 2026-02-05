'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    photo?: string;
    forcePasswordChange?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                    if (data.user.forcePasswordChange) {
                        router.push('/auth/force-change-password');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        if (userData.forcePasswordChange) {
            router.push('/auth/force-change-password');
        } else if (userData.role === 'ADMIN') router.push('/admin/dashboard');
        else if (userData.role === 'EMPLOYEE') router.push('/employee/dashboard');
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout API call failed', err);
        }
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
