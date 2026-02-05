'use client';

import React, { useState } from 'react';
import ModernGlassCard from '@/components/ui/ModernGlassCard';
import { User, Briefcase, MapPin, GraduationCap, Phone, Save, X, Loader2 } from 'lucide-react';

interface EmployeeProfileFormProps {
    initialData: any;
    isEditing: boolean;
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    isAdmin?: boolean; // To potentially show extra fields or allow specific overrides
}

export default function EmployeeProfileForm({ initialData, isEditing, onSave, onCancel, isAdmin = false }: EmployeeProfileFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave(formData);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Info */}
                <ModernGlassCard title="Basic Info" className="h-full" delay={0.1}>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {formData.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-navy-900">{formData.name}</h3>
                            <p className="text-gray-500">{formData.designation || 'Employee'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} icon={<User size={16} />} />
                        <InputField label="Email (Login ID)" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} icon={<Briefcase size={16} />} />
                    </div>
                </ModernGlassCard>

                {/* Official Details */}
                <ModernGlassCard title="Official Details" className="h-full" delay={0.2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Designation" name="designation" value={formData.designation} onChange={handleChange} disabled={!isEditing} />
                        <InputField label="Department" name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} />
                        <InputField label="Date of Joining" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} disabled={!isEditing} type="date" />
                        <SelectField label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} disabled={!isEditing} options={['Full-time', 'Part-time', 'Intern', 'Contract']} />
                    </div>
                </ModernGlassCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Personal Details */}
                <ModernGlassCard title="Personal Details" className="h-full" delay={0.3}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={!isEditing} type="date" />
                        <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} options={['Male', 'Female', 'Other']} />
                        <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} disabled={!isEditing} options={['Single', 'Married']} />
                        <div className="md:col-span-2">
                            <TextAreaField label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="md:col-span-2">
                            <TextAreaField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </div>
                </ModernGlassCard>

                {/* Education & Contacts */}
                <div className="space-y-6">
                    <ModernGlassCard title="Education" className="flex-1" delay={0.4}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Degree" name="eduLevel" value={formData.eduLevel} onChange={handleChange} disabled={!isEditing} icon={<GraduationCap size={16} />} />
                            <InputField label="Institution" name="eduInstitution" value={formData.eduInstitution} onChange={handleChange} disabled={!isEditing} />
                            <InputField label="Year" name="eduYear" value={formData.eduYear} onChange={handleChange} disabled={!isEditing} type="number" />
                            <InputField label="Score/GPA" name="eduScore" value={formData.eduScore} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </ModernGlassCard>

                    <ModernGlassCard title="Emergency Contact" className="flex-1" delay={0.5}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} disabled={!isEditing} icon={<User size={16} />} />
                            <InputField label="Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} disabled={!isEditing} icon={<Phone size={16} />} type="tel" />
                        </div>
                    </ModernGlassCard>
                </div>
            </div>

            {isEditing && (
                <div className="fixed bottom-6 right-6 z-50 flex gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <button
                        type="button"
                        onClick={onCancel}
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
                        {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
        </form>
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
            value={value || ''}
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
            value={value || ''}
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
            value={value || ''}
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
