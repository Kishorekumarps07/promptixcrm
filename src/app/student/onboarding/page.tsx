'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [courses, setCourses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        personalDetails: {
            dateOfBirth: '',
            gender: 'Male',
            phone: '',
            address: ''
        },
        courseId: '',
        educationDetails: {
            collegeName: '',
            degree: '',
            department: '',
            yearOfStudy: '',
            graduationYear: ''
        },
        feesDetails: {
            totalFees: '',
            paidAmount: '',
            paymentMode: 'Cash',
            paymentStatus: 'Pending'
        }
    });

    // Load state from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('onboarding_data');
        const savedStep = localStorage.getItem('onboarding_step');
        if (savedData) setFormData(JSON.parse(savedData));
        if (savedStep) setStep(parseInt(savedStep));

        fetch('/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data.courses || []))
            .catch(console.error);
    }, []);

    // Save state to local storage on change
    useEffect(() => {
        localStorage.setItem('onboarding_data', JSON.stringify(formData));
        localStorage.setItem('onboarding_step', step.toString());
    }, [formData, step]);

    const handleChange = (section: string, field: string, value: string) => {
        if (section === 'root') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section as keyof typeof prev] as any),
                    [field]: value
                }
            }));
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/student/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Submission failed');
            }

            // Clear local storage
            localStorage.removeItem('onboarding_data');
            localStorage.removeItem('onboarding_step');

            alert('Onboarding Completed! Redirecting...');
            window.location.href = '/student/dashboard';
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const selectedCourse = courses.find(c => c._id === formData.courseId);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-navy-900 mb-2">Welcome! Let's get you set up.</h1>
                <p className="text-gray-500 mb-8">Please complete your profile to continue.</p>

                {/* Steps Indicator */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {s}
                        </div>
                    ))}
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input type="date" required className="field-input"
                                    value={formData.personalDetails.dateOfBirth}
                                    onChange={e => handleChange('personalDetails', 'dateOfBirth', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select className="field-input"
                                    value={formData.personalDetails.gender}
                                    onChange={e => handleChange('personalDetails', 'gender', e.target.value)}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input className="field-input" placeholder="1234567890" required
                                    value={formData.personalDetails.phone}
                                    onChange={e => handleChange('personalDetails', 'phone', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea className="field-input" rows={3}
                                    value={formData.personalDetails.address}
                                    onChange={e => handleChange('personalDetails', 'address', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={nextStep} className="btn btn-primary">Next</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Course Selection */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Select Your Course</h2>
                        <p className="text-sm text-gray-500">Choose the course you are enrolling in. This cannot be changed later.</p>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Programs</label>
                            <select
                                className="field-input h-12"
                                value={formData.courseId}
                                onChange={e => handleChange('root', 'courseId', e.target.value)}
                            >
                                <option value="">-- Select a Course --</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.title} ({c.category})</option>
                                ))}
                            </select>
                        </div>

                        {selectedCourse && (
                            <div className="bg-blue-50 p-4 rounded border border-blue-100 mt-4">
                                <h3 className="font-bold text-blue-900">{selectedCourse.title}</h3>
                                <p className="text-sm text-blue-700 mt-1">{selectedCourse.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="badge badge-info text-xs">{selectedCourse.category}</span>
                                    <span className="text-xs text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">{selectedCourse.duration}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                            <button
                                onClick={nextStep}
                                disabled={!formData.courseId}
                                className="btn btn-primary"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Education */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Education Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                <input className="field-input"
                                    value={formData.educationDetails.collegeName}
                                    onChange={e => handleChange('educationDetails', 'collegeName', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                <input className="field-input" placeholder="B.Tech, B.Sc"
                                    value={formData.educationDetails.degree}
                                    onChange={e => handleChange('educationDetails', 'degree', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input className="field-input" placeholder="CSE, ECE"
                                    value={formData.educationDetails.department}
                                    onChange={e => handleChange('educationDetails', 'department', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                                <select className="field-input"
                                    value={formData.educationDetails.yearOfStudy}
                                    onChange={e => handleChange('educationDetails', 'yearOfStudy', e.target.value)}>
                                    <option value="">Select</option>
                                    <option>1st Year</option>
                                    <option>2nd Year</option>
                                    <option>3rd Year</option>
                                    <option>4th Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                                <input className="field-input" type="number" placeholder="2025"
                                    value={formData.educationDetails.graduationYear}
                                    onChange={e => handleChange('educationDetails', 'graduationYear', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                            <button onClick={nextStep} className="btn btn-primary">Next</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Fees */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Fee Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees</label>
                                <input className="field-input" type="number" required
                                    value={formData.feesDetails.totalFees}
                                    onChange={e => handleChange('feesDetails', 'totalFees', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                                <input className="field-input" type="number"
                                    value={formData.feesDetails.paidAmount}
                                    onChange={e => handleChange('feesDetails', 'paidAmount', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                <select className="field-input"
                                    value={formData.feesDetails.paymentMode}
                                    onChange={e => handleChange('feesDetails', 'paymentMode', e.target.value)}>
                                    <option>Cash</option>
                                    <option>UPI</option>
                                    <option>Bank Transfer</option>
                                    <option>Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select className="field-input"
                                    value={formData.feesDetails.paymentStatus}
                                    onChange={e => handleChange('feesDetails', 'paymentStatus', e.target.value)}>
                                    <option>Pending</option>
                                    <option>Partial</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                            <button onClick={nextStep} className="btn btn-primary">Next</button>
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">Review & Submit</h2>
                        <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                            <p><strong>Name:</strong> (Logged In User)</p>
                            <p><strong>Course:</strong> {selectedCourse?.title}</p>
                            <p><strong>Phone:</strong> {formData.personalDetails.phone}</p>
                            <p><strong>College:</strong> {formData.educationDetails.collegeName}</p>
                            <p><strong>Total Fees:</strong> {formData.feesDetails.totalFees}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" required className="w-4 h-4" />
                            <span className="text-sm text-gray-600">I confirm that the details provided are accurate.</span>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={prevStep} className="btn btn-ghost">Back</button>
                            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary w-32">
                                {submitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

