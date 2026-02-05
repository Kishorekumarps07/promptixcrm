'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { User, Briefcase, MapPin, GraduationCap, Phone, Edit3, Save, X } from 'lucide-react';
import EmployeeProfileForm from '@/components/employee/EmployeeProfileForm';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const [profile, setProfile] = useState({
        // User Details
        name: '',
        email: '',
        photo: '',
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
            photo: user.photo || '',
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

    const handlePhotoUpdate = async (photoUrl: string) => {
        try {
            console.log('[handlePhotoUpdate] Updating photo:', photoUrl);
            const res = await fetch('/api/employee/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo: photoUrl })
            });

            const responseData = await res.json();
            console.log('[handlePhotoUpdate] API Response:', res.status, responseData);

            if (res.ok) {
                setProfile(prev => ({ ...prev, photo: photoUrl }));
                // Refresh full profile to ensure sync
                fetchProfile();
                toast.success('Profile picture updated!');
            } else {
                throw new Error(responseData.message || 'Failed to update photo');
            }
        } catch (error: any) {
            console.error('Photo update error:', error);
            throw error;
        }
    };

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


                <EmployeeProfileForm
                    initialData={profile}
                    isEditing={isEditing}
                    onSave={async (data) => {
                        // Adapt data to match API expectations if needed or just pass through
                        // The form data structure matches what we expect in handleSave
                        // Re-implement handleSave logic here or keep it wrapper?
                        // Let's call the logic directly here or via the wrapper

                        // We need to trigger the handleSave equivalent.
                        // Since `handleSave` uses `profile` state, we should use the data passed from form.

                        // Let's inline the logic or call a function

                        let educationPayload: any[] = [];
                        if (data.eduLevel || data.eduInstitution) {
                            educationPayload = [{
                                level: data.eduLevel,
                                institution: data.eduInstitution,
                                year: parseInt(String(data.eduYear)) || new Date().getFullYear(),
                                score: data.eduScore
                            }];
                        }

                        try {
                            const res = await fetch('/api/employee/profile/update', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: data.name,
                                    email: data.email,
                                    phoneNumber: data.phoneNumber,
                                    emergencyContactName: data.emergencyContactName,
                                    emergencyContactPhone: data.emergencyContactPhone,
                                    designation: data.designation,
                                    dateOfJoining: data.dateOfJoining,
                                    employmentType: data.employmentType,
                                    department: data.department,
                                    dateOfBirth: data.dateOfBirth,
                                    gender: data.gender,
                                    currentAddress: data.currentAddress,
                                    permanentAddress: data.permanentAddress,
                                    maritalStatus: data.maritalStatus,
                                    education: educationPayload
                                })
                            });

                            const resData = await res.json();

                            if (res.ok) {
                                toast.success("Profile updated successfully!");
                                setIsEditing(false);
                                if (resData.profile) {
                                    setProfile(data);
                                }
                            } else {
                                throw new Error(resData.message || "Failed to update profile");
                            }
                        } catch (error: any) {
                            console.error(error);
                            toast.error(error.message || "An error occurred while saving");
                        }
                    }}
                    onCancel={() => setIsEditing(false)}
                    onPhotoUpdate={handlePhotoUpdate}
                />
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
