'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForceChangePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password })
            });

            if (res.ok) {
                alert('Password updated successfully. You can now access your dashboard.');
                // We need to refresh or redirect to home explicitly
                // Force reload or redirect to determine next step
                // Ideally, AuthContext or Middleware will check again and allow access.
                window.location.href = '/login'; // Re-login is safest to ensure token/state sync
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (e) {
            alert('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-orange-200">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-navy-900">Update Password</h1>
                    <div className="mt-2 bg-yellow-50 text-yellow-800 p-3 rounded text-sm border border-yellow-200">
                        🔒 <strong>Security Requirement</strong><br />
                        An admin has reset your password. You must set a new secure password to continue.
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-navy-900 text-white rounded font-bold hover:bg-orange-600 transition-colors shadow-lg"
                    >
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
