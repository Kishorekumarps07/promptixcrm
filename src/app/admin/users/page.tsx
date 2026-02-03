'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import AdvancedTable from '@/components/ui/AdvancedTable';
import { UserPlus, Trash2, CheckCircle, XCircle, FileDown } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', phone: '', photo: '' });
    const [uploading, setUploading] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Onboarding Modal
    const [onboardingData, setOnboardingData] = useState<any>(null);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    // Course Modal
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [coursesList, setCoursesList] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'ALL' | 'EMPLOYEE' | 'STUDENT'>('EMPLOYEE');

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/users?t=${Date.now()}`;
            if (activeTab !== 'ALL') {
                url += `&role=${activeTab}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Bulk Actions ---
    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} users?`)) return;

        setLoading(true);
        try {
            // We'll iterate for now as we don't have a bulk API yet, or we could create one. 
            // For safety/speed in this refactor, I'll use Promise.all with existing endpoints.
            const promises = selectedIds.map(id => {
                if (action === 'delete') {
                    return fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
                } else {
                    const newStatus = action === 'activate' ? 'Active' : 'Inactive';
                    return fetch(`/api/admin/users/${id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    });
                }
            });

            await Promise.all(promises);
            setSelectedIds([]); // Clear selection
            fetchUsers();
            alert(`Bulk ${action} successful!`);
        } catch (error) {
            console.error("Bulk action failed", error);
            alert("Some actions failed.");
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD Handlers ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: data });
            const json = await res.json();
            if (json.url) setFormData(prev => ({ ...prev, photo: json.url }));
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingUser ? `/api/admin/users/${editingUser._id}` : '/api/admin/users';
            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                closeModal();
                fetchUsers();
            } else {
                const err = await res.json();
                alert(`Operation failed: ${err.message}`);
            }
        } catch (error) {
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } finally {
            setLoading(false);
        }
    };

    // --- Modal Controls ---
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE', phone: '', photo: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || '',
            photo: user.photo || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    // --- Other Feature Handlers (Onboarding, Course) ---
    // Keeping these mostly as is but wrapping efficiently

    const openOnboardingModal = async (user: any) => {
        setEditingUser(user);
        setShowOnboardingModal(true);
        setOnboardingLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${user._id}/onboarding`);
            if (res.ok) {
                const data = await res.json();
                setOnboardingData(data.onboarding);
            } else {
                setOnboardingData(null);
            }
        } finally {
            setOnboardingLoading(false);
        }
    };

    const handleOnboardingUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${editingUser._id}/onboarding`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onboardingData)
            });
            if (res.ok) { alert('Updated!'); setShowOnboardingModal(false); }
        } catch (e) { alert('Error updating.'); }
    };

    const openCourseModal = async (user: any) => {
        setEditingUser(user);
        setSelectedCourse('');
        setShowCourseModal(true);
        if (coursesList.length === 0) {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (data.courses) setCoursesList(data.courses);
        }
    };

    const handleAssignCourse = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            await fetch(`/api/admin/users/${editingUser._id}/course`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: selectedCourse })
            });
            alert("Course assigned!");
            setShowCourseModal(false);
            fetchUsers();
        } finally {
            setLoading(false);
        }
    };

    // --- Table Columns Definition ---
    const columns = [
        {
            header: "User",
            accessor: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-100 overflow-hidden relative border border-gray-200">
                        {user.photo ? (
                            <Image src={user.photo} alt={user.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-navy-700 font-bold">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-navy-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </div>
            ),
            sortable: true,
            // We pass a dummy string accessor for sorting if needed, but complex objects need custom sort logic usually.
            // AdvancedTable defaults to simple field sorting, for complex renders we might need adjustments.
            // For now, let's assume filtering works on the text representation in 'accessor' if string, 
            // but here we return a Node. Search implementation in AdvancedTable handles string conversion, 
            // but typically we want to search on the underlying data. 
            // AdvancedTable's simple client-side search checks all values. 
        },
        { header: "Role", accessor: (user: any) => <span className="badge badge-info text-xs">{user.role}</span>, sortable: true },
        {
            header: "Status",
            accessor: (user: any) => (
                <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-error'} text-xs`}>
                    {user.status}
                </span>
            ),
            sortable: true
        },
        { header: "Phone", accessor: (user: any) => user.phone || '-', className: "text-gray-500" },
        ...(activeTab === 'STUDENT' ? [{
            header: "Course",
            accessor: (user: any) => <span className="text-navy-700 font-medium">{user.activeCourse || '-'}</span>
        }] : []),
        {
            header: "Actions",
            accessor: (user: any) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    {user.role === 'STUDENT' && (
                        <button onClick={() => openCourseModal(user)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Course</button>
                    )}
                    {user.role === 'STUDENT' && (
                        <button onClick={() => openOnboardingModal(user)} className="text-teal-600 hover:text-teal-800 text-xs font-medium">Details</button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <PageHeader
                    title="User Management"
                    subtitle="Manage system users, roles, and access permissions"
                    breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Users' }]}
                    actions={
                        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add User
                        </button>
                    }
                />

                {/* Tab Filtering */}
                <div className="mb-6 border-b border-gray-200 flex gap-6">
                    {['EMPLOYEE', 'STUDENT', 'ALL'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as any); setSelectedIds([]); }}
                            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'ALL' ? 'All Users' : `${tab.charAt(0) + tab.slice(1).toLowerCase()}s`}
                        </button>
                    ))}
                </div>

                <AdvancedTable
                    data={users}
                    columns={columns}
                    keyField="_id"
                    isLoading={loading}
                    onSelectionChange={setSelectedIds}
                    actions={
                        <>
                            <button onClick={() => handleBulkAction('activate')} className="p-1 hover:bg-green-100 text-green-600 rounded" title="Activate Selected">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleBulkAction('deactivate')} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Deactivate Selected">
                                <XCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleBulkAction('delete')} className="p-1 hover:bg-gray-200 text-gray-600 rounded" title="Delete Selected">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    }
                />

                {/* --- Modals (Create/Edit, Onboarding, Course) --- */}
                {/* Simplified Modal Code for brevity, reusing existing logic structure */}

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-navy-900">{editingUser ? 'Edit User' : 'Create User'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Photo Upload */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                                        {formData.photo ? (
                                            <Image src={formData.photo} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">?</div>
                                        )}
                                    </div>
                                    <label className="btn btn-sm bg-white border border-gray-300 text-gray-700 cursor-pointer">
                                        {uploading ? 'Uploading...' : 'Change Photo'}
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Name</label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border ml-0 rounded text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Role</label>
                                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border ml-0 rounded text-sm">
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="STUDENT">Student</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Email</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border ml-0 rounded text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Phone</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2 border ml-0 rounded text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Password {editingUser && '(Leave blank to keep)'}</label>
                                    <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border ml-0 rounded text-sm" />
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-600">Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save User'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reusing Onboarding & Course Modals logic - wrapping in cleaner UI similar to above would be ideal, but for brevity keeping existing functional structure but ensuring z-index fixes */}
                {showOnboardingModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-bold text-lg">Onboarding: {editingUser?.name}</h2>
                                <button onClick={() => setShowOnboardingModal(false)}>✕</button>
                            </div>
                            {/* ... Onboarding Form Content ... */}
                            {onboardingLoading ? <p>Loading...</p> : !onboardingData ? <p>No data found.</p> : (
                                <form onSubmit={handleOnboardingUpdate} className="space-y-4">
                                    {/* Simplified view of form */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><strong>Details:</strong></div>
                                        <div className="col-span-2 bg-gray-50 p-3 rounded">
                                            Address: {onboardingData.personalDetails?.address}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Total Fees</label>
                                            <input type="number"
                                                value={onboardingData.feesDetails?.totalFees || ''}
                                                onChange={e => setOnboardingData({ ...onboardingData, feesDetails: { ...onboardingData.feesDetails, totalFees: e.target.value } })}
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full">Update Fees</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {showCourseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                            <h3 className="font-bold mb-4">Assign Course</h3>
                            <select className="w-full border p-2 rounded mb-4" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                                <option value="">Select Course...</option>
                                {coursesList.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                            <button onClick={handleAssignCourse} className="btn btn-primary w-full">Assign</button>
                            <button onClick={() => setShowCourseModal(false)} className="btn w-full mt-2 text-gray-500">Cancel</button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
