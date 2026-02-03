'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeProfileSetup() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Employment
        phoneNumber: '',
        designation: '',
        dateOfJoining: '',
        employmentType: 'Full-time',
        department: '',

        // Personal
        dateOfBirth: '',
        gender: '',
        maritalStatus: 'Single',
        currentAddress: '',
        permanentAddress: '',

        // Education (Highest Qualification)
        eduLevel: '',
        eduInstitution: '',
        eduYear: '',
        eduScore: '',

        // Emergency
        emergencyContactName: '',
        emergencyContactPhone: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load user info", e);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isFormValid = () => {
        return (
            formData.phoneNumber.length >= 10 &&
            formData.designation.length > 0 &&
            formData.dateOfJoining.length > 0 &&
            formData.employmentType.length > 0 &&
            formData.dateOfBirth.length > 0 &&
            formData.gender.length > 0 &&
            formData.currentAddress.length > 0 &&
            formData.eduLevel.length > 0
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Construct payload
            const payload = {
                ...formData,
                education: [{
                    level: formData.eduLevel,
                    institution: formData.eduInstitution,
                    year: parseInt(formData.eduYear) || 0,
                    score: formData.eduScore
                }],
                emergencyContact: {
                    name: formData.emergencyContactName,
                    phone: formData.emergencyContactPhone
                }
            };

            const res = await fetch('/api/employee/profile/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Success! Redirect to dashboard
            router.push('/employee/dashboard');
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to PromptiX! 🎉</h1>
                    <p className="opacity-90 text-lg">Please complete your employee profile to continue.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Section 1: Official Details */}
                    <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-4 border-b pb-2">📂 Official Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={user?.name || 'Employee'} disabled className="w-full form-input bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="text" value={user?.email || 'email@example.com'} disabled className="w-full form-input bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full form-input border rounded p-2" required placeholder="10-digit number" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                                <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full form-input border rounded p-2" required />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
                                <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="w-full form-input border rounded p-2" required />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                                <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full form-select border rounded p-2" required>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Intern">Intern</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full form-input border rounded p-2" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Personal Details */}
                    <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-4 border-b pb-2">👤 Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full form-input border rounded p-2" required />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full form-select border rounded p-2" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full form-select border rounded p-2">
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label>
                                <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange} rows={2} className="w-full form-textarea border rounded p-2" required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                                <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} rows={2} className="w-full form-textarea border rounded p-2" placeholder="Same as current address if empty" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Education */}
                    <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-4 border-b pb-2">🎓 Highest Qualification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Qualification *</label>
                                <input type="text" name="eduLevel" value={formData.eduLevel} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" className="w-full form-input border rounded p-2" required />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution / University *</label>
                                <input type="text" name="eduInstitution" value={formData.eduInstitution} onChange={handleChange} className="w-full form-input border rounded p-2" required />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing *</label>
                                <input type="number" name="eduYear" value={formData.eduYear} onChange={handleChange} className="w-full form-input border rounded p-2" required min="1950" max="2030" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score / Percentage *</label>
                                <input type="text" name="eduScore" value={formData.eduScore} onChange={handleChange} placeholder="e.g. 85% or 8.5 CGPA" className="w-full form-input border rounded p-2" required />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Emergency */}
                    <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-4 border-b pb-2">🚑 Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full form-input border rounded p-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="w-full form-input border rounded p-2" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={submitting || !isFormValid()}
                            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xl transition-all shadow-lg transform hover:-translate-y-0.5
                                ${!isFormValid() || submitting
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                }`}
                        >
                            {submitting ? 'Setting up Profile...' : 'Save & Continue to Dashboard →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
