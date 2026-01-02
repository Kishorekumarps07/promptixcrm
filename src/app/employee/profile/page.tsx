'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function EmployeeProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Employees reuse the same profile endpoint or we can assume user context
        // Actually /api/student/profile might be specific to students (attendance stats etc).
        // For employee, we really just need basic User info. 
        // Let's us /api/auth/me equivalent or just decode token on client if we had it, 
        // but cleaner to have an endpoint. 
        // Since we don't have a specific /api/employee/profile, let's make a simple one or just use what we have.
        // Wait, user is in Sidebar context. We can get it from there? No, Sidebar is a component.
        // Let's create a quick valid fetch or use a generic one. 
        // Actually, we can fetch /api/student/profile? It might fail role check.
        // Let's rely on Sidebar's useAuth for basic info and maybe fetch extra if needed.
        // For now, let's just use useAuth context for Display to keep it simple and safe.
        // The requirement is mostly about Password Request.
        setLoading(false);
    }, []);

    // We'll use the AuthContext to get user info for display
    return (
        <ProfileContent />
    );
}

import { useAuth } from '@/context/AuthContext';

function ProfileContent() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">My Profile</h1>
                    <p className="text-gray-500">Manage your account settings.</p>
                </header>

                <div className="max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-navy-900 flex items-center justify-center text-primary-orange text-3xl font-bold border-2 border-orange-500 overflow-hidden relative">
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
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900">{user.name}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                <p className="text-sm font-medium text-orange-600 mt-1 uppercase">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
                        <PasswordRequestWidget />
                    </div>
                </div>
            </main>
        </div>
    );
}

const PasswordRequestWidget = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/user/password-request')
            .then(res => res.json())
            .then(data => {
                if (data.request) setStatus(data.request.status);
            })
            .catch(console.error);
    }, []);

    const handleRequest = async () => {
        if (!confirm('Request a password change? An admin will review this.')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/user/password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Pending');
                alert('Request submitted successfully.');
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Failed to submit request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded border border-gray-200 max-w-xl">
            <h4 className="font-medium text-navy-900 mb-2">Password Change</h4>
            <p className="text-gray-500 text-sm mb-4">
                You cannot change your password directly. Submit a request for an admin to reset it for you.
            </p>

            {status === 'Pending' ? (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm flex items-center gap-2">
                    ⏳ <strong>Request Pending.</strong> An admin will review your request soon.
                </div>
            ) : status === 'Completed' ? (
                <div>
                    <div className="bg-green-50 text-green-800 p-3 rounded border border-green-200 text-sm mb-4">
                        ✅ Your last request was completed. You can request again if needed.
                    </div>
                    <RequestForm reason={reason} setReason={setReason} loading={loading} onSubmit={handleRequest} />
                </div>
            ) : (
                <RequestForm reason={reason} setReason={setReason} loading={loading} onSubmit={handleRequest} />
            )}
        </div>
    );
};

const RequestForm = ({ reason, setReason, loading, onSubmit }: any) => (
    <div className="flex gap-3 items-end">
        <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Forgot password, Security concern"
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
            />
        </div>
        <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-navy-900 text-white rounded text-sm font-medium hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
            {loading ? 'Sending...' : 'Request Change'}
        </button>
    </div>
);
