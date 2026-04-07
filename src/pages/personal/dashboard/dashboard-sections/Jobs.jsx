import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Banknote, Bookmark, SlidersHorizontal, Briefcase, Check, X, ArrowLeft, Search, Loader2 } from 'lucide-react';
import jobService from '../../../../services/jobService';

const Jobs = () => {
    const navigate = useNavigate();


    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [showFilter, setShowFilter] = useState(false);
    const [showAppliedModal, setShowAppliedModal] = useState(false);
    const [filters, setFilters] = useState({
        category: null,
        role: null,
        datePosted: null,
        jobType: null
    });
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const categoryRoles = {
        'Deck Officer': ['Master', 'Chief Officer', 'Second Officer', 'Third Officer', 'Deck Cadet'],
        'Engine Officer': ['Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer', 'Engine Cadet', 'Electrical Engineer'],
        'Deck Ratings': ['Bosun', 'Able Seaman', 'Ordinary Seaman', 'Pumpman', 'Fitter'],
        'Engine Ratings': ['Motorman', 'Oiler', 'Wiper', 'Fitter'],
        'Catering': ['Chief Cook', 'Second Cook', 'Messman', 'Steward'],
        'Medical': ['Doctor', 'Nurse', 'Medic']
    };

    // Sample job data
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const handleJobClick = async (job) => {
        setSelectedJob(job);
        setIsDetailLoading(true);
        try {
            const response = await jobService.getProfessionalJobById(job.id);
            if (response.status === 'success' && response.data?.job) {
                const apiJob = response.data.job;
                setSelectedJob({
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
            console.error("Failed to fetch detailed job info:", error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const [jobsRes, appsRes] = await Promise.all([
                    jobService.getProfessionalJobs().catch(() => null),
                    jobService.getApplications().catch(() => null)
                ]);

                let appliedSet = new Set();
                if (appsRes?.status === 'success' && appsRes.data?.applications) {
                    const appliedIds = appsRes.data.applications.map(app => app.jobId);
                    appliedSet = new Set(appliedIds);
                    setAppliedJobs(appliedSet);
                }

                if (jobsRes?.status === 'success' && jobsRes.data?.jobs) {
                    const mappedJobs = jobsRes.data.jobs
                        .filter(apiJob => !appliedSet.has(apiJob.id))
                        .map(apiJob => ({
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
                        }));
                    setAllJobs(mappedJobs);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Filter jobs based on selected filters and search
    const jobs = allJobs.filter(job => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = job.title.toLowerCase().includes(query);
            const matchesCompany = job.company.toLowerCase().includes(query);
            if (!matchesTitle && !matchesCompany) {
                return false;
            }
        }

        // Category filter
        if (filters.category && job.category !== filters.category) {
            return false;
        }

        // Role filter
        if (filters.role && job.title !== filters.role) {
            return false;
        }

        // Job Type filter
        if (filters.jobType && job.jobType !== filters.jobType) {
            return false;
        }

        // Date Posted filter
        if (filters.datePosted) {
            const now = new Date();
            const jobDate = new Date(job.datePosted);
            const diffHours = (now - jobDate) / (1000 * 60 * 60);

            if (filters.datePosted === 'Last 24 hours' && diffHours > 24) {
                return false;
            }
            if (filters.datePosted === 'Last 7 days' && diffHours > 24 * 7) {
                return false;
            }
            if (filters.datePosted === 'Last 30 days' && diffHours > 24 * 30) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Jobs for you</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Jobs based on your resume</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl justify-end">
                        {/* Search Bar */}
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search by title or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/personal/my-jobs')}
                                className="flex items-center justify-center gap-2 bg-[#003971] text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#002b54] transition-colors min-h-[44px] flex-1 sm:flex-initial"
                            >
                                <Briefcase size={18} />
                                My Jobs
                            </button>
                            <button
                                onClick={() => {
                                    if (isFilterActive) {
                                        setFilters({ category: null, role: null, datePosted: null, jobType: null });
                                        setTempFilters({ category: null, role: null, datePosted: null, jobType: null });
                                        setIsFilterActive(false);
                                    } else {
                                        setShowFilter(true);
                                    }
                                }}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] flex-1 sm:flex-initial ${isFilterActive
                                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                                    : 'bg-[#003971] text-white hover:bg-[#002b54]'
                                    }`}
                            >
                                {isFilterActive ? <X size={18} /> : <SlidersHorizontal size={18} />}
                                {isFilterActive ? 'Remove Filter' : 'Filter'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Job List - Left Sidebar - Hidden on mobile when job detail is open */}
                <div className={`${selectedJob && 'hidden lg:block'} w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide`}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-4 text-[#003971]" />
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                            <Briefcase size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
                            <p className="text-lg font-medium text-gray-700">No jobs found</p>
                            <p className="text-sm mt-1">Adjust your filters or try a different search</p>
                        </div>
                    ) : (
                        jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => handleJobClick(job)}
                                className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedJob?.id === job.id ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="mb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-base font-semibold text-gray-800">{job.title}</h3>
                                        <div className="flex items-center gap-1 text-[#003971] text-sm hidden">
                                            <MapPin size={14} />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Building2 size={14} />
                                        <span>{job.company}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-800 font-medium">
                                        <span>{job.salary}</span>
                                        <div className="flex items-center gap-1 text-[#003971] text-sm">
                                            <MapPin size={14} />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Job Detail - Right Side - Full width on mobile when job is selected */}
                <div className={`${!selectedJob && 'hidden lg:flex'} flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide relative`}>
                    {isDetailLoading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-[#003971]" />
                        </div>
                    )}
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
                                                    navigate(`/personal/jobs/apply/${selectedJob.id}`);
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
                                            onClick={async () => {
                                                try {
                                                    await jobService.saveJob(selectedJob.id);
                                                    setSavedJobs(prev => {
                                                        const newSaved = new Set(prev);
                                                        if (newSaved.has(selectedJob.id)) {
                                                            newSaved.delete(selectedJob.id);
                                                        } else {
                                                            newSaved.add(selectedJob.id);
                                                        }
                                                        return newSaved;
                                                    });
                                                } catch (error) {
                                                    console.error("Failed to save/unsave job:", error);
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-full text-sm font-medium transition-colors ${savedJobs.has(selectedJob.id)
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
                                    {Object.keys(categoryRoles).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setTempFilters({
                                                ...tempFilters,
                                                category: tempFilters.category === cat ? null : cat,
                                                role: null // Reset role when category changes
                                            })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tempFilters.category === cat
                                                ? 'bg-[#003971] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Role Filter (conditionally shown based on category) */}
                            {tempFilters.category && (
                                <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
                                    <h3 className="text-base font-semibold text-gray-800 mb-3">Role ({tempFilters.category})</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryRoles[tempFilters.category].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setTempFilters({
                                                    ...tempFilters,
                                                    role: tempFilters.role === role ? null : role
                                                })}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tempFilters.role === role
                                                    ? 'bg-[#003971] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date Posted Filter */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Date Posted</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Last 24 hours', 'Last 7 days', 'Last 30 days'].map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setTempFilters({
                                                ...tempFilters,
                                                datePosted: tempFilters.datePosted === date ? null : date
                                            })}
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
                                            onClick={() => setTempFilters({
                                                ...tempFilters,
                                                jobType: tempFilters.jobType === type ? null : type
                                            })}
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
                                        tempFilters.category || tempFilters.role || tempFilters.datePosted || tempFilters.jobType
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
