'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function EmployeeProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const [profile, setProfile] = useState({
        // User Details
        name: '',
        email: '',

        phoneNumber: '',
        designation: '',
        dateOfJoining: '',
        employmentType: 'Full-time',
        department: '',

        // Personal
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        currentAddress: '',
        permanentAddress: '',

        // Education (Highest)
        eduLevel: '',
        eduInstitution: '',
        eduYear: '',
        eduScore: '',

        emergencyContactName: '',
        emergencyContactPhone: '',
    });

    // Helper to map API data to State
    const mapDataToState = (data: any) => {
        const user = data.user || {};
        const prof = data.profile || {};
        const edu = (prof.education && prof.education.length > 0) ? prof.education[0] : {};

        console.log('[DEBUG] Mapping Education Data:', edu);

        return {
            name: prof.name || user.name || '',
            email: prof.email || user.email || '',

            phoneNumber: prof.phoneNumber || '',
            designation: prof.designation || '',
            dateOfJoining: prof.dateOfJoining ? new Date(prof.dateOfJoining).toISOString().split('T')[0] : '',
            employmentType: prof.employmentType || 'Full-time',
            department: prof.department || '',

            dateOfBirth: prof.dateOfBirth ? new Date(prof.dateOfBirth).toISOString().split('T')[0] : '',
            gender: prof.gender || '',
            maritalStatus: prof.maritalStatus || '',
            currentAddress: prof.currentAddress || '',
            permanentAddress: prof.permanentAddress || '',

            eduLevel: edu.level || '',
            eduInstitution: edu.institution || '',
            eduYear: edu.year || '',
            eduScore: edu.score || '',

            emergencyContactName: prof.emergencyContact?.name || '',
            emergencyContactPhone: prof.emergencyContact?.phone || '',
        };
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/employee/profile/status?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                console.log('[DEBUG] Fetched Profile Data:', data);
                setProfile(mapDataToState(data));
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            // Include education only if level OR institution is typed
            let educationPayload: any[] = [];
            if (profile.eduLevel || profile.eduInstitution) {
                educationPayload = [{
                    level: profile.eduLevel,
                    institution: profile.eduInstitution,
                    year: parseInt(String(profile.eduYear)) || new Date().getFullYear(),
                    score: profile.eduScore
                }];
            }

            console.log('[DEBUG] Education Payload being sent:', educationPayload);

            const res = await fetch('/api/employee/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    phoneNumber: profile.phoneNumber,
                    emergencyContactName: profile.emergencyContactName,
                    emergencyContactPhone: profile.emergencyContactPhone,
                    designation: profile.designation,
                    dateOfJoining: profile.dateOfJoining,
                    employmentType: profile.employmentType,
                    department: profile.department,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    currentAddress: profile.currentAddress,
                    permanentAddress: profile.permanentAddress,
                    maritalStatus: profile.maritalStatus,
                    education: educationPayload
                })
            });

            const data = await res.json();

            if (res.ok) {
                console.log('[DEBUG] Update Success. Response Data:', data);
                setMessage('✅ Profile updated successfully!');
                setIsEditing(false);

                // Update state immediately from response (Single Source of Truth)
                if (data.profile) {
                    // Reconstruct full object merging with existing user details (name/email might not be in profile doc)
                    const newState = mapDataToState({
                        user: { name: profile.name, email: profile.email }, // Preserve curr user details
                        profile: data.profile
                    });
                    setProfile(newState);
                    console.log('[DEBUG] State updated from response:', newState);
                } else {
                    // Fallback fetch if response weird
                    fetchProfile();
                }
            } else {
                console.error('[DEBUG] Update Failed:', JSON.stringify(data));
                setMessage(`❌ Error: ${data.message || 'Update failed'}`);
            }
        } catch (error) {
            console.error('[DEBUG] Save Exception:', error);
            setMessage('❌ Server Error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <Sidebar />
                <main className="md:ml-64 p-8 flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900">My Profile</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your employment and personal details</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            ✏️ Edit Details
                        </button>
                    )}
                </header>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden space-y-6">

                    {/* Basic Info (User Model) */}
                    <div>
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">🆔 Basic Info</h2>
                            {isEditing && <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded">Login Credentials</span>}
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <label className="block text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Email (Login ID)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Official Details */}
                    <div>
                        <div className="p-6 border-b border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">📂 Official Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <label className="block text-gray-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={profile.designation}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Date of Joining</label>
                                <input
                                    type="date"
                                    name="dateOfJoining"
                                    value={profile.dateOfJoining}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={profile.employmentType}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full form-select px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={profile.department}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div>
                        <div className="p-6 border-b border-t border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">👤 Personal Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <label className="block text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profile.dateOfBirth}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full form-select px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Marital Status</label>
                                <select
                                    name="maritalStatus"
                                    value={profile.maritalStatus}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full form-select px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-1">Current Address</label>
                                <textarea
                                    name="currentAddress"
                                    value={profile.currentAddress}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={2}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-1">Permanent Address</label>
                                <textarea
                                    name="permanentAddress"
                                    value={profile.permanentAddress}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={2}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <div className="p-6 border-b border-t border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">🎓 Educational Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <label className="block text-gray-700 mb-1">Degree / Qualification</label>
                                <input
                                    type="text"
                                    name="eduLevel"
                                    value={profile.eduLevel}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Institution</label>
                                <input
                                    type="text"
                                    name="eduInstitution"
                                    value={profile.eduInstitution}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Year of Passing</label>
                                <input
                                    type="number"
                                    name="eduYear"
                                    value={profile.eduYear}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Score</label>
                                <input
                                    type="text"
                                    name="eduScore"
                                    value={profile.eduScore}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <div className="p-6 border-b border-t border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">📞 Contact & Emergency</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="col-span-1">
                                <label className="block text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div className="col-span-1 border-l pl-6">
                                <label className="block text-gray-700 mb-1">Emergency Name</label>
                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={profile.emergencyContactName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                            <div className="col-span-1 pl-6">
                                <label className="block text-gray-700 mb-1">Emergency Phone</label>
                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    value={profile.emergencyContactPhone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 rounded border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm disabled:opacity-70"
                            >
                                {submitting ? 'Saving Changes...' : 'Save Updates'}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
