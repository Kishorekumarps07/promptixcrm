'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Upload, FileText, Video, Image as ImageIcon, Save, X } from 'lucide-react';

interface Lesson {
    _id: string;
    title: string;
    description: string;
    order: number;
    status: 'Active' | 'Inactive';
}

interface Content {
    _id: string;
    title: string;
    description: string;
    fileType: string;
    fileUrl: string;
    lessonId?: string;
}

interface LessonManagerProps {
    courseId: string;
}

export default function LessonManager({ courseId }: LessonManagerProps) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    // Forms
    const [lessonForm, setLessonForm] = useState({ title: '', description: '' });

    // Upload State
    const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null); // If null, global/uncategorized upload? Or strictly per lesson?
    // Let's allow uploading to "General" (null) or specific lesson
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null as File | null });
    const [uploadProgress, setUploadProgress] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lessonsRes, contentRes] = await Promise.all([
                fetch(`/api/courses/${courseId}/lessons`),
                fetch(`/api/courses/${courseId}/content`)
            ]);

            const lessonsData = await lessonsRes.json();
            const contentData = await contentRes.json();

            if (lessonsData.lessons) setLessons(lessonsData.lessons);
            if (contentData.content) setContents(contentData.content);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Lesson Logic ---

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/courses/${courseId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lessonForm)
            });
            if (res.ok) {
                setLessonForm({ title: '', description: '' });
                setIsCreatingLesson(false);
                fetchData(); // Refresh to get new order
            }
        } catch (e) { console.error(e); }
    };

    const handleUpdateLesson = async (id: string, data: Partial<Lesson>) => {
        try {
            const res = await fetch(`/api/lessons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setEditingLessonId(null);
                fetchData();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteLesson = async (id: string) => {
        // if (!confirm("Delete this lesson? Associated content will be moved to 'Uncategorized'.")) return; // Removed Action Blocker
        try {
            const res = await fetch(`/api/lessons/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleMoveLesson = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === lessons.length - 1) return;

        const newLessons = [...lessons];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newLessons[index], newLessons[swapIndex]] = [newLessons[swapIndex], newLessons[index]];

        // Optimistic UI
        setLessons(newLessons);

        // API Call
        const orderedIds = newLessons.map(l => l._id);
        await fetch('/api/lessons/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedIds })
        });
    };

    // --- Content Upload Logic ---

    const startUpload = (lessonId: string | null) => {
        setUploadingLessonId(lessonId);
        setIsUploading(true);
        setUploadForm({ title: '', description: '', file: null });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadForm({ ...uploadForm, file: e.target.files[0] });
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.file) return alert("Please select a file");

        setUploadProgress(true);
        try {
            // 1. Sign
            const signRes = await fetch('/api/cloudinary/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: 'crm-courses' })
            });
            if (!signRes.ok) throw new Error("Failed to get signature");
            const { signature, timestamp, cloudName, apiKey } = await signRes.json();

            // 2. Upload
            const uploadData = new FormData();
            uploadData.append('file', uploadForm.file);
            uploadData.append('api_key', apiKey);
            uploadData.append('timestamp', timestamp);
            uploadData.append('signature', signature);
            uploadData.append('folder', 'crm-courses');

            let resourceType = 'auto';
            if (uploadForm.file.type.startsWith('image')) resourceType = 'image';
            else if (uploadForm.file.type.startsWith('video')) resourceType = 'video';
            else resourceType = 'raw';

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                method: 'POST',
                body: uploadData
            });

            if (!cloudRes.ok) throw new Error("Cloudinary upload failed");
            const cloudFile = await cloudRes.json();

            // 3. Save
            let dbFileType = 'docx';
            if (cloudFile.resource_type === 'image' || cloudFile.format === 'pdf') dbFileType = cloudFile.format === 'pdf' ? 'pdf' : 'image';
            if (cloudFile.resource_type === 'video') dbFileType = 'video';

            const saveRes = await fetch(`/api/courses/${courseId}/content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: uploadForm.title,
                    description: uploadForm.description,
                    fileType: dbFileType,
                    fileUrl: cloudFile.secure_url,
                    lessonId: uploadingLessonId // Pass lessonId!
                })
            });

            if (saveRes.ok) {
                setIsUploading(false);
                fetchData();
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploadProgress(false);
        }
    };

    const handleDeleteContent = async (id: string) => {
        // if (!confirm("Delete this file?")) return; // Removed Action Blocker
        await fetch(`/api/content/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4 text-blue-500" />;
            case 'image': return <ImageIcon className="w-4 h-4 text-purple-500" />;
            case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleMoveContent = async (contentId: string, newLessonId: string | null) => {
        try {
            const res = await fetch(`/api/content/${contentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: newLessonId })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div>Loading course structure...</div>;

    // Helper to filter content
    const getContentForLesson = (lessonId: string | null) => {
        if (lessonId === null) return contents.filter(c => !c.lessonId);
        return contents.filter(c => c.lessonId === lessonId);
    };



    const MoveContentDropdown = ({ contentId, currentLessonId }: { contentId: string, currentLessonId: string | null }) => (
        <select
            className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-gray-50 max-w-[100px] truncate"
            onChange={(e) => handleMoveContent(contentId, e.target.value === 'general' ? null : e.target.value)}
            value={currentLessonId || 'general'}
            onClick={e => e.stopPropagation()} // Prevent accordions from toggling if placed there
        >
            <option value="general">General</option>
            {lessons.map(l => (
                <option key={l._id} value={l._id}>{l.title}</option>
            ))}
        </select>
    );



    return (
        <div className="space-y-6">
            {/* Header / Add Lesson */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-700">Course Structure</h3>
                <button
                    onClick={() => setIsCreatingLesson(true)}
                    className="btn btn-sm btn-primary flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Lesson
                </button>
            </div>

            {/* Create Lesson Form */}
            {isCreatingLesson && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">New Lesson</h4>
                    <form onSubmit={handleCreateLesson} className="grid gap-3">
                        <input
                            placeholder="Lesson Title"
                            className="field-input text-sm"
                            value={lessonForm.title}
                            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description (Optional)"
                            className="field-input text-sm h-20" // Fixed height
                            value={lessonForm.description}
                            onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                        />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsCreatingLesson(false)} className="btn btn-sm btn-ghost">Cancel</button>
                            <button type="submit" className="btn btn-sm btn-primary">Create Lesson</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lessons List */}
            <div className="space-y-4">
                {lessons.map((lesson, index) => (
                    <div key={lesson._id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Lesson Header */}
                        <div className="bg-white p-3 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <button
                                        onClick={() => handleMoveLesson(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveLesson(index, 'down')}
                                        disabled={index === lessons.length - 1}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                                <div>
                                    {editingLessonId === lesson._id ? (
                                        <input
                                            defaultValue={lesson.title}
                                            className="px-2 py-1 border rounded text-sm"
                                            onBlur={(e) => handleUpdateLesson(lesson._id, { title: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateLesson(lesson._id, { title: (e.target as HTMLInputElement).value })}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-bold text-gray-800 ${lesson.status === 'Inactive' ? 'opacity-50' : ''}`}>
                                                {index + 1}. {lesson.title}
                                            </h4>
                                            <button
                                                onClick={() => handleUpdateLesson(lesson._id, { status: lesson.status === 'Active' ? 'Inactive' : 'Active' })}
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full border ${lesson.status === 'Active'
                                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}`}
                                                title="Toggle Status"
                                            >
                                                {lesson.status}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingLessonId(lesson._id)} className="p-1 text-gray-400 hover:text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteLesson(lesson._id)} className="p-1 text-gray-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lesson Content Area */}
                        <div className="bg-gray-50 p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lesson Material</span>
                                <button
                                    onClick={() => startUpload(lesson._id)}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add Content
                                </button>
                            </div>

                            <div className="space-y-2">
                                {getContentForLesson(lesson._id).length === 0 ? (
                                    <div className="text-xs text-center text-gray-400 italic py-2 border border-dashed border-gray-300 rounded">
                                        No content in this lesson
                                    </div>
                                ) : (
                                    getContentForLesson(lesson._id).map(content => (
                                        <div key={content._id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-sm">
                                            <div className="flex items-center gap-2">
                                                {getIcon(content.fileType)}
                                                <span className="text-gray-700 truncate max-w-[150px]">{content.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MoveContentDropdown contentId={content._id} currentLessonId={lesson._id} />
                                                <button
                                                    onClick={() => handleDeleteContent(content._id)}
                                                    className="text-gray-300 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Uncategorized Content */}
            <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">General / Uncategorized</h3>
                    <button
                        onClick={() => startUpload(null)}
                        className="btn btn-xs btn-outline"
                    >
                        <Plus className="w-3 h-3" /> Upload General
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {getContentForLesson(null).map(content => (
                        <div key={content._id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center gap-2">
                                {getIcon(content.fileType)}
                                <span className="text-gray-700">{content.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MoveContentDropdown contentId={content._id} currentLessonId={null} />
                                <button
                                    onClick={() => handleDeleteContent(content._id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {getContentForLesson(null).length === 0 && <p className="text-sm text-gray-500 italic">No uncategorized content.</p>}
                </div>
            </div>

            {/* Upload Modal (Nested or simple overlay) */}
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                        <h3 className="font-bold mb-4">Upload Content</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Uploading to: {uploadingLessonId ? lessons.find(l => l._id === uploadingLessonId)?.title : 'General'}
                        </p>
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <input
                                className="field-input"
                                placeholder="Title"
                                value={uploadForm.title}
                                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                                required
                            />
                            <input
                                className="field-input"
                                placeholder="Description"
                                value={uploadForm.description}
                                onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                            />
                            <input
                                type="file"
                                className="field-input"
                                onChange={handleFileChange}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsUploading(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" disabled={uploadProgress} className="btn btn-primary">
                                    {uploadProgress ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
