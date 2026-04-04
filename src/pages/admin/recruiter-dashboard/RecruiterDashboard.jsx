import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Award,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Search,
    RefreshCw
} from 'lucide-react';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import { useKycWizard } from '../../../hooks/useKycWizard';
import jobService from '../../../services/jobService';

function RecruiterDashboard({ onNavigate }) {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('Today');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Remote data states
    const [realJobs, setRealJobs] = useState([]);
    const [dashStats, setDashStats] = useState({
        activeJobs: 0,
        newApplications: 0,
        matchedPros: 0,
        jobsNeedingAttention: 0
    });

    const {
        kycStatus,
        isKycUnderReview,
        hasFullAccess,
        ui: {
            showVerifyIdentityModal,
            showSelectDocumentModal,
            showUploadDocumentModal,
            showVerifyDetailsModal,
            showTakeSelfieModal,
            showProcessingModal,
            showVerificationSubmittedModal,
            selectedDocumentType,
            kycData,
        },
        actions: {
            handleStartVerification,
            handleSelectDocument,
            handleDocumentUploaded,
            handleDetailsVerified,
            handleSelfieTaken,
            handleVerificationComplete,
            handleSkipVerification,
        },
    } = useKycWizard({ userType: 'recruiter', storagePrefix: 'recruiter' });

    // Refresh handler
    const loadDashboardData = async () => {
        if (!hasFullAccess) return;
        setIsRefreshing(true);
        try {
            const res = await jobService.getMyJobs();
            if (res?.data?.jobs) {
                const jobsList = res.data.jobs;
                setRealJobs(jobsList);
                
                // Calculate stats based on actual data
                const activeCount = jobsList.filter(j => j.status === 'ACTIVE').length;
                let attentionCount = 0;
                let newApps = 0;
                
                const now = new Date();
                jobsList.forEach(j => {
                    if (j.status === 'DRAFT') { 
                        attentionCount++; 
                    } else if (j.status === 'ACTIVE' && j.closingDate) {
                        const daysLeft = (new Date(j.closingDate) - now) / (1000 * 60 * 60 * 24);
                        if (daysLeft <= 7 && daysLeft >= 0) attentionCount++;
                    }
                    
                    if (j.applicants && Array.isArray(j.applicants)) {
                        newApps += j.applicants.length;
                    }
                });

                setDashStats({
                    activeJobs: activeCount,
                    newApplications: newApps,
                    matchedPros: 0, // Placeholder
                    jobsNeedingAttention: attentionCount
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [hasFullAccess]);

    const handleRefresh = () => {
        loadDashboardData();
    };

    const handleNavigate = (section) => {
        if (onNavigate) {
            onNavigate(section);
        } else {
            // Map sections to routes
            const routeMap = {
                'jobs': '/admin/jobs',
                'search': '/admin/search',
                'chats': '/admin/chats',
                'settings': '/admin/settings'
            };
            if (routeMap[section]) {
                navigate(routeMap[section]);
            }
        }
    };

    // Get current stats using dynamic data
    const stats = [
        { id: 1, title: 'Active Jobs', value: dashStats.activeJobs.toString(), subtext: 'Currently open', icon: Briefcase, gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#4a7ab8]', iconBg: 'bg-white/20 backdrop-blur-sm', section: 'jobs' },
        { id: 2, title: 'Total Applications', value: dashStats.newApplications.toString(), subtext: 'All time', icon: CheckCircle, gradient: 'from-[#059669] via-[#10b981] to-[#34d399]', iconBg: 'bg-white/20 backdrop-blur-sm', section: 'jobs' },
        { id: 3, title: 'Matched Professionals', value: dashStats.matchedPros.toString(), subtext: 'System matches', icon: Award, gradient: 'from-[#d97706] via-[#f59e0b] to-[#fbbf24]', iconBg: 'bg-white/20 backdrop-blur-sm', section: 'search' },
        { id: 4, title: 'Jobs Needing Attention', value: dashStats.jobsNeedingAttention.toString(), subtext: 'Expiring soon / Drafts', icon: AlertTriangle, gradient: 'from-[#dc2626] via-[#ef4444] to-[#f87171]', iconBg: 'bg-white/20 backdrop-blur-sm', topIcon: Calendar, section: 'jobs' }
    ];

    // Action Items Data (Static placeholders mapped to generic sections)
    const actionItems = [
        {
            id: 1,
            text: 'Review new professionals applied through MaritimeLink',
            type: 'applicants',
            icon: Briefcase,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-[#EBF3FF]',
            actionText: 'View Dashboard',
            section: 'jobs',
        },
        {
            id: 2,
            text: 'Discover matched professionals for your active jobs',
            type: 'matches',
            icon: Search,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-[#EBF3FF]',
            actionText: 'Search Pros',
            section: 'search'
        }
    ];

    // Popular Searches
    const popularSearches = [
        'Chief Engineer',
        '3rd Officer',
        'Offshore Supply Vessel'
    ];

    // Handle popular search click
    const handlePopularSearchClick = (searchTerm) => {
        if (onNavigate) {
            onNavigate('search');
        } else {
            navigate('/admin/search', { state: { searchQuery: searchTerm } });
        }
    };

    const isPreKyc = !kycStatus || kycStatus === 'pending' || kycStatus === 'rejected' || kycStatus === 'skipped';

    const renderKycGate = () => {
        if (isKycUnderReview) {
            return (
                <div className="h-full flex items-center justify-center p-8">
                    <div className="max-w-2xl text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#003971] mb-4">
                            Welcome to MaritimeLink
                        </h1>
                        <p className="text-gray-600 mb-2">Thanks for submitting your KYC details.</p>
                        <p className="text-gray-500">
                            Your information and documents are currently under review by our team.
                            Once verification is complete, you will be granted full access to your recruiter dashboard.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="max-w-2xl text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#003971]">
                        Welcome to MaritimeLink
                    </h1>
                    <p className="text-gray-600">Thanks for joining us.</p>
                    <p className="text-gray-500">
                        To protect your company and professionals on the platform, we need to verify your identity
                        and company details. Complete your KYC to unlock all recruiter features.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={handleStartVerification}
                            className="inline-flex items-center px-6 py-3 rounded-full bg-[#003971] text-white font-semibold text-sm hover:bg-[#002855] transition-colors"
                        >
                            Start verification
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto px-8 py-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-gray-600 text-sm">
                        Welcome back, John <span className="text-gray-400">Sunday, January 11, 2026</span>
                    </p>
                </div>

                {/* Time Filter */}
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex shadow-sm">
                        {['Today', '7 Days', '1 Month', 'Custom'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${timeFilter === filter
                                    ? 'bg-[#003971] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {hasFullAccess ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <div
                                key={stat.id}
                                className={`bg-gradient-to-br ${stat.gradient} rounded-[28px] p-7 text-white shadow-xl relative overflow-hidden`}
                            >
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-3 rounded-2xl ${stat.iconBg}`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                        {stat.topIcon && (
                                            <stat.topIcon className="h-5 w-5 text-white/40" />
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-4xl font-extrabold mb-2 tracking-tight">{stat.value}</div>
                                        <div className="font-bold text-base leading-snug mb-1">{stat.title}</div>
                                        <div className="text-sm text-white/70 font-medium">{stat.subtext}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Action Required */}
                        <div className="flex-1 space-y-5">
                            <h2 className="text-lg font-bold text-gray-900">Action Required</h2>

                            <div className="space-y-4">
                                {actionItems.map((item) => (
                                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`p-3 rounded-xl ${item.iconBg} flex-shrink-0`}>
                                                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                            </div>
                                            <span className="text-gray-900 font-medium text-sm">{item.text}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (item.jobId) {
                                                    if (item.isEdit) {
                                                        navigate('/admin/upload-job', { state: { jobId: item.jobId, isEdit: true, dashboardType: 'recruiter' } });
                                                    } else {
                                                        navigate(`/admin/jobs/${item.jobId}`);
                                                    }
                                                } else {
                                                    handleNavigate(item.section);
                                                }
                                            }}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${item.secondaryAction
                                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                                : 'bg-[#003971] text-white hover:bg-[#002855]'
                                                } flex items-center gap-2`}>
                                            {item.actionText}
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Insights */}
                        <div className="lg:w-1/3">
                            <div className="bg-gray-50/70 rounded-2xl p-6 h-full border border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="text-orange-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-sm font-bold text-gray-900">Insight: Popular Searches</h2>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                    {popularSearches.map((search, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handlePopularSearchClick(search)}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 font-bold text-sm w-4">{index + 1}.</span>
                                                <span className="text-gray-900 font-bold text-sm">{search}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs at a Glance */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Your Jobs at a Glance</h2>
                            <button
                                onClick={() => handleNavigate('jobs')}
                                className="text-sm font-bold text-[#003971] hover:underline flex items-center gap-1"
                            >
                                View All Jobs &gt;
                            </button>
                        </div>

                        <div className="divide-y divide-gray-50">
                            <div className="grid grid-cols-12 px-8 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6">Job Title</div>
                                <div className="col-span-3">Status / Applicants</div>
                                <div className="col-span-3 text-right">Matches (Not Applied)</div>
                            </div>

                            {realJobs.slice(0, 5).map((job) => {
                                const formattedStatus = job.status === 'ACTIVE' ? 'Active' : (job.status === 'DRAFT' ? 'Draft' : 'Closed');
                                const displayCategory = job.category 
                                    ? job.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) 
                                    : 'Category';
                                const contractType = job.contractType 
                                    ? job.contractType.charAt(0) + job.contractType.slice(1).toLowerCase() 
                                    : 'Permanent';
                                
                                return (
                                <div key={job.id} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                    <div className="col-span-6 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-500">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                                className="text-sm font-bold text-gray-900 mb-0.5 hover:text-blue-600 text-left"
                                            >
                                                {job.title}
                                            </button>
                                            <p className="text-xs text-gray-500 font-medium">{contractType} / {displayCategory}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${formattedStatus === 'Active'
                                            ? 'bg-teal-50 text-teal-600'
                                            : formattedStatus === 'Draft'
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {formattedStatus}
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex justify-end">
                                        {formattedStatus === 'Draft' ? (
                                            <button
                                                onClick={() => navigate('/admin/upload-job', { state: { jobData: job, isEdit: true, dashboardType: 'recruiter' } })}
                                                className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-700 transition-colors"
                                            >
                                                Edit Draft
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                                className="bg-[#003971] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2"
                                            >
                                                {job.applicants?.length || 0} <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )})}
                            
                            {realJobs.length === 0 && (
                                <div className="text-center py-10">
                                    <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium pb-2">No jobs found in your account.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-5 border-t border-gray-100 text-center">
                            <button
                                onClick={() => handleNavigate('jobs')}
                                className="text-sm font-bold text-[#003971] hover:underline flex items-center justify-center gap-1 w-full"
                            >
                                View All Jobs <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                renderKycGate()
            )}

            {/* KYC Modals */}
            <VerifyIdentityModal
                isOpen={showVerifyIdentityModal}
                onClose={handleSkipVerification}
                onStartVerification={handleStartVerification}
            />
            <SelectDocumentModal
                isOpen={showSelectDocumentModal}
                onClose={() => setShowSelectDocumentModal(false)}
                onSelectDocument={handleSelectDocument}
            />
            <UploadDocumentModal
                isOpen={showUploadDocumentModal}
                onClose={() => setShowUploadDocumentModal(false)}
                onUploadComplete={handleDocumentUploaded}
                documentType={selectedDocumentType}
                userType="recruiter"
            />
            <VerifyDetailsModal
                isOpen={showVerifyDetailsModal}
                onClose={() => setShowVerifyDetailsModal(false)}
                onConfirm={handleDetailsVerified}
                initialData={kycData}
                documentType={selectedDocumentType}
            />
            <TakeSelfieModal
                isOpen={showTakeSelfieModal}
                onClose={() => setShowTakeSelfieModal(false)}
                onSelfieTaken={handleSelfieTaken}
            />
            <ProcessingDocumentModal
                isOpen={showProcessingModal}
            />
            <VerificationSubmittedModal
                isOpen={showVerificationSubmittedModal}
                onClose={handleVerificationComplete}
            />
        </div>
    );
}

export default RecruiterDashboard;