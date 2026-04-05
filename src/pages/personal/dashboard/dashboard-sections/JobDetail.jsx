import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Banknote, Bookmark, Check, Loader2 } from 'lucide-react';
import jobService from '../../../../services/jobService';

const JobDetail = ({ job: propJob, onBack, onApplyClick }) => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [fetchedJob, setFetchedJob] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showAppliedModal, setShowAppliedModal] = useState(false);

    useEffect(() => {
        if (!propJob && jobId) {
            const fetchJobDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await jobService.getProfessionalJobById(jobId);
                    if (response?.status === 'success' && response.data?.job) {
                        const apiJob = response.data.job;
                        setFetchedJob({
                            id: apiJob.id,
                            title: apiJob.title,
                            company: apiJob.recruiter?.organizationName || 'MaritimeLink Admin',
                            location: apiJob.location || 'Global',
                            salary: apiJob.salary,
                            category: apiJob.category,
                            jobType: apiJob.contractType,
                            datePosted: new Date(apiJob.createdAt),
                            jobDescription: apiJob.description,
                            aboutCompany: `Information about ${apiJob.recruiter?.organizationName || 'MaritimeLink Admin'}.`,
                            whatWeLookFor: 'We are looking for dedicated professionals to join our team.',
                            responsibilities: apiJob.description ? apiJob.description.split('\n').filter(line => line.trim() !== '') : []
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch standalone job info:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchJobDetails();
        }
    }, [propJob, jobId]);

    const job = propJob || fetchedJob;

    const handleApply = () => {
        if (onApplyClick) {
            setApplied(true);
            setShowAppliedModal(true);
            setTimeout(() => setShowAppliedModal(false), 2000);
            onApplyClick(job);
        } else {
            navigate(`/personal/jobs/apply/${job.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-4 text-[#003971]" />
                <p>Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={onBack || (() => navigate(-1))}
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
                                    onClick={async () => {
                                        try {
                                            await jobService.saveJob(job.id);
                                            setSaved(!saved);
                                        } catch (e) {
                                            console.error("Failed to save job");
                                        }
                                    }}
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
