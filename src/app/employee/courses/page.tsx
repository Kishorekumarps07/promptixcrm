'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';
import CourseContentModal from '@/components/CourseContentModal';

export default function EmployeeCourses() {
    // Content Modal State
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);

    const openContentModal = (course: any) => {
        setCurrentCourse(course);
        setIsContentModalOpen(true);
    };

    const closeContentModal = () => {
        setIsContentModalOpen(false);
        setCurrentCourse(null);
    };

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', description: '', category: 'Internship', duration: '', status: 'Active' });

    // Students Modal
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [viewingCourseTitle, setViewingCourseTitle] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (data.courses) setCourses(data.courses);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = currentCourse ? `/api/courses/${currentCourse._id}` : '/api/courses';
        const method = currentCourse ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                closeModal();
                fetchCourses();
            } else {
                alert('Failed to save course');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEnrolledStudents = async (courseId: string, courseTitle: string) => {
        setViewingCourseTitle(courseTitle);
        setEnrolledStudents([]);
        try {
            const res = await fetch(`/api/courses/${courseId}/students`);
            const data = await res.json();
            if (data.students) setEnrolledStudents(data.students);
            setIsStudentsModalOpen(true);
        } catch (error) {
            console.error(error);
            alert('Failed to load students');
        }
    };

    const openModal = (course?: any) => {
        if (course) {
            setCurrentCourse(course);
            setFormData({
                title: course.title,
                description: course.description,
                category: course.category,
                duration: course.duration,
                status: course.status
            });
        } else {
            setCurrentCourse(null);
            setFormData({ title: '', description: '', category: 'Internship', duration: '', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCourse(null);
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Category', accessor: 'category' },
        { header: 'Duration', accessor: 'duration' },
        { header: 'Status', accessor: (c: any) => c.status },
        {
            header: 'Actions',
            accessor: (c: any) => (
                <div className="flex gap-2">
                    <button onClick={() => openModal(c)} className="action-btn">Edit</button>
                    <button onClick={() => openContentModal(c)} className="action-btn bg-indigo-500 hover:bg-indigo-600">Content</button>
                    <button onClick={() => fetchEnrolledStudents(c._id, c.title)} className="action-btn btn-primary bg-blue-600 hover:bg-blue-700">Students</button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header">
                    <h1 className="text-2xl font-bold text-navy-900">Course Management</h1>
                    <button onClick={() => openModal()} className="btn btn-primary shadow-lg shadow-blue-500/30" style={{ minHeight: '44px' }}>+ Create Course</button>
                </header>

                <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                    {loading ? <div className="p-8 text-center text-gray-500">Loading courses...</div> : (
                        <Table
                            data={courses}
                            columns={columns}
                            mobileCard={(c) => (
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-navy-900 text-lg leading-tight">{c.title}</div>
                                        <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-400 uppercase text-xs">Category:</span> {c.category}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-400 uppercase text-xs">Duration:</span> {c.duration}
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(c)} className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium" style={{ minHeight: '44px' }}>Edit</button>
                                            <button onClick={() => openContentModal(c)} className="flex-1 btn bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium" style={{ minHeight: '44px' }}>Content</button>
                                        </div>
                                        <button onClick={() => fetchEnrolledStudents(c._id, c.title)} className="btn btn-primary w-full text-sm font-bold shadow-sm" style={{ minHeight: '44px' }}>View Students</button>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>{currentCourse ? 'Edit Course' : 'Create Course'}</h2>
                            <form onSubmit={handleCreateUpdate} className="flex flex-col gap-4 mt-4">
                                <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="field-input" required />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="field-input min-h-[100px]" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="field-input">
                                        <option>Internship</option>
                                        <option>Workshop</option>
                                        <option>Bootcamp</option>
                                    </select>
                                    <input placeholder="Duration (e.g. 3 Months)" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="field-input" required />
                                    <input placeholder="Duration (e.g. 3 Months)" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="field-input" required />
                                </div>
                                {/* Employees cannot change status */}
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={closeModal} className="btn">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{currentCourse ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Students List Modal */}
                {isStudentsModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsStudentsModalOpen(false)}>
                        <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
                            <h2>Enrolled Students - {viewingCourseTitle}</h2>
                            <div className="mt-4 max-h-[60vh] overflow-auto">
                                {enrolledStudents.length === 0 ? (
                                    <p className="text-gray-500">No students enrolled yet.</p>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-2">Name</th>
                                                <th className="p-2">Email</th>
                                                <th className="p-2">Phone</th>
                                                <th className="p-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledStudents.map(s => (
                                                <tr key={s._id} className="border-b">
                                                    <td className="p-2">{s.name}</td>
                                                    <td className="p-2">{s.email}</td>
                                                    <td className="p-2">{s.phone || '-'}</td>
                                                    <td className="p-2"><span className="badge badge-success">{s.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setIsStudentsModalOpen(false)} className="btn">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Modal */}
                {isContentModalOpen && currentCourse && (
                    <CourseContentModal
                        isOpen={isContentModalOpen}
                        onClose={closeContentModal}
                        courseId={currentCourse._id}
                        courseTitle={currentCourse.title}
                    />
                )}
            </main>
        </div>
    );
}
