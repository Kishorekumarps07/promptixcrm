'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Table from '@/components/ui/Table';
import CourseContentModal from '@/components/CourseContentModal';

export default function AdminCourses() {
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

    // Enrollment Modal State
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (data.courses) setCourses(data.courses);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            // Reusing admin users API, filtering typically happens backend or frontend. 
            // Ideally we'd have /api/admin/users?role=STUDENT, but filtering here for speed.
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) {
                setStudents(data.users.filter((u: any) => u.role === 'STUDENT'));
            }
        } catch (error) {
            console.error(error);
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

    const handleDelete = async (id: string) => {
        // if (!confirm('Are you sure you want to delete this course?')) return; // Removed Action Blocker
        try {
            await fetch(`/api/courses/${id}`, { method: 'DELETE' });
            fetchCourses();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedCourseId) return;

        try {
            const res = await fetch(`/api/courses/${selectedCourseId}/assign-students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: selectedStudentId })
            });
            const json = await res.json();
            if (res.ok) {
                alert('Student enrolled successfully!');
                closeEnrollModal();
            } else {
                alert(`Error: ${json.message}`);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to enroll');
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

    const openEnrollModal = (courseId: string) => {
        setSelectedCourseId(courseId);
        fetchStudents();
        setIsEnrollModalOpen(true);
    };

    const closeEnrollModal = () => {
        setIsEnrollModalOpen(false);
        setSelectedCourseId(null);
        setSelectedStudentId('');
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        // if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return; // Removed Action Blocker

        try {
            const res = await fetch(`/api/courses/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchCourses();
            else alert('Failed to update status');
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Category', accessor: 'category' },
        { header: 'Duration', accessor: 'duration' },
        { header: 'Created By', accessor: (c: any) => c.createdBy?.name || 'Unknown' },
        {
            header: 'Status',
            accessor: (c: any) => <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
        },
        {
            header: 'Actions',
            accessor: (c: any) => (
                <div className="flex gap-2">
                    <button onClick={() => openModal(c)} className="action-btn">Edit</button>
                    <button onClick={() => openContentModal(c)} className="action-btn bg-indigo-500 hover:bg-indigo-600">Content</button>
                    <button onClick={() => handleToggleStatus(c._id, c.status)} className={`action-btn ${c.status === 'Active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openEnrollModal(c._id)} className="action-btn btn-primary bg-purple-600 hover:bg-purple-700">Assign</button>
                    <button onClick={() => handleDelete(c._id)} className="action-btn btn-delete">Delete</button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <div className="page-header">
                    <h1>Courses Management</h1>
                    <button onClick={() => openModal()} className="btn btn-primary">+ Create Course</button>
                </div>

                <div className="table-container">
                    {loading ? <p>Loading...</p> : (
                        <Table
                            data={courses}
                            columns={columns}
                            mobileCard={(course) => (
                                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                                    {/* Header: Title & Badge */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-navy-900 text-lg leading-tight mb-1 truncate">{course.title}</h4>
                                            <span className="badge badge-info text-xs uppercase tracking-wider">{course.category}</span>
                                        </div>
                                        <span className={`badge ${course.status === 'Active' ? 'badge-success' : 'badge-error'} shrink-0`}>
                                            {course.status}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                                        <div>
                                            <span className="text-xs text-uppercase text-gray-400 font-semibold block mb-1">Duration</span>
                                            <span className="font-medium text-navy-800">{course.duration}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-uppercase text-gray-400 font-semibold block mb-1">Created By</span>
                                            <span className="font-medium text-navy-800 truncate block">{course.createdBy?.name || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <button
                                            onClick={() => openModal(course)}
                                            className="btn bg-white text-navy-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium shadow-sm"
                                            style={{ minHeight: '44px' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openContentModal(course)}
                                            className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-medium shadow-sm"
                                            style={{ minHeight: '44px' }}
                                        >
                                            Content
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => openEnrollModal(course._id)}
                                        className="w-full btn bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium shadow-sm"
                                        style={{ minHeight: '44px' }}
                                    >
                                        Assign Student
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleToggleStatus(course._id, course.status)}
                                            className={`btn text-white text-sm font-medium shadow-sm ${course.status === 'Active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
                                            style={{ minHeight: '44px' }}
                                        >
                                            {course.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="btn bg-white text-red-600 border border-gray-300 hover:bg-red-50 hover:border-red-200 text-sm font-medium shadow-sm"
                                            style={{ minHeight: '44px' }}
                                        >
                                            Delete
                                        </button>
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
                                </div>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="field-input">
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={closeModal} className="btn">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{currentCourse ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Enroll Modal */}
                {isEnrollModalOpen && (
                    <div className="modal-overlay" onClick={closeEnrollModal}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>Assign Student</h2>
                            <form onSubmit={handleEnroll} className="flex flex-col gap-4 mt-4">
                                <p className="text-sm text-gray-500">Select a student to enroll in this course.</p>
                                <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="field-input" required>
                                    <option value="">-- Select Student --</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={closeEnrollModal} className="btn">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Enroll</button>
                                </div>
                            </form>
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
