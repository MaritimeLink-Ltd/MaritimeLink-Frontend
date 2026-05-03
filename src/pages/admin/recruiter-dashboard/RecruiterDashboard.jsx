import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Award,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Search,
    RefreshCw,
    Bell,
} from 'lucide-react';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import { useKycWizard } from '../../../hooks/useKycWizard';
import recruiterDashboardService from '../../../services/recruiterDashboardService';

function toDateInputValue(d) {
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function defaultCustomRange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

function getStatsQueryOptions(timeFilter, customFrom, customTo) {
    if (timeFilter === 'Today') return { timeframe: 'today' };
    if (timeFilter === '7 Days') return { timeframe: '7d' };
    if (timeFilter === '1 Month') return { timeframe: '1m' };
    if (timeFilter === 'Custom') {
        if (customFrom && customTo) return { from: customFrom, to: customTo };
        return { timeframe: '1m' };
    }
    return { timeframe: 'today' };
}

function formatStatsPeriodLabel(timeFilter, customFrom, customTo) {
    if (timeFilter === 'Today') return 'Today';
    if (timeFilter === '7 Days') return 'Last 7 days';
    if (timeFilter === '1 Month') return 'Last 30 days';
    if (timeFilter === 'Custom' && customFrom && customTo) {
        try {
            const a = new Date(`${customFrom}T12:00:00`);
            const b = new Date(`${customTo}T12:00:00`);
            if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 'Custom range';
            const opts = { month: 'short', day: 'numeric', year: 'numeric' };
            return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}`;
        } catch {
            return 'Custom range';
        }
    }
    return 'Custom range';
}

function readRecruiterDashboardHeaderUser() {
    try {
        const raw = localStorage.getItem('userProfile');
        const savedPhoto = localStorage.getItem('profileImage');
        const userEmail = localStorage.getItem('userEmail') || '';
        const profile = raw ? JSON.parse(raw) : {};
        const firstName = String(profile.firstName || '').trim();
        const lastName = String(profile.lastName || '').trim();
        const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() ||
            String(profile.fullName || profile.name || '').trim();
        const email = profile.email || userEmail;
        const organizationName = String(profile.organizationName || profile.companyName || '').trim();
        const welcomeName =
            firstName ||
            (fullName ? fullName.split(/\s+/)[0] : '') ||
            (email ? email.split('@')[0] : '');
        return {
            welcomeLine: welcomeName ? `Welcome back, ${welcomeName}` : 'Welcome back',
            dateLabel: new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            displayName: fullName || email || 'Recruiter',
            avatarUrl:
                savedPhoto ||
                profile.profilePhoto ||
                profile.profilePhotoUrl ||
                profile.photo ||
                null,
            subtitle: organizationName || 'Recruiter',
        };
    } catch {
        return {
            welcomeLine: 'Welcome back',
            dateLabel: new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            displayName: 'Recruiter',
            avatarUrl: null,
            subtitle: 'Recruiter',
        };
    }
}

function actionItemButtonLabel(action) {
    const a = (action || '').toUpperCase();
    if (a === 'VIEW_APPLICANTS') return 'Review applicants';
    if (a === 'VIEW_MATCHES') return 'View matches';
    return 'Open';
}

function getDashboardJobApplicantCount(job) {
    if (job == null) return 0;
    if (typeof job.applicantCount === 'number') return job.applicantCount;
    if (job._count && typeof job._count.applications === 'number') return job._count.applications;
    if (Array.isArray(job.applicants)) return job.applicants.length;
    return 0;
}

function getDashboardJobMatchedCount(job) {
    if (job == null || job.matchedCount == null) return 0;
    const n = Number(job.matchedCount);
    return Number.isFinite(n) ? n : 0;
}

function mapDashboardActionItem(item, index) {
    const type = (item?.type || '').toUpperCase();
    let icon = Bell;
    if (type === 'NEW_APPLICANTS') icon = Briefcase;
    else if (type === 'MATCHED_PROFESSIONALS') icon = Search;

    return {
        rowKey: `${type}-${item?.jobId || 'no-job'}-${item?.category || 'nc'}-${index}`,
        message: item?.message || 'Action needed',
        icon,
        jobId: item?.jobId,
        category: item?.category,
        apiAction: item?.action,
        actionText: actionItemButtonLabel(item?.action),
    };
}

function RecruiterDashboard({ onNavigate }) {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('Today');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const initialCustom = useMemo(() => defaultCustomRange(), []);
    const [customRangeApplied, setCustomRangeApplied] = useState(initialCustom);
    const [customRangeDraft, setCustomRangeDraft] = useState(initialCustom);
    const [statsError, setStatsError] = useState(null);
    const [jobsError, setJobsError] = useState(null);
    const [actionItemsList, setActionItemsList] = useState([]);
    const [actionItemsError, setActionItemsError] = useState(null);
    const [actionItemsLoading, setActionItemsLoading] = useState(false);
    const [headerUser, setHeaderUser] = useState(() => readRecruiterDashboardHeaderUser());

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
            setShowSelectDocumentModal,
            setShowUploadDocumentModal,
            setShowVerifyDetailsModal,
            setShowTakeSelfieModal,
        },
    } = useKycWizard({ userType: 'recruiter', storagePrefix: 'recruiter' });

    useEffect(() => {
        const syncHeaderUser = () => setHeaderUser(readRecruiterDashboardHeaderUser());
        window.addEventListener('storage', syncHeaderUser);
        window.addEventListener('profileUpdated', syncHeaderUser);
        window.addEventListener('profileImageUpdated', syncHeaderUser);
        return () => {
            window.removeEventListener('storage', syncHeaderUser);
            window.removeEventListener('profileUpdated', syncHeaderUser);
            window.removeEventListener('profileImageUpdated', syncHeaderUser);
        };
    }, []);

    const loadDashboardData = useCallback(async () => {
        if (!hasFullAccess) return;
        setIsRefreshing(true);
        setActionItemsLoading(true);
        setStatsError(null);
        setJobsError(null);
        setActionItemsError(null);
        try {
            const statsQuery = getStatsQueryOptions(
                timeFilter,
                customRangeApplied.from,
                customRangeApplied.to
            );
            const [jobsOutcome, statsOutcome, actionsOutcome] = await Promise.allSettled([
                recruiterDashboardService.getDashboardJobs(),
                recruiterDashboardService.getDashboardStats(statsQuery),
                recruiterDashboardService.getDashboardActionItems(),
            ]);

            if (jobsOutcome.status === 'fulfilled') {
                const res = jobsOutcome.value;
                const list = res?.data?.jobs;
                setRealJobs(Array.isArray(list) ? list : []);
            } else {
                console.error('Failed to fetch dashboard jobs:', jobsOutcome.reason);
                setJobsError(jobsOutcome.reason?.message || 'Could not load jobs.');
                setRealJobs([]);
            }

            if (statsOutcome.status === 'fulfilled') {
                const res = statsOutcome.value;
                const s = res?.data?.stats;
                if (s && typeof s === 'object') {
                    setDashStats({
                        activeJobs: Number(s.activeJobsCount) || 0,
                        newApplications: Number(s.newApplicationsCount) || 0,
                        matchedPros: Number(s.matchedProfessionalsCount) || 0,
                        jobsNeedingAttention: Number(s.jobsNeedingAttentionCount) || 0,
                    });
                }
            } else {
                console.error('Failed to fetch recruiter stats:', statsOutcome.reason);
                setStatsError(
                    statsOutcome.reason?.message || 'Could not load dashboard stats.'
                );
            }

            if (actionsOutcome.status === 'fulfilled') {
                const res = actionsOutcome.value;
                const list = res?.data?.actionItems;
                setActionItemsList(Array.isArray(list) ? list : []);
            } else {
                console.error('Failed to fetch action items:', actionsOutcome.reason);
                setActionItemsError(
                    actionsOutcome.reason?.message || 'Could not load action items.'
                );
                setActionItemsList([]);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsRefreshing(false);
            setActionItemsLoading(false);
        }
    }, [hasFullAccess, timeFilter, customRangeApplied.from, customRangeApplied.to]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

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
                'search': '/recruiter/search',
                'chats': '/admin/chats',
                'settings': '/recruiter/settings'
            };
            if (routeMap[section]) {
                navigate(routeMap[section]);
            }
        }
    };

    const handleActionItemNavigate = useCallback(
        (row) => {
            const act = (row.apiAction || '').toUpperCase();
            if (act === 'VIEW_APPLICANTS' && row.jobId) {
                navigate(`/admin/jobs/${row.jobId}`, { state: { initialAtsTab: 'new' } });
                return;
            }
            if (act === 'VIEW_MATCHES' && row.jobId) {
                navigate(`/admin/jobs/${row.jobId}`, { state: { initialAtsTab: 'matches' } });
                return;
            }
            if (act === 'VIEW_MATCHES' && row.category) {
                const label = String(row.category).replace(/_/g, ' ');
                navigate('/recruiter/search', { state: { searchQuery: label } });
                return;
            }
            if (row.jobId) {
                navigate(`/admin/jobs/${row.jobId}`);
                return;
            }
            if (onNavigate) {
                onNavigate('jobs');
            } else {
                navigate('/admin/jobs');
            }
        },
        [navigate, onNavigate]
    );

    const derivedActionRows = useMemo(
        () => actionItemsList.map((item, index) => mapDashboardActionItem(item, index)),
        [actionItemsList]
    );

    const periodLabel = useMemo(
        () =>
            formatStatsPeriodLabel(
                timeFilter,
                customRangeApplied.from,
                customRangeApplied.to
            ),
        [timeFilter, customRangeApplied.from, customRangeApplied.to]
    );

    const stats = useMemo(
        () => [
            {
                id: 1,
                title: 'Active Jobs',
                value: dashStats.activeJobs.toString(),
                subtext: periodLabel,
                icon: Briefcase,
                gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#4a7ab8]',
                iconBg: 'bg-white/20 backdrop-blur-sm',
                section: 'jobs',
            },
            {
                id: 2,
                title: 'Applications',
                value: dashStats.newApplications.toString(),
                subtext: periodLabel,
                icon: CheckCircle,
                gradient: 'from-[#059669] via-[#10b981] to-[#34d399]',
                iconBg: 'bg-white/20 backdrop-blur-sm',
                section: 'jobs',
            },
            {
                id: 3,
                title: 'Matched Professionals',
                value: dashStats.matchedPros.toString(),
                subtext: periodLabel,
                icon: Award,
                gradient: 'from-[#d97706] via-[#f59e0b] to-[#fbbf24]',
                iconBg: 'bg-white/20 backdrop-blur-sm',
                section: 'search',
            },
            {
                id: 4,
                title: 'Jobs Needing Attention',
                value: dashStats.jobsNeedingAttention.toString(),
                subtext: periodLabel,
                icon: AlertTriangle,
                gradient: 'from-[#dc2626] via-[#ef4444] to-[#f87171]',
                iconBg: 'bg-white/20 backdrop-blur-sm',
                topIcon: Calendar,
                section: 'jobs',
            },
        ],
        [dashStats, periodLabel]
    );

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
                        {headerUser.welcomeLine}{' '}
                        <span className="text-gray-400">{headerUser.dateLabel}</span>
                    </p>
                </div>

                {/* Time Filter */}
                <div className="flex flex-col items-stretch sm:items-end gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex flex-wrap shadow-sm">
                            {['Today', '7 Days', '1 Month', 'Custom'].map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => {
                                        setTimeFilter(filter);
                                        if (filter === 'Custom') {
                                            setCustomRangeDraft({ ...customRangeApplied });
                                        }
                                    }}
                                    className={`px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                        timeFilter === filter
                                            ? 'bg-[#003971] text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-center"
                        >
                            <RefreshCw className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    {timeFilter === 'Custom' && (
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                                From
                                <input
                                    type="date"
                                    value={customRangeDraft.from}
                                    onChange={(e) =>
                                        setCustomRangeDraft((d) => ({ ...d, from: e.target.value }))
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                                To
                                <input
                                    type="date"
                                    value={customRangeDraft.to}
                                    onChange={(e) =>
                                        setCustomRangeDraft((d) => ({ ...d, to: e.target.value }))
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!customRangeDraft.from || !customRangeDraft.to) return;
                                    if (customRangeDraft.from > customRangeDraft.to) return;
                                    setCustomRangeApplied({
                                        from: customRangeDraft.from,
                                        to: customRangeDraft.to,
                                    });
                                }}
                                className="sm:ml-1 px-4 py-2.5 rounded-xl bg-[#003971] text-white text-sm font-semibold hover:bg-[#002855] transition-colors self-start"
                            >
                                Apply range
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {statsError && hasFullAccess && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {statsError}
                </p>
            )}

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

                    <div className="space-y-5">
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
                            {actionItemsError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                                    {actionItemsError}
                                </p>
                            )}

                            <div className="space-y-4">
                                {actionItemsLoading ? (
                                    [1, 2].map((k) => (
                                        <div
                                            key={k}
                                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 animate-pulse"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="h-11 w-11 rounded-xl bg-gray-200 shrink-0" />
                                                <div className="h-4 bg-gray-200 rounded flex-1 max-w-md" />
                                            </div>
                                            <div className="h-10 w-36 rounded-xl bg-gray-200 shrink-0" />
                                        </div>
                                    ))
                                ) : derivedActionRows.length === 0 ? (
                                    <p className="text-sm text-gray-500 bg-white border border-gray-100 rounded-2xl px-5 py-6">
                                        No urgent actions right now.
                                    </p>
                                ) : (
                                    derivedActionRows.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.rowKey}
                                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="p-3 rounded-xl bg-[#EBF3FF] flex-shrink-0">
                                                        <Icon className="h-5 w-5 text-[#003971]" />
                                                    </div>
                                                    <span className="text-gray-900 font-medium text-sm">
                                                        {item.message}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleActionItemNavigate(item)}
                                                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap bg-[#003971] text-white hover:bg-[#002855] flex items-center gap-2"
                                                >
                                                    {item.actionText}
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
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
                        {jobsError && (
                            <div className="px-8 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
                                {jobsError}
                            </div>
                        )}

                        <div className="divide-y divide-gray-50">
                            <div className="grid grid-cols-12 px-8 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6">Job Title</div>
                                <div className="col-span-3">Status / Applicants</div>
                                <div className="col-span-3 text-right">Matches (Not Applied)</div>
                            </div>

                            {realJobs.slice(0, 5).map((job) => {
                                const statusRaw = (job.status || '').toUpperCase();
                                const formattedStatus =
                                    statusRaw === 'ACTIVE'
                                        ? 'Active'
                                        : statusRaw === 'DRAFT'
                                          ? 'Draft'
                                          : 'Closed';
                                const displayCategory = job.category
                                    ? job.category
                                          .replace(/_/g, ' ')
                                          .toLowerCase()
                                          .replace(/\b\w/g, (l) => l.toUpperCase())
                                    : 'Category';
                                const contractType = job.contractType
                                    ? job.contractType.charAt(0) +
                                      job.contractType.slice(1).toLowerCase()
                                    : 'Permanent';
                                const applicantCount = getDashboardJobApplicantCount(job);
                                const matchedCount = getDashboardJobMatchedCount(job);

                                return (
                                    <div
                                        key={job.id}
                                        className="grid grid-cols-12 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors border-b border-gray-50"
                                    >
                                        <div className="col-span-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-500">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                                    className="text-sm font-bold text-gray-900 mb-0.5 hover:text-blue-600 text-left"
                                                >
                                                    {job.title}
                                                </button>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {contractType} / {displayCategory}
                                                </p>
                                                {job.location && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {job.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex flex-col gap-2 items-start justify-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${
                                                    formattedStatus === 'Active'
                                                        ? 'bg-teal-50 text-teal-600'
                                                        : formattedStatus === 'Draft'
                                                          ? 'bg-orange-50 text-orange-600'
                                                          : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {formattedStatus}
                                            </span>
                                            {formattedStatus === 'Draft' ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate('/admin/upload-job', {
                                                            state: {
                                                                jobData: job,
                                                                isEdit: true,
                                                                dashboardType: 'recruiter',
                                                            },
                                                        })
                                                    }
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-700 transition-colors"
                                                >
                                                    Edit Draft
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(`/admin/jobs/${job.id}`, {
                                                            state: { initialAtsTab: 'new' },
                                                        })
                                                    }
                                                    className="bg-[#003971] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2"
                                                >
                                                    {applicantCount}{' '}
                                                    {applicantCount === 1 ? 'applicant' : 'applicants'}
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="col-span-3 flex flex-col items-end justify-center gap-0.5">
                                            <span className="text-2xl font-extrabold text-gray-900 tabular-nums">
                                                {matchedCount}
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold">
                                                Matches (not applied)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            
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
