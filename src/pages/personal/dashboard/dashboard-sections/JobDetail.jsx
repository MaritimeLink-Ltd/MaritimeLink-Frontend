import React, { useState } from 'react';
import { ArrowLeft, MapPin, Building2, Banknote, Bookmark, Check } from 'lucide-react';

const JobDetail = ({ job, onBack, onApplyClick }) => {
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showAppliedModal, setShowAppliedModal] = useState(false);

    const handleApply = () => {
        setApplied(true);
        setShowAppliedModal(true);
        setTimeout(() => setShowAppliedModal(false), 2000);
        if (onApplyClick) {
            onApplyClick(job);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Job Details</h1>
                </div>
            </div>

            {/* Job Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-8 py-4 sm:py-6">
                    {/* Job Header */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                            <div className="flex-1">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{job.title}</h2>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                {applied ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-full text-sm font-medium cursor-default"
                                    >
                                        <Check size={18} />
                                        Applied
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2.5 bg-[#003971] text-white rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors"
                                    >
                                        Apply Now
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSaved(!saved)}
                                    className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-full text-sm font-medium transition-colors ${
                                        saved
                                            ? 'bg-[#003971] border-[#003971] text-white'
                                            : 'border-[#003971] text-[#003971] hover:bg-blue-50'
                                    }`}
                                >
                                    <Bookmark size={16} fill={saved ? 'white' : 'none'} />
                                    {saved ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="space-y-2 mb-5">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Building2 size={18} className="text-gray-400" />
                                <span className="text-base">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={18} className="text-gray-400" />
                                <span className="text-base">{job.location}, United Kingdom</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Banknote size={18} className="text-gray-400" />
                                <span className="text-base font-medium">{job.salary}</span>
                            </div>
                        </div>

                        {/* Category and Job Type */}
                        <div className="flex items-center gap-6 mb-6">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Category</p>
                                <p className="text-base font-medium text-gray-800">{job.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Job Type</p>
                                <p className="text-base font-medium text-gray-800">{job.jobType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                        <p className="text-gray-600 leading-relaxed">{job.jobDescription}</p>
                    </div>

                    {/* About the Company */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">About the Company</h3>
                        <p className="text-gray-600 leading-relaxed">{job.aboutCompany}</p>
                    </div>

                    {/* What We Look For */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">What We Look For</h3>
                        <p className="text-gray-600 leading-relaxed">{job.whatWeLookFor}</p>
                    </div>

                    {/* Responsibilities */}
                    {job.responsibilities && job.responsibilities.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Responsibilities</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                                {job.responsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Applied Successfully Modal */}
            {showAppliedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Applied Successfully!</h3>
                        <p className="text-gray-600">Your application has been submitted.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetail;
