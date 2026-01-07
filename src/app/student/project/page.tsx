'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function StudentProject() {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/project')
            .then(res => res.json())
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-8 flex-1">
                <p className="text-gray-500">Loading project details...</p>
            </main>
        </div>
    );

    const hasProject = project && project.title;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <Sidebar />
            <main className="md:ml-64 p-4 md:p-8 flex-1">
                <header className="page-header mb-8">
                    <h1 className="text-3xl font-bold text-navy-900">Project Tracking</h1>
                    <p className="text-gray-500">Track your internship project progress.</p>
                </header>

                {hasProject ? (
                    <div className="max-w-4xl space-y-6">
                        {/* Project Card */}
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-xs font-bold tracking-wider text-primary-orange uppercase mb-2 block">Current Project</span>
                                        <h2 className="text-3xl font-bold text-navy-900">{project.title}</h2>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {project.status || 'Not Started'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Assigned Mentor</h3>
                                        {project.mentor ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-900 font-bold">
                                                    {project.mentor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-navy-900">{project.mentor.name}</div>
                                                    <div className="text-sm text-gray-500">{project.mentor.email}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">No mentor assigned</p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Feedback & Remarks</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[80px]">
                                            {project.remarks ? (
                                                <p>{project.remarks}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">No remarks yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            📂
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Project Assigned</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            You haven't been assigned a project yet. Please check back later or contact your mentor.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
