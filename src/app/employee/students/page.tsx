'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function EmployeeStudents() {
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/employee/students')
            .then(res => res.json())
            .then(data => {
                if (data.students) setStudents(data.students);
            });
    }, []);

    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const openDetails = async (studentId: string) => {
        setLoadingDetails(true);
        setShowModal(true);
        try {
            const res = await fetch(`/api/admin/users/${studentId}/onboarding`);
            if (res.ok) {
                const data = await res.json();
                setOnboardingData(data.onboarding);
            } else {
                setOnboardingData(null);
            }
        } catch (e) {
            setOnboardingData(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <h1 className="page-header">My Students</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {students.map(student => (
                        <div key={student._id} style={{ background: 'var(--secondary-navy)', padding: '1.5rem', borderRadius: '8px' }} className="relative">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>{student.email}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#8892b0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Status: <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{student.status}</span></span>
                                <button
                                    onClick={() => openDetails(student._id)}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                    {students.length === 0 && <p style={{ color: '#8892b0' }}>No students assigned yet.</p>}
                </div>

                {/* Read Only Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal w-full max-w-2xl text-navy-900" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-xl font-bold">Student Details</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 font-bold text-xl">&times;</button>
                            </div>

                            {loadingDetails ? <p>Loading...</p> : !onboardingData ? (
                                <p className="text-gray-500 italic">This student has not completed onboarding yet.</p>
                            ) : (
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <h3 className="col-span-2 font-bold text-lg text-blue-600 mt-2 border-b">Personal</h3>
                                        <p><span className="font-semibold text-gray-600">DOB:</span> {new Date(onboardingData.personalDetails?.dateOfBirth).toLocaleDateString()}</p>
                                        <p><span className="font-semibold text-gray-600">Gender:</span> {onboardingData.personalDetails?.gender}</p>
                                        <p><span className="font-semibold text-gray-600">Phone:</span> {onboardingData.personalDetails?.phone}</p>
                                        <p className="col-span-2"><span className="font-semibold text-gray-600">Address:</span> {onboardingData.personalDetails?.address}</p>

                                        <h3 className="col-span-2 font-bold text-lg text-blue-600 mt-4 border-b">Education</h3>
                                        <p><span className="font-semibold text-gray-600">College:</span> {onboardingData.educationDetails?.collegeName}</p>
                                        <p><span className="font-semibold text-gray-600">Degree:</span> {onboardingData.educationDetails?.degree}</p>
                                        <p><span className="font-semibold text-gray-600">Dept:</span> {onboardingData.educationDetails?.department}</p>
                                        <p><span className="font-semibold text-gray-600">Year:</span> {onboardingData.educationDetails?.yearOfStudy}</p>

                                        <h3 className="col-span-2 font-bold text-lg text-blue-600 mt-4 border-b">Fees</h3>
                                        <p><span className="font-semibold text-gray-600">Total:</span> {onboardingData.feesDetails?.totalFees}</p>
                                        <p><span className="font-semibold text-gray-600">Paid:</span> {onboardingData.feesDetails?.paidAmount}</p>
                                        <p><span className="font-semibold text-gray-600">Status:</span>
                                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${onboardingData.feesDetails?.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {onboardingData.feesDetails?.paymentStatus}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="pt-4 text-xs text-gray-400 border-t">
                                        Last Updated: {onboardingData.lastUpdatedAt ? new Date(onboardingData.lastUpdatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
