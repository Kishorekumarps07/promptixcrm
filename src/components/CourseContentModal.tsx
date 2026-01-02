'use client';

import { X } from 'lucide-react';
import LessonManager from './LessonManager';

interface CourseContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
}

export default function CourseContentModal({ isOpen, onClose, courseId, courseTitle }: CourseContentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
                    <h2 className="text-xl font-bold">Manage Content: {courseTitle}</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button>
                </div>

                <div className="pb-6">
                    <LessonManager courseId={courseId} />
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                    <button onClick={onClose} className="btn">Close</button>
                </div>
            </div>
        </div>
    );
}
