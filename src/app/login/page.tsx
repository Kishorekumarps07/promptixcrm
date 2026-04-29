'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('[Login] Attempting login for:', email);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await res.json();
            console.log('[Login] Response status:', res.status);

            if (!res.ok) throw new Error(data.message || 'Login failed');

            console.log('[Login] Success, user role:', data.user.role);
            login(data.user);
        } catch (err: any) {
            console.error('[Login] Error:', err.message);
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-navy-900 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">PromptiX</h1>
                    <p className="text-gray-300">CRM & Learning Management</p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Sign In to your account</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded mb-6 text-sm flex items-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-orange-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500">
                    Need help? Contact support via <a href="https://promptix.pro" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 transition-colors">promptix.pro</a>
                </div>
            </div>
        </div>
    );
}
