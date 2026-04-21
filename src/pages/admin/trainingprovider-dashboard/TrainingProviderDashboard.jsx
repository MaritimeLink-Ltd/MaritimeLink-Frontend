import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    BookOpen,
    Calendar,
    TrendingUp,
    Users,
    Clock,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import { useKycWizard } from '../../../hooks/useKycWizard';
import trainerDashboardService from '../../../services/trainerDashboardService';

function initialsFromDisplayName(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return '?';
}

function readTrainerDashboardHeaderUser() {
    try {
        const raw = localStorage.getItem('userProfile');
        const savedPhoto = localStorage.getItem('profileImage');
        const userEmail = localStorage.getItem('userEmail') || '';
        const profile = raw ? JSON.parse(raw) : {};
        const firstName = String(profile.firstName || '').trim();
        const lastName = String(profile.lastName || '').trim();
        const fullName = [firstName, lastName]
            .filter(Boolean)
            .join(' ')
            .trim() ||
            String(profile.fullName || profile.name || '').trim();
        const email = profile.email || userEmail;
        const photo =
            savedPhoto ||
            profile.profilePhoto ||
            profile.profilePhotoUrl ||
            profile.photo ||
            null;
        const jobTitle = String(profile.jobTitle || profile.position || '').trim();
        const company = String(profile.companyName || profile.company || '').trim();
        const subtitle = jobTitle || company || 'Training provider';
        const welcomeFirst =
            firstName ||
            (fullName ? fullName.split(/\s+/)[0] : '') ||
            (email ? email.split('@')[0] : '');
        const displayName = fullName || email || 'Training provider';
        return {
            welcomeLine: welcomeFirst ? `Welcome, ${welcomeFirst}` : 'Welcome',
            displayName,
            subtitle,
            avatarUrl: photo,
        };
    } catch {
        return {
            welcomeLine: 'Welcome',
            displayName: 'Training provider',
            subtitle: 'Training provider',
            avatarUrl: null,
        };
    }
}

function getTrainerStatsQuery(timeFilter) {
    if (timeFilter === 'Today') return { timeframe: 'today' };
    if (timeFilter === '7 Days') return { timeframe: '7d' };
    if (timeFilter === '30 Days') return { timeframe: '30d' };
    if (timeFilter === 'All') return {};
    return { timeframe: '7d' };
}

function trainerStatsPeriodLabel(timeFilter) {
    if (timeFilter === 'Today') return 'Today';
    if (timeFilter === '7 Days') return 'Last 7 days';
    if (timeFilter === '30 Days') return 'Last 30 days';
    if (timeFilter === 'All') return 'All time';
    return '';
}

function getTrainerActionItemPath(type, action, courseIds) {
    const t = (type || '').toUpperCase();
    const a = (action || '').toUpperCase();
    const ids = Array.isArray(courseIds) ? courseIds.filter(Boolean) : [];

    if (a === 'VIEW_BOOKINGS') return '/trainingprovider/bookings';
    if (a === 'VIEW_DEMAND') return '/trainingprovider/demand';
    if (a === 'ADD_SESSION') {
        if (t === 'HIGH_DEMAND') return '/trainingprovider/demand';
        if (ids.length === 1) return `/trainingprovider/courses/${ids[0]}/sessions`;
        return '/trainingprovider/courses';
    }
    if (ids.length === 1) return `/trainingprovider/courses/${ids[0]}`;
    return '/trainingprovider/courses';
}

function getTrainerActionButton(type, action) {
    const t = (type || '').toUpperCase();
    const a = (action || '').toUpperCase();
    const primary = 'bg-[#003971] text-white hover:bg-[#002455]';
    const outline = 'bg-white text-orange-600 border-2 border-orange-200 hover:bg-orange-50';

    if (a === 'VIEW_BOOKINGS') return { hasButton: true, text: 'View bookings', style: primary };
    if (a === 'VIEW_DEMAND') return { hasButton: true, text: 'View demand', style: primary };
    if (a === 'ADD_SESSION') {
        if (t === 'HIGH_DEMAND') return { hasButton: true, text: 'View demand', style: primary };
        return { hasButton: true, text: 'Add session', style: outline };
    }
    return { hasButton: false, text: '', style: '' };
}

function buildTrainerActionSubtitle(item) {
    const ids = item?.courseIds;
    if (Array.isArray(ids) && ids.length > 1) return `${ids.length} courses linked`;
    if (Array.isArray(ids) && ids.length === 1) return 'Open sessions for this course';
    return '';
}

function mapTrainerDashboardCourse(apiCourse, index) {
    const id = apiCourse?.id ?? `course-${index}`;
    const name = apiCourse?.title || 'Course';
    const rawStatus = (apiCourse?.capacityStatus || '').trim();
    const statusLabel = rawStatus || '—';
    const norm = rawStatus.toUpperCase().replace(/\s+/g, '_');

    let icon = BookOpen;
    let iconColor = 'text-green-600';
    let iconBg = 'bg-green-50';
    let statusColor = 'bg-green-100 text-green-700';

    if (norm === 'NEARLY_FULL' || norm === 'NEARLYFULL') {
        icon = AlertCircle;
        iconColor = 'text-orange-600';
        iconBg = 'bg-orange-50';
        statusColor = 'bg-orange-100 text-orange-700';
    } else if (norm === 'FULL') {
        icon = AlertCircle;
        iconColor = 'text-red-600';
        iconBg = 'bg-red-50';
        statusColor = 'bg-red-100 text-red-700';
    } else if (norm === 'OPEN') {
        icon = BookOpen;
        iconColor = 'text-green-600';
        iconBg = 'bg-green-50';
        statusColor = 'bg-green-100 text-green-700';
    } else if (rawStatus) {
        icon = Users;
        iconColor = 'text-blue-600';
        iconBg = 'bg-blue-50';
        statusColor = 'bg-blue-100 text-blue-700';
    }

    const bookings = Number(apiCourse?.bookingsCount);
    const bookingsLabel = Number.isFinite(bookings) ? bookings : 0;
    const cap = apiCourse?.totalCapacity;
    const capNum = cap != null ? Number(cap) : NaN;
    const hasCap = Number.isFinite(capNum) && capNum > 0;
    const capacityDisplay = hasCap
        ? `${bookingsLabel} / ${capNum}`
        : `${bookingsLabel} booked`;

    return {
        id,
        name,
        icon,
        iconColor,
        iconBg,
        status: statusLabel,
        statusColor,
        capacity: capacityDisplay,
    };
}

function mapTrainerActionRow(item, index) {
    const type = (item?.type || '').toUpperCase();
    const action = (item?.action || '').toUpperCase();
    const path = getTrainerActionItemPath(type, action, item?.courseIds);
    const btn = getTrainerActionButton(type, action);

    let icon = AlertCircle;
    let iconColor = 'text-gray-600';
    let iconBg = 'bg-gray-50';
    if (type === 'SESSIONS_NEEDED') {
        icon = Clock;
        iconColor = 'text-orange-600';
        iconBg = 'bg-orange-50';
    } else if (type === 'HIGH_DEMAND') {
        icon = TrendingUp;
        iconColor = 'text-blue-600';
        iconBg = 'bg-blue-50';
    } else if (type === 'LEARNERS_WAITING') {
        icon = Users;
        iconColor = 'text-blue-600';
        iconBg = 'bg-blue-50';
    }

    return {
        rowKey: `${type}-${action}-${index}`,
        icon,
        iconColor,
        iconBg,
        title: item?.message || 'Action needed',
        subtitle: buildTrainerActionSubtitle(item),
        path,
        hasButton: btn.hasButton,
        buttonText: btn.text,
        buttonStyle: btn.style,
    };
}

function TrainingProviderDashboard() {
    const navigate = useNavigate();
    const [headerUser, setHeaderUser] = useState(() => readTrainerDashboardHeaderUser());
    const [timeFilter, setTimeFilter] = useState('7 Days');
    const [trainerStats, setTrainerStats] = useState({
        activeCoursesCount: 0,
        newBookingsCount: 0,
        demandSignalsCount: 0,
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);
    const [actionItemsList, setActionItemsList] = useState([]);
    const [actionItemsLoading, setActionItemsLoading] = useState(false);
    const [actionItemsError, setActionItemsError] = useState(null);
    const [dashboardCoursesList, setDashboardCoursesList] = useState([]);
    const [dashboardCoursesLoading, setDashboardCoursesLoading] = useState(false);
    const [dashboardCoursesError, setDashboardCoursesError] = useState(null);

    const {
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
    } = useKycWizard({ userType: 'training-provider', storagePrefix: 'trainingProvider' });

    const timeFilters = ['Today', '7 Days', '30 Days', 'All'];

    const loadTrainerDashboard = useCallback(async () => {
        if (!hasFullAccess) return;
        setStatsLoading(true);
        setActionItemsLoading(true);
        setDashboardCoursesLoading(true);
        setStatsError(null);
        setActionItemsError(null);
        setDashboardCoursesError(null);
        try {
            const query = getTrainerStatsQuery(timeFilter);
            const [statsOutcome, actionsOutcome, coursesOutcome] = await Promise.allSettled([
                trainerDashboardService.getDashboardStats(query),
                trainerDashboardService.getDashboardActionItems(),
                trainerDashboardService.getDashboardCourses(),
            ]);

            if (statsOutcome.status === 'fulfilled') {
                const s = statsOutcome.value?.data?.stats;
                if (s && typeof s === 'object') {
                    setTrainerStats({
                        activeCoursesCount: Number(s.activeCoursesCount) || 0,
                        newBookingsCount: Number(s.newBookingsCount) || 0,
                        demandSignalsCount: Number(s.demandSignalsCount) || 0,
                    });
                }
            } else {
                console.error('Failed to fetch trainer dashboard stats:', statsOutcome.reason);
                setStatsError(statsOutcome.reason?.message || 'Could not load dashboard stats.');
            }

            if (actionsOutcome.status === 'fulfilled') {
                const list = actionsOutcome.value?.data?.actionItems;
                setActionItemsList(Array.isArray(list) ? list : []);
            } else {
                console.error('Failed to fetch trainer action items:', actionsOutcome.reason);
                setActionItemsError(
                    actionsOutcome.reason?.message || 'Could not load alerts and tasks.'
                );
                setActionItemsList([]);
            }

            if (coursesOutcome.status === 'fulfilled') {
                const list = coursesOutcome.value?.data?.courses;
                setDashboardCoursesList(Array.isArray(list) ? list : []);
            } else {
                console.error('Failed to fetch trainer dashboard courses:', coursesOutcome.reason);
                setDashboardCoursesError(
                    coursesOutcome.reason?.message || 'Could not load active courses.'
                );
                setDashboardCoursesList([]);
            }
        } finally {
            setStatsLoading(false);
            setActionItemsLoading(false);
            setDashboardCoursesLoading(false);
        }
    }, [hasFullAccess, timeFilter]);

    useEffect(() => {
        loadTrainerDashboard();
    }, [loadTrainerDashboard]);

    useEffect(() => {
        const syncHeader = () => setHeaderUser(readTrainerDashboardHeaderUser());
        syncHeader();
        window.addEventListener('storage', syncHeader);
        window.addEventListener('profileImageUpdated', syncHeader);
        return () => {
            window.removeEventListener('storage', syncHeader);
            window.removeEventListener('profileImageUpdated', syncHeader);
        };
    }, []);

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
                            Once verification is complete, you will be granted full access to your training provider dashboard.
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
                        Before you can manage courses and sessions, we need to complete a quick KYC
                        check for your training center. Complete verification to unlock all features.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={handleStartVerification}
                            className="inline-flex items-center px-6 py-3 rounded-full bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-colors"
                        >
                            Start verification
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const periodLabel = trainerStatsPeriodLabel(timeFilter);

    const statsCards = useMemo(() => {
        const fmt = (n) => (statsLoading ? '—' : String(n));
        return [
            {
                id: 1,
                title: 'Active Courses',
                value: fmt(trainerStats.activeCoursesCount),
                periodLabel,
                icon: BookOpen,
                bgGradient: 'from-[#1E4976] to-[#2E6BA8]',
                iconBg: 'bg-white/20',
                path: '/trainingprovider/courses',
            },
            {
                id: 2,
                title: 'New Bookings',
                value: fmt(trainerStats.newBookingsCount),
                periodLabel,
                icon: Calendar,
                bgGradient: 'from-[#0FA968] to-[#1BC47D]',
                iconBg: 'bg-white/20',
                path: '/trainingprovider/bookings',
            },
            {
                id: 3,
                title: 'Demand Signals',
                value: fmt(trainerStats.demandSignalsCount),
                periodLabel,
                icon: TrendingUp,
                bgGradient: 'from-[#E86C5F] to-[#F28B7D]',
                iconBg: 'bg-white/20',
                path: '/trainingprovider/demand',
            },
        ];
    }, [statsLoading, trainerStats, periodLabel]);

    const actionItems = useMemo(
        () => actionItemsList.map((item, index) => mapTrainerActionRow(item, index)),
        [actionItemsList]
    );

    const overviewCourses = useMemo(
        () => dashboardCoursesList.map((c, i) => mapTrainerDashboardCourse(c, i)),
        [dashboardCoursesList]
    );

    return (
        <div className="h-full pb-6">
            <div className="bg-[#F5F7FA] pb-4">
                {/* Welcome Section */}
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[28px] font-bold text-gray-900 mb-1">{headerUser.welcomeLine}</h1>
                            <p className="text-gray-500 text-sm">Your training operations at a glance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Time Filter */}
                            <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                                {timeFilters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setTimeFilter(filter)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timeFilter === filter
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                            <div className="text-right min-w-0 max-w-[200px]">
                                <p className="text-sm font-bold text-gray-900 truncate">{headerUser.displayName}</p>
                                <p className="text-xs text-gray-500 truncate">{headerUser.subtitle}</p>
                            </div>
                            {headerUser.avatarUrl ? (
                                <img
                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                    src={headerUser.avatarUrl}
                                    alt=""
                                />
                            ) : (
                                <div
                                    className="h-12 w-12 rounded-full border-2 border-gray-200 bg-[#003971]/10 text-[#003971] flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    title={headerUser.displayName}
                                >
                                    {initialsFromDisplayName(headerUser.displayName)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-8">
                {hasFullAccess ? (
                    <>
                        {statsError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                                {statsError}
                            </p>
                        )}
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                            {statsCards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => navigate(card.path)}
                                    className={`bg-gradient-to-br ${card.bgGradient} rounded-[20px] p-6 text-white shadow-md cursor-pointer active:scale-[0.98] relative`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`${card.iconBg} p-3 rounded-xl`}>
                                            <card.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[40px] font-bold leading-none">{card.value}</h3>
                                        <p className="text-white/95 text-base font-medium">{card.title}</p>
                                        <p className="text-white/70 text-xs">{card.periodLabel}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Required and Quick Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Action Required - 60% width (3 columns) */}
                            <div className="lg:col-span-3">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Action Required</h2>
                                {actionItemsError && (
                                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-3">
                                        {actionItemsError}
                                    </p>
                                )}
                                {actionItemsLoading && actionItems.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-2">Loading alerts and tasks…</p>
                                ) : !actionItemsLoading && actionItems.length === 0 && !actionItemsError ? (
                                    <p className="text-sm text-gray-500 py-2">No urgent items right now.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {actionItems.map((item) => (
                                            <div
                                                key={item.rowKey}
                                                onClick={() => item.path && navigate(item.path)}
                                                className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${item.path ? 'cursor-pointer' : ''} ${actionItemsLoading ? 'opacity-70' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
                                                            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                                                                {item.title}
                                                            </h3>
                                                            {item.subtitle ? (
                                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                                    {item.subtitle}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    {item.hasButton && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(item.path);
                                                            }}
                                                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all flex-shrink-0 ${item.buttonStyle}`}
                                                        >
                                                            <span>{item.buttonText}</span>
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Overview - 40% width (2 columns) */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-bold text-gray-900">Quick Overview</h2>
                                    </div>

                                    {dashboardCoursesError && (
                                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-3">
                                            {dashboardCoursesError}
                                        </p>
                                    )}

                                    {/* Table Header */}
                                    <div className="flex justify-between pb-3 mb-4 border-b border-gray-200">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            COURSE
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            STATUS / BOOKINGS
                                        </div>
                                    </div>

                                    {/* Course List */}
                                    {dashboardCoursesLoading && overviewCourses.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-2">Loading courses…</p>
                                    ) : !dashboardCoursesLoading &&
                                      overviewCourses.length === 0 &&
                                      !dashboardCoursesError ? (
                                        <p className="text-sm text-gray-500 py-2">No active courses yet.</p>
                                    ) : (
                                        <div
                                            className={`space-y-3 ${dashboardCoursesLoading ? 'opacity-70' : ''}`}
                                        >
                                            {overviewCourses.map((course, index) => (
                                                <div
                                                    key={course.id}
                                                    onClick={() =>
                                                        navigate(`/trainingprovider/courses/${course.id}`)
                                                    }
                                                    className={`flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2 ${
                                                        index !== overviewCourses.length - 1
                                                            ? 'border-b border-gray-100'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                                        <div
                                                            className={`${course.iconBg} p-2.5 rounded-lg flex-shrink-0`}
                                                        >
                                                            <course.icon
                                                                className={`h-5 w-5 ${course.iconColor}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 truncate">
                                                            {course.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                                        <span
                                                            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${course.statusColor}`}
                                                        >
                                                            {course.status}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-700 min-w-[72px] text-right tabular-nums">
                                                            {course.capacity}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* View All Courses Link */}
                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => navigate('/trainingprovider/courses')}
                                            className="w-full text-center text-sm font-bold text-[#003971] hover:text-[#002455] transition-colors"
                                        >
                                            View All Courses
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    renderKycGate()
                )}
            </div>

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
                userType="training-provider"
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

export default TrainingProviderDashboard;
