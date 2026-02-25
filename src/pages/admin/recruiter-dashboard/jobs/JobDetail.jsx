import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Edit,
    Pause,
    Upload,
    X as XIcon
} from 'lucide-react';

function JobDetail({ onBack }) {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const location = useLocation();
    const jobData = location.state?.jobData;

    const [isPublished, setIsPublished] = useState(jobData?.status === 'Active' || false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isClosed, setIsClosed] = useState(jobData?.status === 'Closed' || false);
    const [activeTab, setActiveTab] = useState('new');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [invitedApplicants, setInvitedApplicants] = useState([]);

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
            label: 'Total Applicants',
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
            applicationDate: '20 Apr 2024',
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
            applicationDate: '21 Apr 2024',
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
            applicationDate: '22 Apr 2024',
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
            applicationDate: '20 Apr 2024',
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
            applicationDate: '19 Apr 2024',
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
            applicationDate: '23 Apr 2024',
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
            applicationDate: '17 Apr 2024',
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
            applicationDate: '16 Apr 2024',
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
            applicationDate: '15 Apr 2024',
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
            applicationDate: '14 Apr 2024',
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
            applicationDate: '13 Apr 2024',
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
            applicationDate: '12 Apr 2024',
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
            applicationDate: '18 Apr 2024',
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
            applicationDate: '11 Apr 2024',
            avatar: '/images/login-image.webp',
            status: 'hired'
        }
    ];

    // Filter applicants by active tab
    const filteredApplicants = allApplicants.filter(applicant => applicant.status === activeTab);

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

    const handlePublishToggle = () => {
        setShowPublishModal(true);
    };

    const confirmPublishToggle = () => {
        setIsPublished(!isPublished);
        setShowPublishModal(false);
        // Navigate based on source
        if (location.pathname.includes('/marketplace')) {
            navigate('/admin/marketplace');
        } else {
            navigate('/admin/jobs');
        }
    };

    const handleEditJob = () => {
        const isMarketplace = location.pathname.includes('/marketplace');
        const type = isMarketplace ? 'admin' : 'recruiter';
        const returnPath = isMarketplace ? '/admin/marketplace' : '/admin/jobs';

        navigate('/admin/upload-job', {
            state: {
                jobData: job,
                isEdit: true,
                dashboardType: type,
                returnPath: returnPath
            }
        });
    };

    const handlePauseToggle = () => {
        setShowPauseModal(true);
    };

    const confirmPauseToggle = () => {
        setIsPaused(!isPaused);
        setShowPauseModal(false);
    };

    const handleCloseJob = () => {
        setShowCloseModal(true);
    };

    const confirmCloseJob = () => {
        setIsClosed(true);
        setShowCloseModal(false);
        // Navigate back to jobs page after closing
        if (onBack) {
            onBack();
        } else if (location.pathname.includes('/marketplace')) {
            navigate('/admin/marketplace');
        } else {
            navigate('/recruiter-dashboard', { state: { activeTab: 'jobs' } });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
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
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isPublished
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}>
                                {isPublished ? 'Published' : 'Unpublished'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span>{job.vessel}</span>
                            <span>•</span>
                            <span>Posted {job.posted}</span>
                        </div>
                    </div>

                    {/* Action Buttons - Hide for Admin Marketplace */}
                    {!location.pathname.includes('/marketplace/') && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePauseToggle}
                                className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg font-semibold transition-colors ${isPaused
                                    ? 'border-green-300 text-green-600 hover:bg-green-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Pause className="h-4 w-4" />
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            {!isPublished && (
                                <button
                                    onClick={handlePublishToggle}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="h-4 w-4" />
                                    Publish
                                </button>
                            )}
                            {!isClosed && (
                                <button
                                    onClick={handleCloseJob}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-red-300 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors"
                                >
                                    <XIcon className="h-4 w-4" />
                                    Close Job
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 px-6 pb-6">
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
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'new' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                New ({allApplicants.filter(a => a.status === 'new').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('matches')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'matches' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Matches ({allApplicants.filter(a => a.status === 'matches').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('shortlisted')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'shortlisted' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Shortlisted ({allApplicants.filter(a => a.status === 'shortlisted').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('interviewing')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'interviewing' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Interviewing ({allApplicants.filter(a => a.status === 'interviewing').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('offered')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'offered' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Offered ({allApplicants.filter(a => a.status === 'offered').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('hired')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'hired' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Hired ({allApplicants.filter(a => a.status === 'hired').length})
                            </button>
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
                                        Applicants {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                                {sortedApplicants.map((applicant, idx) => (
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
                                                                : `/admin/candidate/${applicant.id}`;
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
                                                {activeTab === 'new' && (
                                                    <button
                                                        onClick={() => {
                                                            const candidateRoute = location.pathname.includes('/marketplace')
                                                                ? `/admin/marketplace/candidate/${applicant.id}`
                                                                : `/admin/candidate/${applicant.id}`;
                                                            navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                        }}
                                                        className="text-blue-600 font-semibold hover:underline text-sm"
                                                    >
                                                        View Profile
                                                    </button>
                                                )}
                                                {activeTab === 'matches' && (
                                                    invitedApplicants.includes(applicant.id) ? (
                                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold">
                                                            Invited
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleInviteToApply(applicant.id)}
                                                            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                                                        >
                                                            Invite to Apply
                                                        </button>
                                                    )
                                                )}
                                                {activeTab === 'shortlisted' && (
                                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
                                                        Shortlisted
                                                    </span>
                                                )}
                                                {activeTab === 'interviewing' && (
                                                    <button className="px-3 py-1.5 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors">
                                                        Schedule Interview
                                                    </button>
                                                )}
                                                {activeTab === 'offered' && (
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                                                        Offer Sent
                                                    </span>
                                                )}
                                                {activeTab === 'hired' && (
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
                </div>

                {/* Publish/Unpublish Modal */}
                {showPublishModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {isPublished ? 'Unpublish Job?' : 'Publish Job?'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {isPublished
                                    ? 'Are you sure you want to unpublish this job? It will no longer be visible to candidates.'
                                    : 'Are you sure you want to publish this job? It will be visible to all candidates on the platform.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPublishModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPublishToggle}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isPublished
                                        ? 'bg-gray-700 text-white hover:bg-gray-800'
                                        : 'bg-[#003971] text-white hover:bg-[#002855]'
                                        }`}
                                >
                                    {isPublished ? 'Unpublish' : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pause/Resume Modal */}
                {showPauseModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {isPaused ? 'Resume Job?' : 'Pause Job?'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {isPaused
                                    ? 'Are you sure you want to resume this job? It will start accepting new applications again.'
                                    : 'Are you sure you want to pause this job? New applications will not be accepted until you resume it.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPauseModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPauseToggle}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isPaused
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                        }`}
                                >
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Close Job Modal */}
                {showCloseModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Close Job?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to close this job? This action cannot be undone. The job will be archived and will no longer accept applications.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCloseModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmCloseJob}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Close Job
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobDetail;
