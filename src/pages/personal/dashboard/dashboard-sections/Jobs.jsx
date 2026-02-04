import React, { useState } from 'react';
import { MapPin, Building2, Banknote, Bookmark, SlidersHorizontal, Briefcase, Check, X, ArrowLeft } from 'lucide-react';

const Jobs = ({ onApplyClick, onMyJobsClick }) => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [showFilter, setShowFilter] = useState(false);
    const [showAppliedModal, setShowAppliedModal] = useState(false);
    const [filters, setFilters] = useState({
        category: null,
        datePosted: null,
        jobType: null
    });
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [isFilterActive, setIsFilterActive] = useState(false);

    // Sample job data
    const jobs = [
        {
            id: 1,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
            aboutCompany: 'We are a reputable maritime organization operating international vessels with a strong commitment to safety, compliance, and operational excellence. We are currently seeking a qualified Deck Officer to join our fleet and support safe navigation and deck operations.',
            whatWeLookFor: 'We value professionalism, discipline, and a strong safety mindset. The ideal candidate demonstrates good seamanship, effective communication, and the ability to work efficiently within a multinational crew.',
            responsibilities: [
                'Navigate and operate vessel safely',
                'Maintain deck equipment and systems',
                'Ensure compliance with maritime regulations',
                'Coordinate with crew members effectively'
            ]
        },
        {
            id: 2,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
            aboutCompany: 'We are a reputable maritime organization operating international vessels with a strong commitment to safety, compliance, and operational excellence.',
            whatWeLookFor: 'We value professionalism, discipline, and a strong safety mindset.',
            responsibilities: []
        },
        {
            id: 3,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
            aboutCompany: 'We are a reputable maritime organization operating international vessels.',
            whatWeLookFor: 'We value professionalism and discipline.',
            responsibilities: []
        },
        {
            id: 4,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
            aboutCompany: 'We are a reputable maritime organization.',
            whatWeLookFor: 'We value professionalism.',
            responsibilities: []
        },
        {
            id: 5,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom',
            aboutCompany: 'Maritime organization.',
            whatWeLookFor: 'Professional candidates.',
            responsibilities: []
        },
        {
            id: 6,
            title: 'Senior Seafarer',
            company: 'ABC Company',
            location: 'London',
            salary: 'GBP 50000',
            category: 'Officer',
            jobType: 'Contract',
            jobDescription: 'On-site Job: United Kingdom',
            aboutCompany: 'Maritime organization.',
            whatWeLookFor: 'Professional candidates.',
            responsibilities: []
        }
    ];

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Jobs for you</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Jobs based on your resume</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={onMyJobsClick}
                            className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-800 transition-colors min-h-[44px] flex-1 sm:flex-initial"
                        >
                            <Briefcase size={18} />
                            My Jobs
                        </button>
                        <button
                            onClick={() => {
                                if (isFilterActive) {
                                    setFilters({ category: null, datePosted: null, jobType: null });
                                    setTempFilters({ category: null, datePosted: null, jobType: null });
                                    setIsFilterActive(false);
                                } else {
                                    setShowFilter(true);
                                }
                            }}
                            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] flex-1 sm:flex-initial ${isFilterActive
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-blue-900 text-white hover:bg-blue-800'
                                }`}
                        >
                            {isFilterActive ? <X size={18} /> : <SlidersHorizontal size={18} />}
                            {isFilterActive ? 'Remove Filter' : 'Filter'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Job List - Left Sidebar - Hidden on mobile when job detail is open */}
                <div className={`${selectedJob && 'hidden lg:block'} w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide`}>
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedJob?.id === job.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="mb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">{job.title}</h3>
                                    <div className="flex items-center gap-1 text-[#003971] text-sm">
                                        <MapPin size={14} />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <Building2 size={14} />
                                    <span>{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                    <span>{job.salary}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Job Detail - Right Side - Full width on mobile when job is selected */}
                <div className={`${!selectedJob && 'hidden lg:flex'} flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide`}>
                    {selectedJob ? (
                        <div className="px-4 sm:px-8 py-4 sm:py-6">
                            {/* Job Header */}
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                                    <div className="flex items-center gap-2 sm:gap-0">
                                        <button
                                            onClick={() => setSelectedJob(null)}
                                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                                        >
                                            <ArrowLeft size={20} className="text-gray-700" />
                                        </button>
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{selectedJob.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                        {appliedJobs.has(selectedJob.id) ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 rounded-full text-sm font-medium cursor-default"
                                            >
                                                <Check size={18} />
                                                Applied
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    onApplyClick(selectedJob);
                                                    setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
                                                    setShowAppliedModal(true);
                                                    setTimeout(() => setShowAppliedModal(false), 2000);
                                                }}
                                                className="px-6 py-2.5 bg-[#003971] text-white rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setSavedJobs(prev => {
                                                    const newSaved = new Set(prev);
                                                    if (newSaved.has(selectedJob.id)) {
                                                        newSaved.delete(selectedJob.id);
                                                    } else {
                                                        newSaved.add(selectedJob.id);
                                                    }
                                                    return newSaved;
                                                });
                                            }}
                                            className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-full text-sm font-medium transition-colors ${
                                                savedJobs.has(selectedJob.id)
                                                    ? 'bg-[#003971] border-[#003971] text-white'
                                                    : 'border-[#003971] text-[#003971] hover:bg-blue-50'
                                            }`}
                                        >
                                            <Bookmark size={16} fill={savedJobs.has(selectedJob.id) ? 'white' : 'none'} />
                                            {savedJobs.has(selectedJob.id) ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building2 size={18} className="text-gray-400" />
                                        <span className="text-base">{selectedJob.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin size={18} className="text-gray-400" />
                                        <span className="text-base">{selectedJob.location}, United Kingdom</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Banknote size={18} className="text-gray-400" />
                                        <span className="text-base font-medium">{selectedJob.salary}</span>
                                    </div>
                                </div>

                                {/* Category and Job Type */}
                                <div className="flex items-center gap-6 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Category</p>
                                        <p className="text-base font-medium text-gray-800">{selectedJob.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Job Type</p>
                                        <p className="text-base font-medium text-gray-800">{selectedJob.jobType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                                <p className="text-gray-600 leading-relaxed">{selectedJob.jobDescription}</p>
                            </div>

                            {/* About the Company */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">About the Company</h3>
                                <p className="text-gray-600 leading-relaxed">{selectedJob.aboutCompany}</p>
                            </div>

                            {/* What We Look For */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">What We Look For</h3>
                                <p className="text-gray-600 leading-relaxed">{selectedJob.whatWeLookFor}</p>
                            </div>

                            {/* Responsibilities */}
                            {selectedJob.responsibilities.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Responsibilities</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                                        {selectedJob.responsibilities.map((resp, index) => (
                                            <li key={index}>{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        // No job selected
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Briefcase size={64} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                                <p className="text-gray-400 text-lg">Select a job to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Modal */}
            {showFilter && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => {
                            setShowFilter(false);
                            setTempFilters({ ...filters });
                        }}
                    />

                    {/* Filter Panel */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Filter Jobs</h2>
                                <button
                                    onClick={() => {
                                        setShowFilter(false);
                                        setTempFilters({ ...filters });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Category</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Officer', 'Ratings and Crew', 'Catering and Medical'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setTempFilters({ ...tempFilters, category: cat })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tempFilters.category === cat
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Posted Filter */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Date Posted</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Last 24 hours', 'Last 7 days', 'Last 30 days'].map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setTempFilters({ ...tempFilters, datePosted: date })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tempFilters.datePosted === date
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job Type Filter */}
                            <div className="mb-8">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Job Type</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Temporary', 'Contract', 'Permanent'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setTempFilters({ ...tempFilters, jobType: type })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tempFilters.jobType === type
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Filter Button */}
                            <button
                                onClick={() => {
                                    setFilters({ ...tempFilters });
                                    setIsFilterActive(
                                        tempFilters.category || tempFilters.datePosted || tempFilters.jobType
                                    );
                                    setShowFilter(false);
                                }}
                                className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Applied Successfully Modal */}
            {showAppliedModal && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                        {/* Modal */}
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Applied Successfully!</h3>
                            <p className="text-gray-600">Your application has been submitted.</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Jobs;
