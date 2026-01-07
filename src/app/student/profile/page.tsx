'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

export default function StudentProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/profile')
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <p className="text-gray-500">Loading profile...</p>
            </main>
        </div>
    );

    if (!profile) return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <p className="text-red-500">Failed to load profile.</p>
            </main>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">My Profile</h1>
                    <p className="text-gray-500">View your program details.</p>
                </header>

                <div className="max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                            <div className="w-20 h-20 rounded-full bg-navy-900 flex items-center justify-center text-primary-orange text-3xl font-bold border-2 border-orange-500 overflow-hidden relative shrink-0">
                                {profile.photo ? (
                                    <Image
                                        src={profile.photo}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    profile.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-navy-900">{profile.name}</h2>
                                <p className="text-gray-500">{profile.email}</p>
                                <p className="text-gray-500 text-sm mt-1">📞 {profile.phone}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {profile.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Program Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Course / Program</label>
                                    <div className="text-gray-900 font-medium">{profile.course || 'Not Assigned'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                                        <div className="text-gray-900">{profile.startDate ? new Date(profile.startDate).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                                        <div className="text-gray-900">{profile.endDate ? new Date(profile.endDate).toLocaleDateString() : '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Mentorship</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Assigned Mentor</label>
                                    <div className="text-gray-900 font-medium">{profile.mentor}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Courses Integration */}
                    <div className="p-8 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Enrolled Courses</h3>
                        <CoursesList />
                    </div>

                    {/* Security Section */}
                    <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
                        <PasswordRequestWidget />
                    </div>
                </div>
            </main>
        </div>
    );
}

const CoursesList = () => {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/student/courses')
            .then(res => res.json())
            .then(data => { if (data.enrollments) setCourses(data.enrollments); })
            .catch(console.error);
    }, []);

    if (courses.length === 0) return <p className="text-gray-500 italic">No courses enrolled.</p>;

    return (
        <div className="grid gap-4">
            {courses.map(e => {
                if (!e.courseId) return null;
                return (
                    <div key={e._id} className="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200">
                        <div>
                            <h4 className="font-bold text-navy-900">{e.courseId.title}</h4>
                            <span className="text-xs text-gray-500">{e.courseId.category || 'General'} • {e.courseId.duration}</span>
                        </div>
                        <span className={`badge ${e.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{e.status}</span>
                    </div>
                )
            })}
        </div>
    );
};

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
