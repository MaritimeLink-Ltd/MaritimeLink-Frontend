import React, { useState } from 'react';
import { ArrowLeft, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import logo from '../../../../assets/logo.png';

const ApplyToJob = ({ job, onBack }) => {
    const [selectedResume, setSelectedResume] = useState(null);

    // Sample resume data
    const resumes = [
        {
            id: 1,
            title: 'My CV 2026',
            createdDate: 'Created 12 Dec 2025',
            thumbnail: 'https://placehold.co/300x400/f3f4f6/a3a3a3?text=CV+2026'
        }
    ];

    const handleApply = () => {
        if (selectedResume) {
            // Handle job application submission
            console.log('Applying with resume:', selectedResume);
            alert('Application submitted successfully!');
            onBack();
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 sm:p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <img src={logo} alt="Maritime Link Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            </div>

            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 h-auto sm:h-[80vh] max-h-screen flex flex-col overflow-y-auto">
                {/* Back Button and Title */}
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors min-h-[44px]"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-medium">Apply To Job</span>
                    </button>

                    {/* Job Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                    {job?.title || 'Senior Seafarer'}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Building2 size={14} />
                                    <span>{job?.company || 'ABC Company'}</span>
                                </div>
                                <div className="text-sm text-gray-800 font-medium">
                                    {job?.salary || 'GBP 50000'}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 text-sm">
                                <MapPin size={14} />
                                <span>{job?.location || 'London'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Select Resume Section */}
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Select Resume</h3>

                    {/* Resume Cards */}
                    <div className="space-y-3">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                onClick={() => setSelectedResume(resume)}
                                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedResume?.id === resume.id
                                    ? 'border-blue-900 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Resume Thumbnail */}
                                    <div className="shrink-0">
                                        <img
                                            src={resume.thumbnail}
                                            alt={resume.title}
                                            className="w-24 h-32 object-cover rounded border border-gray-200"
                                        />
                                    </div>

                                    {/* Resume Info */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-base font-semibold text-gray-800 mb-1">
                                            {resume.title}
                                        </h4>
                                        <p className="text-sm text-gray-500">{resume.createdDate}</p>
                                    </div>

                                    {/* Checkmark */}
                                    {selectedResume?.id === resume.id && (
                                        <div className="absolute top-4 right-4">
                                            <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                                                <CheckCircle2 size={16} className="text-white" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Apply Button */}
                <button
                    onClick={handleApply}
                    disabled={!selectedResume}
                    className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] ${selectedResume
                        ? 'bg-blue-900 hover:bg-blue-800'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Apply
                </button>
            </div>
        </div>
    );
};

export default ApplyToJob;
