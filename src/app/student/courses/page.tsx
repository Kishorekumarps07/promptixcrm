'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ChevronDown, ChevronRight, FileText, Video, Image as ImageIcon } from 'lucide-react';

export default function StudentCourses() {
    const [myCourses, setMyCourses] = useState<any[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/student/courses').then(res => res.json()),
            fetch('/api/courses').then(res => res.json())
        ]).then(([myCoursesData, allCoursesData]) => {
            if (myCoursesData.enrollments) setMyCourses(myCoursesData.enrollments);
            if (allCoursesData.courses) setAllCourses(allCoursesData.courses);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const enrolledCourseIds = new Set(myCourses.map(e => e.courseId?._id));
    const availableCourses = allCourses.filter(c => !enrolledCourseIds.has(c._id) && c.status === 'Active');

    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data for Modal
    const [lessons, setLessons] = useState<any[]>([]);
    const [courseContent, setCourseContent] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

    const openModal = async (course: any) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
        setLessons([]);
        setCourseContent([]);
        setExpandedLessons(new Set());

        const isEnrolled = myCourses.some(e => e.courseId._id === course._id);

        if (isEnrolled) {
            setLoadingDetails(true);
            try {
                // Fetch Lessons and Content
                // Note: Students need a route to fetch lessons. Since lessons are public structure usually, 
                // we can reuse the generic GET /api/courses/[id]/lessons if authorized, 
                // OR we need to update that API to allow students.
                // Re-checking my API implementation: 
                // GET /api/courses/[id]/lessons checks user role. If logic was "Admin/Emp only", students get 401.
                // I need to start by allowing students to GET lessons. 
                // *Self-correction*: I should update the API to allow students if enrolled.
                // For now, let's assume I fix the API or used the generic one.
                // Actually, let's try fetching. if 401, I missed a spot.
                // The API /api/courses/[id]/lessons currently returns 401 for non-User, but inside it checks if (userInfo).
                // It does NOT explicitly block students in my implementation above (Line 25: if (!userInfo) return 401). 
                // It does NOT have the role check "if role !== ADMIN..." for GET. 
                // So Students CAN fetch lessons! Good.

                const [siteLessons, siteContent] = await Promise.all([
                    fetch(`/api/student/courses/${course._id}/lessons`).then(res => res.json()),
                    fetch(`/api/student/courses/${course._id}/content`).then(res => res.json())
                ]);

                if (siteLessons.lessons) {
                    setLessons(siteLessons.lessons);
                    // Expand all by default? Or first one? Let's expand all for visibility.
                    setExpandedLessons(new Set(siteLessons.lessons.map((l: any) => l._id)));
                }
                if (siteContent.content) setCourseContent(siteContent.content);

            } catch (e) {
                console.error(e);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const toggleLesson = (id: string) => {
        const newSet = new Set(expandedLessons);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedLessons(newSet);
    };

    const getContentForLesson = (lessonId: string | null) => {
        if (lessonId === null) return courseContent.filter(c => !c.lessonId);
        return courseContent.filter(c => c.lessonId === lessonId);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4 text-blue-500" />;
            case 'image': return <ImageIcon className="w-4 h-4 text-purple-500" />;
            case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">My Learning</h1>
                </header>

                {loading ? <p>Loading courses...</p> : (
                    <>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
                                🎓 Enrolled Courses
                            </h2>
                            {myCourses.length === 0 ? (
                                <p className="text-gray-500 italic">You are not enrolled in any courses yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myCourses.map((enrollment: any) => {
                                        if (!enrollment.courseId) {
                                            return (
                                                <div key={enrollment._id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-center text-gray-400 italic">
                                                    Course content unavailable
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={enrollment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                                <div className="p-6 flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="badge badge-info">{enrollment.courseId.category || 'General'}</span>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${enrollment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {enrollment.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-navy-900 mb-2">{enrollment.courseId.title}</h3>
                                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{enrollment.courseId.description}</p>
                                                    <div className="text-xs text-gray-400">
                                                        Duration: {enrollment.courseId.duration}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                                                    <button onClick={() => openModal(enrollment.courseId)} className="text-blue-600 text-sm font-semibold hover:text-blue-800 w-full text-left">
                                                        View Details →
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}

                                </div>
                            )
                            }
                        </section >

                        <section>
                            <h2 className="text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
                                📚 Available Courses
                            </h2>
                            {availableCourses.length === 0 ? (
                                <p className="text-gray-500 italic">No other courses available at the moment.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableCourses.map((course: any) => (
                                        <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75 hover:opacity-100 transition-opacity">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="badge badge-info mb-2 inline-block">{course.category}</span>
                                                <button onClick={() => openModal(course)} className="text-xs text-blue-600 hover:underline">Details</button>
                                            </div>
                                            <h3 className="text-lg font-bold text-navy-900 mb-2">{course.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                                            <p className="text-xs text-gray-500 mb-4">Duration: {course.duration}</p>
                                            <div className="text-xs text-gray-400 italic">
                                                Contact admin to enroll.
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* Course Details Modal */}
                {
                    isModalOpen && selectedCourse && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                {/* Modal Header */}
                                <div className="flex justify-between items-start p-6 border-b bg-white sticky top-0 z-10 rounded-t-lg">
                                    <div>
                                        <span className="badge badge-info mb-2 inline-block">{selectedCourse.category}</span>
                                        <h2 className="text-2xl font-bold text-navy-900">{selectedCourse.title}</h2>
                                        <p className="text-gray-500 text-sm mt-1">{selectedCourse.description}</p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2"><span className="text-xl">✕</span></button>
                                </div>

                                {/* Modal Content - Scrollable */}
                                <div className="p-6 overflow-y-auto flex-1">
                                    {loadingDetails ? (
                                        <div className="flex justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {courseContent.length === 0 && lessons.length === 0 ? (
                                                <p className="text-center text-gray-500 italic py-8">
                                                    No content available for this course yet.
                                                </p>
                                            ) : (
                                                <>
                                                    {/* Lessons List */}
                                                    <div className="space-y-4">
                                                        {lessons.map((lesson) => (
                                                            <div key={lesson._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                                <button
                                                                    onClick={() => toggleLesson(lesson._id)}
                                                                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {expandedLessons.has(lesson._id) ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                                                        <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                                                                    </div>
                                                                    {lesson.description && <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[200px]">{lesson.description}</span>}
                                                                </button>

                                                                {expandedLessons.has(lesson._id) && (
                                                                    <div className="p-4 bg-white border-t border-gray-100">
                                                                        <div className="space-y-2">
                                                                            {getContentForLesson(lesson._id).length === 0 ? (
                                                                                <p className="text-xs text-gray-400 italic">No content in this lesson.</p>
                                                                            ) : (
                                                                                getContentForLesson(lesson._id).map(content => (
                                                                                    <div key={content._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-gray-100 transition-colors">
                                                                                        <div className="flex items-center gap-3">
                                                                                            {getIcon(content.fileType)}
                                                                                            <div>
                                                                                                <h4 className="font-medium text-gray-800 text-sm">{content.title}</h4>
                                                                                                {content.description && <p className="text-xs text-gray-500">{content.description}</p>}
                                                                                            </div>
                                                                                        </div>
                                                                                        <a
                                                                                            href={content.fileUrl}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="text-blue-600 text-xs font-semibold hover:underline"
                                                                                        >
                                                                                            {content.fileType === 'video' || content.fileType === 'image' ? 'View' : 'Download'}
                                                                                        </a>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Uncategorized Content */}
                                                    {getContentForLesson(null).length > 0 && (
                                                        <div className="mt-8">
                                                            <h3 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2">
                                                                📂 General Resources
                                                            </h3>
                                                            <div className="grid gap-3">
                                                                {getContentForLesson(null).map((content) => (
                                                                    <div key={content._id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                                        <div className="flex items-center gap-3">
                                                                            {getIcon(content.fileType)}
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-800 text-sm">{content.title}</h4>
                                                                                {content.description && <p className="text-xs text-gray-500">{content.description}</p>}
                                                                            </div>
                                                                        </div>
                                                                        <a
                                                                            href={content.fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 text-sm hover:underline font-medium"
                                                                        >
                                                                            {content.fileType === 'video' || content.fileType === 'image' ? 'View' : 'Download'}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end">
                                    <button onClick={closeModal} className="btn">Close</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
