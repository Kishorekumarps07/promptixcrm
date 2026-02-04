'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { User, Briefcase, MapPin, GraduationCap, Phone, Edit3, Save, X } from 'lucide-react';

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
        // Education
        eduLevel: '',
        eduInstitution: '',
        eduYear: '',
        eduScore: '',
        // Emergency
        emergencyContactName: '',
        emergencyContactPhone: '',
    });

    const mapDataToState = (data: any) => {
        const user = data.user || {};
        const prof = data.profile || {};
        const edu = (prof.education && prof.education.length > 0) ? prof.education[0] : {};

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
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            let educationPayload: any[] = [];
            if (profile.eduLevel || profile.eduInstitution) {
                educationPayload = [{
                    level: profile.eduLevel,
                    institution: profile.eduInstitution,
                    year: parseInt(String(profile.eduYear)) || new Date().getFullYear(),
                    score: profile.eduScore
                }];
            }

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
                setMessage('✅ Profile updated successfully!');
                setIsEditing(false);
                if (data.profile) {
                    const newState = mapDataToState({
                        user: { name: profile.name, email: profile.email },
                        profile: data.profile
                    });
                    setProfile(newState);
                } else {
                    fetchProfile();
                }
            } else {
                setMessage(`❌ Error: ${data.message || 'Update failed'}`);
            }
        } catch (error) {
            setMessage('❌ Server Error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
                <Sidebar />
                <main className="md:ml-64 p-8 flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-mesh-gradient">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1 pb-24">
                <PageHeader
                    title="My Profile"
                    subtitle="Manage your employment and personal details"
                    actions={
                        !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-navy-900/20 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                        )
                    }
                />

                {message && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <ModernGlassCard title="Basic Info" className="h-full" delay={0.1}>
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {profile.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900">{profile.name}</h3>
                                    <p className="text-gray-500">{profile.designation || 'Employee'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Full Name" name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} icon={<User size={16} />} />
                                <InputField label="Email (Login ID)" name="email" value={profile.email} onChange={handleChange} disabled={!isEditing} icon={<Briefcase size={16} />} />
                            </div>
                        </ModernGlassCard>

                        {/* Official Details */}
                        <ModernGlassCard title="Official Details" className="h-full" delay={0.2}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Designation" name="designation" value={profile.designation} onChange={handleChange} disabled={!isEditing} />
                                <InputField label="Department" name="department" value={profile.department} onChange={handleChange} disabled={!isEditing} />
                                <InputField label="Date of Joining" name="dateOfJoining" value={profile.dateOfJoining} onChange={handleChange} disabled={!isEditing} type="date" />
                                <SelectField label="Employment Type" name="employmentType" value={profile.employmentType} onChange={handleChange} disabled={!isEditing} options={['Full-time', 'Part-time', 'Intern', 'Contract']} />
                            </div>
                        </ModernGlassCard>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Personal Details */}
                        <ModernGlassCard title="Personal Details" className="h-full" delay={0.3}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Date of Birth" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} disabled={!isEditing} type="date" />
                                <SelectField label="Gender" name="gender" value={profile.gender} onChange={handleChange} disabled={!isEditing} options={['Male', 'Female', 'Other']} />
                                <SelectField label="Marital Status" name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} disabled={!isEditing} options={['Single', 'Married']} />
                                <div className="md:col-span-2">
                                    <TextAreaField label="Current Address" name="currentAddress" value={profile.currentAddress} onChange={handleChange} disabled={!isEditing} />
                                </div>
                                <div className="md:col-span-2">
                                    <TextAreaField label="Permanent Address" name="permanentAddress" value={profile.permanentAddress} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </div>
                        </ModernGlassCard>

                        {/* Education & Contacts */}
                        <div className="space-y-6">
                            <ModernGlassCard title="Education" className="flex-1" delay={0.4}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Degree" name="eduLevel" value={profile.eduLevel} onChange={handleChange} disabled={!isEditing} icon={<GraduationCap size={16} />} />
                                    <InputField label="Institution" name="eduInstitution" value={profile.eduInstitution} onChange={handleChange} disabled={!isEditing} />
                                    <InputField label="Year" name="eduYear" value={profile.eduYear} onChange={handleChange} disabled={!isEditing} type="number" />
                                    <InputField label="Score/GPA" name="eduScore" value={profile.eduScore} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </ModernGlassCard>

                            <ModernGlassCard title="Emergency Contact" className="flex-1" delay={0.5}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Contact Name" name="emergencyContactName" value={profile.emergencyContactName} onChange={handleChange} disabled={!isEditing} icon={<User size={16} />} />
                                    <InputField label="Contact Phone" name="emergencyContactPhone" value={profile.emergencyContactPhone} onChange={handleChange} disabled={!isEditing} icon={<Phone size={16} />} type="tel" />
                                </div>
                            </ModernGlassCard>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="fixed bottom-6 right-6 z-50 flex gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                                disabled={submitting}
                            >
                                <X size={20} /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/30 font-bold hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                {submitting ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={20} />}
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}

// Reusable Field Components
const InputField = ({ label, name, value, onChange, disabled, type = 'text', icon }: any) => (
    <div className="space-y-1.5 group">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-orange-600 transition-colors flex items-center gap-1.5">
            {icon} {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none 
                ${disabled
                    ? 'bg-gray-50/50 border-gray-200 text-gray-500'
                    : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 shadow-sm'
                }`}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, disabled, options }: any) => (
    <div className="space-y-1.5 group">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-orange-600 transition-colors">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none appearance-none bg-no-repeat bg-[right_1rem_center]
                ${disabled
                    ? 'bg-gray-50/50 border-gray-200 text-gray-500'
                    : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 shadow-sm'
                }`}
            style={{ backgroundImage: disabled ? 'none' : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
        >
            <option value="">Select {label}</option>
            {options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, disabled }: any) => (
    <div className="space-y-1.5 group">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-orange-600 transition-colors">{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={2}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none resize-none
                ${disabled
                    ? 'bg-gray-50/50 border-gray-200 text-gray-500'
                    : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 shadow-sm'
                }`}
        />
    </div>
);
