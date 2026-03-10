import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ChevronDown,
    Edit2
} from 'lucide-react';
import { useEffect, useRef } from 'react';

function JobDetail({ onBack }) {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const location = useLocation();
    const jobData = location.state?.jobData;
    const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
    const [jobStatus, setJobStatus] = useState(jobData?.status || 'Active');
    const isPublished = jobStatus === 'Active';
    const isClosed = jobStatus === 'Closed';
    const [activeTab, setActiveTab] = useState('matches');
    const [isATSDropdownOpen, setIsATSDropdownOpen] = useState(false);
    const atsDropdownRef = useRef(null);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [invitedApplicants, setInvitedApplicants] = useState([]);
    const [scheduledInterviews, setScheduledInterviews] = useState([]);
    const [timeFilter, setTimeFilter] = useState('7days');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (atsDropdownRef.current && !atsDropdownRef.current.contains(event.target)) {
                setIsATSDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock job data - in real app, fetch based on jobId
    const job = jobData || {
        id: jobId || '000001',
        title: 'Chief Engineer',
        vessel: 'LNG Tanker',
        location: 'Global',
        posted: '2 days ago',
        status: 'Active',
        type: 'Permanent',
        description: 'We are seeking an experienced Chief Engineer to join our LNG Tanker operations...'
    };

    const stats = [
        {
            icon: Users,
            label: activeTab === 'matches' ? 'Total Candidates' : 'Total Applicants',
            value: '45',
            subtitle: 'Since 20 Apr 2024',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            icon: CheckCircle,
            label: 'Compliance Ready',
            value: '21',
            subtitle: 'Amm days',
            color: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            icon: AlertTriangle,
            label: 'Expiring Soon',
            value: '14',
            subtitle: 'Expire in 90 days',
            color: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            icon: XCircle,
            label: 'Not Deployable',
            value: '10',
            subtitle: 'Missing critical certs',
            color: 'bg-red-50',
            iconColor: 'text-red-600'
        }
    ];

    const allApplicants = [
        // New applicants
        {
            id: 1,
            name: 'Sarah Johnson',
            age: 28,
            rank: 'Chief Engineer',
            availability: 'Meyer Avance',
            availabilitySubtext: 'Master',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '26 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'new'
        },
        {
            id: 4,
            name: 'David Chen',
            age: 32,
            rank: 'Second Engineer',
            availability: 'MSC Gülsün',
            availabilitySubtext: '2nd Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '22 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'new'
        },
        {
            id: 5,
            name: 'Emma Wilson',
            age: 29,
            rank: 'Third Engineer',
            availability: 'Available Now',
            availabilitySubtext: '3rd Engineer',
            compliance: 'Expiring Soon',
            complianceSubtext: 'Ends in 45 days',
            applicationDate: '5 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'new'
        },
        // Matches
        {
            id: 2,
            name: 'Michael Brown',
            age: 34,
            rank: 'Chief Engineer',
            availability: 'BW Pavilion Arches',
            availabilitySubtext: '3rd Officer',
            compliance: 'Expiring Soon',
            complianceSubtext: 'Ends in 2 days',
            applicationDate: '2 Mar 2026',
            avatar: '/images/login-image.webp',
            status: 'matches'
        },
        {
            id: 6,
            name: 'Robert Taylor',
            age: 36,
            rank: 'Chief Engineer',
            availability: 'Ever Given',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '3 Mar 2026',
            avatar: '/images/login-image.webp',
            status: 'matches'
        },
        {
            id: 7,
            name: 'Lisa Anderson',
            age: 31,
            rank: 'Second Engineer',
            availability: 'Available Now',
            availabilitySubtext: '2nd Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '4 Mar 2026',
            avatar: '/images/login-image.webp',
            status: 'matches'
        },
        // Shortlisted
        {
            id: 8,
            name: 'James Martinez',
            age: 33,
            rank: 'Chief Engineer',
            availability: 'CMA CGM Antoine',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '25 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'shortlisted'
        },
        {
            id: 9,
            name: 'Patricia Lee',
            age: 35,
            rank: 'Chief Engineer',
            availability: 'Available Now',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '3 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'shortlisted'
        },
        // Interviewing
        {
            id: 10,
            name: 'Thomas Garcia',
            age: 37,
            rank: 'Chief Engineer',
            availability: 'OOCL Hong Kong',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '26 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'interviewing'
        },
        {
            id: 11,
            name: 'Jennifer White',
            age: 30,
            rank: 'Second Engineer',
            availability: 'Available Now',
            availabilitySubtext: '2nd Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '15 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'interviewing'
        },
        // Offered
        {
            id: 12,
            name: 'Christopher Moore',
            age: 38,
            rank: 'Chief Engineer',
            availability: 'Maersk Triple E',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '20 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'offered'
        },
        {
            id: 13,
            name: 'Mary Thompson',
            age: 32,
            rank: 'Chief Engineer',
            availability: 'Available Now',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '1 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'offered'
        },
        // Hired
        {
            id: 3,
            name: 'John Smith',
            age: 30,
            rank: 'Chief Engineer',
            availability: 'Available Now',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '23 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'hired'
        },
        {
            id: 14,
            name: 'Daniel Harris',
            age: 39,
            rank: 'Chief Engineer',
            availability: 'MSC Oscar',
            availabilitySubtext: 'Chief Engineer',
            compliance: 'Ready',
            complianceSubtext: '',
            applicationDate: '8 Feb 2026',
            avatar: '/images/login-image.webp',
            status: 'hired'
        }
    ];

    // Get the cutoff date based on selected time filter
    const getTimeFilterDate = () => {
        const now = new Date();
        switch (timeFilter) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case '7days':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30days':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(0); // show all
        }
    };

    // Filter applicants by active tab and time filter
    const filteredApplicants = allApplicants.filter(applicant => {
        const matchesTab = activeTab === 'all' || applicant.status === activeTab;
        const applicationDate = new Date(applicant.applicationDate);
        const cutoffDate = getTimeFilterDate();
        const matchesTime = activeTab === 'all' ? true : applicationDate >= cutoffDate;
        return matchesTab && matchesTime;
    });

    // Sort applicants
    const sortedApplicants = [...filteredApplicants].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'age':
                comparison = a.age - b.age;
                break;
            case 'rank':
                comparison = a.rank.localeCompare(b.rank);
                break;
            case 'date':
                comparison = new Date(a.applicationDate) - new Date(b.applicationDate);
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalItems = sortedApplicants.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplicants = sortedApplicants.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, timeFilter]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleInviteToApply = (applicantId) => {
        setInvitedApplicants([...invitedApplicants, applicantId]);
        // In real app, this would send an API request
    };

    const handleScheduleInterview = (applicantId) => {
        setScheduledInterviews([...scheduledInterviews, applicantId]);
        // In real app, this would send an API request
    };

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 px-6 pt-6">
                {/* Back Icon */}
                <button
                    onClick={() => onBack ? onBack() : navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                            {/* Published/Unpublished Badge */}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isClosed
                                ? 'bg-red-100 text-red-700'
                                : isPublished
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {isClosed ? 'Closed' : isPublished ? 'Published' : 'Unpublished'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span>{job.vessel}</span>
                            <span>•</span>
                            <span>Posted {job.posted}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Time Period Filters */}
                        {activeTab !== 'all' && (
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                {[
                                    { id: 'today', label: 'Today' },
                                    { id: '7days', label: '7 Days' },
                                    { id: '30days', label: '30 Days' }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => {
                                            setTimeFilter(filter.id);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${timeFilter === filter.id
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                const editPath = location.pathname.includes('/admin/marketplace')
                                    ? '/admin/marketplace/create-job'
                                    : '/admin/upload-job'; // Same for recruiter and default admin
                                navigate(editPath, { state: { jobData: job, isEdit: true } });
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#003971] text-white rounded-lg font-semibold hover:bg-[#002855] transition-colors"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Job
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowJobDetailsModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            View Job Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="px-6 pb-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className={`${stat.color} rounded-xl p-5`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className={`text-xs font-semibold ${stat.iconColor} mb-1`}>
                                {stat.label}
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-600">{stat.subtitle}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs and Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="border-b border-gray-100 p-4">
                        <div className="flex items-center gap-4">
                            {/* Matches Tab */}
                            <button
                                onClick={() => {
                                    setActiveTab('matches');
                                    setIsATSDropdownOpen(false);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'matches' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Matches ({allApplicants.filter(a => a.status === 'matches').length})
                            </button>

                            {/* All Tab */}
                            <button
                                onClick={() => {
                                    setActiveTab('all');
                                    setIsATSDropdownOpen(false);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'all' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All ({allApplicants.length})
                            </button>

                            {/* ATS Dropdown */}
                            <div className="relative" ref={atsDropdownRef}>
                                <button
                                    onClick={() => setIsATSDropdownOpen(!isATSDropdownOpen)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${['new', 'shortlisted', 'interviewing', 'offered', 'hired'].includes(activeTab)
                                        ? 'bg-[#003971] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {(activeTab === 'matches' || activeTab === 'all') ? 'ATS' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isATSDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isATSDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {[
                                            { id: 'new', label: 'New' },
                                            { id: 'shortlisted', label: 'Shortlisted' },
                                            { id: 'interviewing', label: 'Interviewing' },
                                            { id: 'offered', label: 'Offered' },
                                            { id: 'hired', label: 'Hired' }
                                        ].map((stage) => (
                                            <button
                                                key={stage.id}
                                                onClick={() => {
                                                    setActiveTab(stage.id);
                                                    setIsATSDropdownOpen(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${activeTab === stage.id
                                                    ? 'bg-blue-50 text-[#003971]'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{stage.label}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === stage.id ? 'bg-[#003971] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {allApplicants.filter(a => a.status === stage.id).length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Applicants Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        {activeTab === 'matches' ? 'Candidates' : 'Applicants'} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('rank')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Availability</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Compliance</th>
                                    <th
                                        onClick={() => handleSort('date')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Application Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedApplicants.map((applicant, idx) => (
                                    <tr key={applicant.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={applicant.avatar}
                                                    alt={applicant.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            const candidateRoute = location.pathname.includes('/marketplace')
                                                                ? `/admin/marketplace/candidate/${applicant.id}`
                                                                : `/recruiter/candidate/${applicant.id}`;
                                                            navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                        }}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 text-left"
                                                    >
                                                        {applicant.name}
                                                    </button>
                                                    <div className="text-sm text-gray-500">Age: {applicant.age}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-medium">{applicant.rank}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{applicant.availability}</div>
                                                <div className="text-sm text-gray-500">{applicant.availabilitySubtext}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className={`font-semibold ${applicant.compliance === 'Ready' ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {applicant.compliance}
                                                </div>
                                                {applicant.complianceSubtext && (
                                                    <div className="text-sm text-gray-500">{applicant.complianceSubtext}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700">{applicant.applicationDate}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                    {(activeTab === 'new' || (activeTab === 'all' && applicant.status === 'new')) && (
                                                    <button
                                                        onClick={() => {
                                                            const candidateRoute = location.pathname.includes('/marketplace')
                                                                ? `/admin/marketplace/candidate/${applicant.id}`
                                                                : `/recruiter/candidate/${applicant.id}`;
                                                            navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                        }}
                                                        className="text-blue-600 font-semibold hover:underline text-sm"
                                                    >
                                                        View Profile
                                                    </button>
                                                )}
                                                    {(activeTab === 'matches' || (activeTab === 'all' && applicant.status === 'matches')) && (
                                                    <button
                                                        onClick={() => {
                                                            const candidateRoute = location.pathname.includes('/marketplace')
                                                                ? `/admin/marketplace/candidate/${applicant.id}`
                                                                : `/recruiter/candidate/${applicant.id}`;
                                                            navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                        }}
                                                        className="text-blue-600 font-semibold hover:underline text-sm"
                                                    >
                                                        View Profile
                                                    </button>
                                                )}
                                                    {(activeTab === 'shortlisted' || (activeTab === 'all' && applicant.status === 'shortlisted')) && (
                                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
                                                        Shortlisted
                                                    </span>
                                                )}
                                                    {(activeTab === 'interviewing' || (activeTab === 'all' && applicant.status === 'interviewing')) && (
                                                    scheduledInterviews.includes(applicant.id) ? (
                                                        <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                                                            Scheduled
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleScheduleInterview(applicant.id)}
                                                            className="px-3 py-1.5 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors"
                                                        >
                                                            Schedule Interview
                                                        </button>
                                                    )
                                                )}
                                                    {(activeTab === 'offered' || (activeTab === 'all' && applicant.status === 'offered')) && (
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                                                        Offer Sent
                                                    </span>
                                                )}
                                                    {(activeTab === 'hired' || (activeTab === 'all' && applicant.status === 'hired')) && (
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                                                        Hired
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                                disabled={safeCurrentPage === 1}
                                className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>
                            <button className="h-11 w-11 rounded-xl bg-[#1e5a8f] text-white font-semibold">
                                {safeCurrentPage}
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showJobDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Job Details</h3>
                        <p className="text-sm text-gray-600 mb-1">{job.title} • {job.vessel}</p>
                        <p className="text-sm text-gray-600 mb-5">Posted {job.posted}</p>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                            <p className="text-sm text-gray-700 leading-6">{job.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowJobDetailsModal(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            {!isClosed && (
                                <button
                                    onClick={() => {
                                        setJobStatus(isPublished ? 'Unpublished' : 'Active');
                                        setShowJobDetailsModal(false);
                                    }}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors ${isPublished
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-[#003971] hover:bg-[#002855]'
                                        }`}
                                >
                                    {isPublished ? 'Unpublish' : 'Publish'}
                                </button>
                            )}
                            {!isClosed ? (
                                <button
                                    onClick={() => {
                                        setJobStatus('Closed');
                                        setShowJobDetailsModal(false);
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                    Close Job
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="px-5 py-2.5 rounded-xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                                >
                                    Job Closed
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetail;
