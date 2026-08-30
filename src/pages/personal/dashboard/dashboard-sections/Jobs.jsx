import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Banknote, Bookmark, SlidersHorizontal, Briefcase, Check, X, ArrowLeft, Search, Loader2, Crown, Globe, ExternalLink, ShieldAlert } from 'lucide-react';
import jobService from '../../../../services/jobService';
import LocationAutocomplete from '../../../../components/common/LocationAutocomplete';
import { useKycGuard } from '../../../../context/KycContext';
import { KYC_ACTIONS } from '../../../../constants/kycRestrictedActions';

const CATEGORY_TO_API = {
    'Deck Officer': 'OFFICER',
    'Engine Officer': 'OFFICER',
    'Deck Ratings': 'RATINGS_AND_CREW',
    'Engine Ratings': 'RATINGS_AND_CREW',
    'Catering': 'CATERING_AND_MEDICAL',
    'Medical': 'CATERING_AND_MEDICAL',
};

const API_CATEGORY_LABEL = {
    OFFICER: 'Officer',
    RATINGS_AND_CREW: 'Ratings & Crew',
    CATERING_AND_MEDICAL: 'Catering & Medical',
};

const JOB_TYPE_TO_API = {
    Temporary: 'TEMPORARY',
    Contract: 'CONTRACT',
    Permanent: 'PERMANENT',
};

const API_JOB_TYPE_LABEL = {
    TEMPORARY: 'Temporary',
    CONTRACT: 'Contract',
    PERMANENT: 'Permanent',
};

const DATE_POSTED_TO_API = {
    'Last 24 hours': '24h',
    'Last 7 days': '7d',
    'Last 30 days': '30d',
};

/** Approximate mapping from the platform's contract-type filter to free-text job postings. */
const JOB_TYPE_KEYWORDS = {
    Temporary: ['temporary', 'temp'],
    Contract: ['contract'],
    Permanent: ['permanent', 'full-time', 'full time', 'fulltime'],
};

const DATE_POSTED_WINDOW_DAYS = {
    'Last 24 hours': 1,
    'Last 7 days': 7,
    'Last 30 days': 30,
};

const trimSearchValue = (value) => String(value || '').trim();

const formatJobCategory = (category) => API_CATEGORY_LABEL[String(category || '').trim()] || String(category || '');

const formatJobType = (jobType) => API_JOB_TYPE_LABEL[String(jobType || '').trim()] || String(jobType || '');

/**
 * External sources disagree on date format: syndicated feeds send ISO
 * timestamps, Google Jobs sends relative text like "3 days ago". Parseable
 * dates render as a readable date; anything else passes through as-is.
 */
const formatExternalPostedAt = (postedAt) => {
    if (!postedAt) return '';
    const parsed = new Date(postedAt);
    if (Number.isNaN(parsed.getTime())) return String(postedAt);
    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/** Normalizes a backend external-job row into the same display shape internal jobs use. */
const mapExternalJob = (raw) => ({
    id: raw.id,
    source: 'external',
    title: raw.title,
    company: raw.company || raw.via || 'Company not listed',
    isPremiumRecruiter: false,
    location: raw.location || '',
    salary: raw.salary || '',
    category: raw.category || '',
    jobType: raw.employmentType || '',
    /** Raw value for display (may be relative text like "3 days ago", not always parseable). */
    postedAt: raw.postedAt || null,
    jobDescription: raw.description,
    applyLink: raw.applyLink,
    via: raw.via,
    matchScore: raw.matchScore,
    matchReasons: raw.matchReasons,
});

const applyClientJobSearch = (jobs, { keywords, location, officerType }) => {
    const kw = trimSearchValue(keywords).toLowerCase();
    const loc = trimSearchValue(location).toLowerCase();
    const officer = trimSearchValue(officerType);

    return jobs.filter((job) => {
        if (kw) {
            const haystack = [job.title, job.company, job.jobDescription]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(kw)) return false;
        }
        if (loc) {
            const jobLocation = String(job.location || '').toLowerCase();
            const isGlobal = jobLocation === 'global';
            if (!isGlobal && !jobLocation.includes(loc)) return false;
        }
        if (officer) {
            const expectedCategory = API_CATEGORY_LABEL[CATEGORY_TO_API[officer]] || officer;
            if (job.category !== expectedCategory) return false;
        }
        return true;
    });
};

/**
 * External jobs carry free-text category/employment fields, not the platform's
 * OFFICER/RATINGS_AND_CREW enums, so filtering them uses the same `categoryRoles`
 * rank taxonomy the UI already shows in the officer-type dropdown and filter
 * panel — matching specific rank words (e.g. "Chief Officer") rather than the
 * generic category label, which rarely appears verbatim in a real posting.
 * Location and date are matched leniently: a job with no parseable value is
 * kept rather than hidden, since most external postings don't carry one.
 */
const applyExternalJobSearch = (jobs, { keywords, location, officerType, filters, categoryRoles }) => {
    const kw = trimSearchValue(keywords).toLowerCase();
    const loc = trimSearchValue(location).toLowerCase();
    const effectiveCategory = officerType || filters.category;

    return jobs.filter((job) => {
        const haystack = [job.title, job.company, job.jobDescription, job.category, job.via]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        if (kw && !haystack.includes(kw)) return false;

        if (loc) {
            const jobLocation = String(job.location || '').toLowerCase();
            if (jobLocation && !jobLocation.includes(loc)) return false;
        }

        if (effectiveCategory) {
            const terms = categoryRoles[effectiveCategory] || [effectiveCategory];
            if (!terms.some((term) => haystack.includes(term.toLowerCase()))) return false;
        }

        if (filters.role && !haystack.includes(filters.role.toLowerCase())) return false;

        if (filters.jobType) {
            const keywordsForType = JOB_TYPE_KEYWORDS[filters.jobType] || [filters.jobType.toLowerCase()];
            const employmentText = String(job.jobType || '').toLowerCase();
            if (!keywordsForType.some((term) => employmentText.includes(term) || haystack.includes(term))) return false;
        }

        if (filters.datePosted && job.postedAt) {
            const parsed = new Date(job.postedAt);
            const windowDays = DATE_POSTED_WINDOW_DAYS[filters.datePosted];
            if (windowDays && !Number.isNaN(parsed.getTime())) {
                const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
                if (parsed.getTime() < cutoff) return false;
            }
        }

        return true;
    });
};

const Jobs = () => {
    const navigate = useNavigate();
    const { guardRestrictedAction } = useKycGuard();
    const PAGE_SIZE = 10;

    const [externalJobs, setExternalJobs] = useState([]);
    const [isExternalLoading, setIsExternalLoading] = useState(true);
    const [externalError, setExternalError] = useState('');

    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [showFilter, setShowFilter] = useState(false);
    const [showAppliedModal, setShowAppliedModal] = useState(false);
    // Holds the job pending confirmation before leaving to an external apply
    // link — null when no confirmation is showing.
    const [externalApplyTarget, setExternalApplyTarget] = useState(null);
    const [filters, setFilters] = useState({
        category: null,
        role: null,
        datePosted: null,
        jobType: null
    });
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [searchKeywords, setSearchKeywords] = useState('');
    const [searchOfficerType, setSearchOfficerType] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [debouncedKeywords, setDebouncedKeywords] = useState('');
    const [debouncedLocation, setDebouncedLocation] = useState('');

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

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKeywords(trimSearchValue(searchKeywords)), 400);
        return () => clearTimeout(timer);
    }, [searchKeywords]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLocation(trimSearchValue(searchLocation)), 400);
        return () => clearTimeout(timer);
    }, [searchLocation]);

    const buildJobsQuery = useCallback(() => {
        const effectiveCategory = searchOfficerType || filters.category;
        const categoryApi = effectiveCategory
            ? CATEGORY_TO_API[effectiveCategory] || effectiveCategory
            : undefined;
        const role =
            filters.role && (!searchOfficerType || searchOfficerType === filters.category)
                ? filters.role
                : undefined;

        return {
            search: debouncedKeywords || undefined,
            officerType: searchOfficerType || undefined,
            category: categoryApi,
            jobType: filters.jobType ? JOB_TYPE_TO_API[filters.jobType] || filters.jobType : undefined,
            datePosted: filters.datePosted ? DATE_POSTED_TO_API[filters.datePosted] || filters.datePosted : undefined,
            role,
        };
    }, [
        debouncedKeywords,
        debouncedLocation,
        searchOfficerType,
        filters.category,
        filters.role,
        filters.datePosted,
        filters.jobType,
    ]);

    const isSearchActive =
        Boolean(trimSearchValue(searchKeywords)) ||
        Boolean(trimSearchValue(searchLocation)) ||
        Boolean(searchOfficerType);

    const handleJobClick = async (job) => {
        if (job.source === 'external') {
            setSelectedJob(job);
            return;
        }

        setSelectedJob(job);
        setIsDetailLoading(true);
        try {
            const response = await jobService.getProfessionalJobById(job.id);
            if (response.status === 'success' && response.data?.job) {
                const apiJob = response.data.job;
                setSelectedJob({
                    id: apiJob.id,
                    source: 'internal',
                    title: apiJob.title,
                    company: apiJob.recruiter?.organizationName || 'MaritimeLink Admin',
                    location: apiJob.location || 'Global',
                    salary: apiJob.salary,
                    category: formatJobCategory(apiJob.category),
                    jobType: formatJobType(apiJob.contractType),
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
                    jobService.getProfessionalJobs(1, PAGE_SIZE, buildJobsQuery()).catch(() => null),
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
                            source: 'internal',
                            title: apiJob.title,
                            company: apiJob.recruiter?.organizationName || 'MaritimeLink Admin',
                            isPremiumRecruiter: Boolean(apiJob.isPremiumRecruiter),
                            location: apiJob.location || 'Global',
                            salary: apiJob.salary,
                            category: formatJobCategory(apiJob.category),
                            jobType: formatJobType(apiJob.contractType),
                            datePosted: new Date(apiJob.createdAt),
                            jobDescription: apiJob.description,
                            aboutCompany: `Information about ${apiJob.recruiter?.organizationName || 'MaritimeLink Admin'}.`,
                            whatWeLookFor: 'We are looking for dedicated professionals to join our team.',
                            responsibilities: apiJob.description ? apiJob.description.split('\n').filter(line => line.trim() !== '') : []
                        }));

                    const visibleJobs = applyClientJobSearch(mappedJobs, {
                        keywords: debouncedKeywords,
                        location: debouncedLocation,
                        officerType: searchOfficerType,
                    });
                    setAllJobs(visibleJobs);
                    setSelectedJob((current) => {
                        if (current && visibleJobs.some((job) => job.id === current.id)) {
                            return current;
                        }
                        return current?.source === 'external' ? current : null;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [buildJobsQuery]);

    useEffect(() => {
        let cancelled = false;

        const fetchExternalJobs = async () => {
            try {
                setIsExternalLoading(true);
                setExternalError('');
                const response = await jobService.getExternalJobs();
                if (cancelled) return;
                if (response.status === 'success' && response.data?.jobs) {
                    setExternalJobs(response.data.jobs);
                }
            } catch (error) {
                console.error('Failed to fetch external jobs:', error);
                if (!cancelled) setExternalError('Unable to load external jobs right now.');
            } finally {
                if (!cancelled) setIsExternalLoading(false);
            }
        };

        fetchExternalJobs();
        return () => { cancelled = true; };
    }, []);

    // Backend already ranks matched-first; filtering preserves that order.
    const filteredExternalJobs = useMemo(
        () => applyExternalJobSearch(externalJobs.map(mapExternalJob), {
            keywords: debouncedKeywords,
            location: debouncedLocation,
            officerType: searchOfficerType,
            filters,
            categoryRoles,
        }),
        [externalJobs, debouncedKeywords, debouncedLocation, searchOfficerType, filters]
    );

    // Internal jobs first as usual, external ones appended after — each carries its own "External" badge.
    const jobs = [...allJobs, ...filteredExternalJobs];

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Jobs for you</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Jobs based on your resume</p>
                    </div>

                    <div className="flex flex-col gap-3 w-full lg:flex-1 lg:max-w-4xl lg:justify-end">
                        {/* Search: keywords, officer type, location */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                            <div className="relative flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Keywords (title, company...)"
                                    value={searchKeywords}
                                    onChange={(e) => setSearchKeywords(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            </div>

                            <select
                                value={searchOfficerType}
                                onChange={(e) => setSearchOfficerType(e.target.value)}
                                className="w-full sm:w-48 py-2.5 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm text-gray-700 bg-white"
                                aria-label="Officer type"
                            >
                                <option value="">All officer types</option>
                                {Object.keys(categoryRoles).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            <div className="relative w-full sm:w-44 min-w-0">
                                <LocationAutocomplete
                                    name="location"
                                    placeholder="Location"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
                                />
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            </div>

                            {isSearchActive && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchKeywords('');
                                        setSearchOfficerType('');
                                        setSearchLocation('');
                                    }}
                                    className="px-4 py-2.5 rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
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
                <div className={`${selectedJob && 'hidden lg:block'} w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide lg:h-full`}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-4 text-[#003971]" />
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                            <Briefcase size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
                            <p className="text-lg font-medium text-gray-700">No jobs found</p>
                            <p className="text-sm mt-1">Try different keywords, officer type, location, or filters</p>
                        </div>
                    ) : (
                        <>
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => handleJobClick(job)}
                                    className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedJob?.id === job.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="mb-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-base font-semibold text-gray-800">{job.title}</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                                            <Building2 size={14} />
                                            <span>{job.company}</span>
                                            {job.isPremiumRecruiter && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                                    <Crown size={10} />
                                                    Premium Recruiter
                                                </span>
                                            )}
                                            {job.source === 'external' && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                                                    <Globe size={10} />
                                                    External
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-800 font-medium">
                                            <span>{job.salary}</span>
                                            {job.location && (
                                                <div className="flex items-center gap-1 text-[#003971] text-sm">
                                                    <MapPin size={14} />
                                                    <span>{job.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isExternalLoading && (
                                <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
                                    <Loader2 size={16} className="animate-spin" />
                                    Loading more jobs...
                                </div>
                            )}
                            {externalError && !isExternalLoading && filteredExternalJobs.length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-4">{externalError}</p>
                            )}
                        </>
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
                                        {selectedJob.source === 'external' ? (
                                            selectedJob.applyLink ? (
                                                <button
                                                    onClick={() => setExternalApplyTarget({
                                                        applyLink: selectedJob.applyLink,
                                                        title: selectedJob.title,
                                                        company: selectedJob.company,
                                                    })}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003971] text-white rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors"
                                                >
                                                    Apply on Company Site
                                                    <ExternalLink size={16} />
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-500">No apply link available</span>
                                            )
                                        ) : (
                                            <>
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
                                                            guardRestrictedAction(KYC_ACTIONS.APPLY_JOB, () => {
                                                                navigate(`/personal/jobs/apply/${selectedJob.id}`);
                                                                setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
                                                                setShowAppliedModal(true);
                                                                setTimeout(() => setShowAppliedModal(false), 2000);
                                                            });
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Company Info */}
                                <div className="space-y-2 mb-5">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Building2 size={18} className="text-gray-400" />
                                        <span className="text-base">{selectedJob.company}</span>
                                    </div>
                                    {selectedJob.location && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="text-base">{selectedJob.location}</span>
                                        </div>
                                    )}
                                    {selectedJob.salary && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Banknote size={18} className="text-gray-400" />
                                            <span className="text-base font-medium">{selectedJob.salary}</span>
                                        </div>
                                    )}
                                    {selectedJob.source === 'external' && (selectedJob.via || selectedJob.postedAt) && (
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Globe size={16} className="text-gray-400" />
                                            <span>
                                                {[selectedJob.via, formatExternalPostedAt(selectedJob.postedAt)].filter(Boolean).join(' · ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {selectedJob.source === 'internal' ? (
                                    /* Category and Job Type */
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
                                ) : (
                                    (selectedJob.category || selectedJob.jobType) && (
                                        <div className="mb-6">
                                            <p className="text-xs text-gray-500 mb-1">Job Type</p>
                                            <p className="text-base font-medium text-gray-800">
                                                {[selectedJob.category, selectedJob.jobType].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                    )
                                )}

                                {selectedJob.matchReasons?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedJob.matchReasons.map((reason) => (
                                            <span
                                                key={reason}
                                                className="text-[11px] font-medium text-[#003971] bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1"
                                            >
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedJob.jobDescription}</p>
                            </div>

                            {selectedJob.source === 'internal' && (
                                <>
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
                                </>
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

            {/* Leaving MaritimeLink Modal — external/scraped listings only */}
            {externalApplyTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={32} className="text-amber-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">You're leaving MaritimeLink</h3>
                        <p className="text-gray-600 text-sm mb-1">
                            "{externalApplyTarget.title}"{externalApplyTarget.company ? ` at ${externalApplyTarget.company}` : ''} is sourced automatically from external job boards and has not been verified by MaritimeLink.
                        </p>
                        <p className="text-gray-600 text-sm mb-6">
                            Before applying or sharing any personal or payment details, it's your responsibility to confirm this listing and employer are genuine.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setExternalApplyTarget(null)}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    window.open(externalApplyTarget.applyLink, '_blank', 'noopener,noreferrer');
                                    setExternalApplyTarget(null);
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#003971] text-white rounded-full font-medium hover:bg-[#003971]/90 transition-colors"
                            >
                                Continue
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                </div>
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
