import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2 } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const ApplyToJob = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [selectedResume, setSelectedResume] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Sample job data
    const jobs = {
        '1': {
            id: 1,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            salary: 'GBP 50000',
            location: 'London',
            type: 'Full Time'
        },
        '2': {
            id: 2,
            title: 'Marine Engineer',
            company: 'Ocean Dynamics Ltd',
            salary: 'GBP 45000',
            location: 'Southampton',
            type: 'Full Time'
        },
        '3': {
            id: 3,
            title: 'Deck Officer',
            company: 'Maritime Solutions',
            salary: 'GBP 55000',
            location: 'Liverpool',
            type: 'Contract'
        },
        '4': {
            id: 4,
            title: 'Chief Engineer',
            company: 'Seafarers International',
            salary: 'GBP 65000',
            location: 'Glasgow',
            type: 'Full Time'
        },
        '5': {
            id: 5,
            title: 'Navigation Officer',
            company: 'Global Maritime Group',
            salary: 'GBP 48000',
            location: 'London',
            type: 'Full Time'
        }
    };

    const job = jobs[jobId] || jobs['1'];

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
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/personal/jobs');
            }, 2000);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 sm:p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            </div>

            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 h-auto sm:h-[80vh] max-h-screen flex flex-col overflow-y-auto">
                {/* Back Button and Title */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/personal/jobs')}
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
                                    {job.title}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Building2 size={14} />
                                    <span>{job.company}</span>
                                </div>
                                <div className="text-sm text-gray-800 font-medium">
                                    {job.salary}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#003971] text-sm">
                                <MapPin size={14} />
                                <span>{job.location}</span>
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
                                    ? 'border-[#003971] bg-[#003971]/5'
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
                                            <div className="w-6 h-6 bg-[#003971] rounded-full flex items-center justify-center">
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
                        ? 'bg-[#003971] hover:bg-[#003971]/90'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Apply
                </button>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Applied Successfully!</h3>
                        <p className="text-gray-600">Your application has been submitted.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplyToJob;
