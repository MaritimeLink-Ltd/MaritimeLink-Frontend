import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Banknote, Bookmark, SlidersHorizontal, Briefcase, Check, X, ArrowLeft } from 'lucide-react';

const Jobs = () => {
    const navigate = useNavigate();
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
    const allJobs = [
        {
            id: 1,
            title: 'Chief Engineer',
            company: 'Ocean Maritime Ltd',
            location: 'London',
            salary: 'GBP 75000',
            category: 'Officer',
            jobType: 'Permanent',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
            aboutCompany: 'We are a reputable maritime organization operating international vessels with a strong commitment to safety, compliance, and operational excellence. We are currently seeking a qualified Chief Engineer to join our fleet.',
            whatWeLookFor: 'We value professionalism, discipline, and a strong safety mindset. The ideal candidate demonstrates excellent engineering skills, effective communication, and the ability to work efficiently within a multinational crew.',
            responsibilities: [
                'Oversee engine room operations',
                'Maintain all mechanical and electrical systems',
                'Ensure compliance with maritime regulations',
                'Manage engineering team effectively'
            ]
        },
        {
            id: 2,
            title: 'Deck Officer',
            company: 'Global Shipping Co',
            location: 'Southampton',
            salary: 'GBP 55000',
            category: 'Officer',
            jobType: 'Contract',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            jobDescription: 'On-site Job: United Kingdom (Southampton / Joining Port as Assigned)',
            aboutCompany: 'Global Shipping Co operates a modern fleet across international waters. We seek experienced Deck Officers committed to safety and professional excellence.',
            whatWeLookFor: 'Strong navigation skills, leadership abilities, and dedication to maritime safety standards.',
            responsibilities: [
                'Navigate and operate vessel safely',
                'Maintain deck equipment and systems',
                'Ensure compliance with maritime regulations',
                'Coordinate with crew members effectively'
            ]
        },
        {
            id: 3,
            title: 'Able Seaman',
            company: 'Maritime Solutions Inc',
            location: 'Liverpool',
            salary: 'GBP 35000',
            category: 'Ratings and Crew',
            jobType: 'Temporary',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            jobDescription: 'On-site Job: United Kingdom (Liverpool / Joining Port as Assigned)',
            aboutCompany: 'Maritime Solutions Inc is a leading provider of crew services for commercial vessels worldwide.',
            whatWeLookFor: 'Experienced seamen with strong work ethic and commitment to safety.',
            responsibilities: [
                'Perform deck maintenance duties',
                'Assist with mooring operations',
                'Stand watch as required',
                'Follow all safety procedures'
            ]
        },
        {
            id: 4,
            title: 'Ship Cook',
            company: 'Culinary Marine Services',
            location: 'Portsmouth',
            salary: 'GBP 40000',
            category: 'Catering and Medical',
            jobType: 'Contract',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
            jobDescription: 'On-site Job: United Kingdom (Portsmouth / Joining Port as Assigned)',
            aboutCompany: 'We provide exceptional catering services to maritime vessels, ensuring crew welfare through quality nutrition.',
            whatWeLookFor: 'Qualified cooks with maritime experience and ability to work in confined spaces.',
            responsibilities: [
                'Prepare nutritious meals for crew',
                'Maintain galley hygiene standards',
                'Manage food inventory',
                'Accommodate dietary requirements'
            ]
        },
        {
            id: 5,
            title: 'Oiler/Motorman',
            company: 'Engine Room Experts',
            location: 'Newcastle',
            salary: 'GBP 38000',
            category: 'Ratings and Crew',
            jobType: 'Permanent',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
            jobDescription: 'On-site Job: United Kingdom (Newcastle / Joining Port as Assigned)',
            aboutCompany: 'Engine Room Experts specializes in providing skilled engine room crew to commercial vessels.',
            whatWeLookFor: 'Experienced oilers with mechanical aptitude and safety consciousness.',
            responsibilities: [
                'Maintain and lubricate machinery',
                'Assist engineers with repairs',
                'Monitor engine room systems',
                'Perform routine maintenance tasks'
            ]
        },
        {
            id: 6,
            title: 'Ship Medic',
            company: 'Maritime Healthcare Services',
            location: 'Bristol',
            salary: 'GBP 48000',
            category: 'Catering and Medical',
            jobType: 'Permanent',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
            jobDescription: 'On-site Job: United Kingdom (Bristol / Joining Port as Assigned)',
            aboutCompany: 'Maritime Healthcare Services provides medical support to seafarers worldwide.',
            whatWeLookFor: 'Qualified medical professionals with maritime experience and emergency response training.',
            responsibilities: [
                'Provide medical care to crew',
                'Maintain medical inventory',
                'Conduct health and safety inspections',
                'Respond to medical emergencies'
            ]
        },
        {
            id: 7,
            title: 'Second Engineer',
            company: 'Tech Marine Ltd',
            location: 'Glasgow',
            salary: 'GBP 62000',
            category: 'Officer',
            jobType: 'Contract',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), // 25 days ago
            jobDescription: 'On-site Job: United Kingdom (Glasgow / Joining Port as Assigned)',
            aboutCompany: 'Tech Marine Ltd operates technologically advanced vessels requiring skilled engineering officers.',
            whatWeLookFor: 'Second Engineers with modern vessel experience and strong technical knowledge.',
            responsibilities: [
                'Assist Chief Engineer in operations',
                'Maintain engine and auxiliary systems',
                'Supervise engine room crew',
                'Ensure regulatory compliance'
            ]
        },
        {
            id: 8,
            title: 'Ordinary Seaman',
            company: 'Seafarer Recruitment Agency',
            location: 'Cardiff',
            salary: 'GBP 28000',
            category: 'Ratings and Crew',
            jobType: 'Temporary',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32), // 32 days ago
            jobDescription: 'On-site Job: United Kingdom (Cardiff / Joining Port as Assigned)',
            aboutCompany: 'Leading recruitment agency placing seafarers on quality vessels worldwide.',
            whatWeLookFor: 'Entry-level seamen willing to learn and develop maritime skills.',
            responsibilities: [
                'Assist deck crew with daily tasks',
                'Perform cleaning and maintenance',
                'Learn navigation and seamanship',
                'Follow safety protocols'
            ]
        },
        {
            id: 9,
            title: 'Chief Cook',
            company: 'Premium Catering Maritime',
            location: 'Belfast',
            salary: 'GBP 45000',
            category: 'Catering and Medical',
            jobType: 'Permanent',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            jobDescription: 'On-site Job: United Kingdom (Belfast / Joining Port as Assigned)',
            aboutCompany: 'Premium Catering Maritime provides high-quality food services to luxury cruise vessels.',
            whatWeLookFor: 'Experienced Chief Cooks with culinary qualifications and leadership skills.',
            responsibilities: [
                'Lead galley operations',
                'Train and supervise kitchen staff',
                'Plan menus and manage budgets',
                'Ensure food safety standards'
            ]
        },
        {
            id: 10,
            title: 'Third Officer',
            company: 'Royal Fleet Services',
            location: 'Plymouth',
            salary: 'GBP 48000',
            category: 'Officer',
            jobType: 'Temporary',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
            jobDescription: 'On-site Job: United Kingdom (Plymouth / Joining Port as Assigned)',
            aboutCompany: 'Royal Fleet Services manages a diverse fleet requiring skilled navigation officers.',
            whatWeLookFor: 'Third Officers with valid certification and commitment to maritime excellence.',
            responsibilities: [
                'Stand navigation watches',
                'Maintain safety equipment',
                'Assist with cargo operations',
                'Ensure compliance with regulations'
            ]
        }
    ];

    // Filter jobs based on selected filters
    const jobs = allJobs.filter(job => {
        // Category filter
        if (filters.category && job.category !== filters.category) {
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
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Jobs for you</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Jobs based on your resume</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/personal/my-jobs')}
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
                                            onClick={() => setTempFilters({ 
                                                ...tempFilters, 
                                                category: tempFilters.category === cat ? null : cat 
                                            })}
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
