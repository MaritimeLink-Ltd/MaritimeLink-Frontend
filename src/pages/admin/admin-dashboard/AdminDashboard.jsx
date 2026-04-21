import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    AlertTriangle,
    Shield,
    Briefcase,
    PlayCircle,
    FileText,
    Calendar,
    ChevronRight,
    CheckCircle,
    TrendingUp,
    Building,
    DollarSign,
    ArrowUpRight,
    Search,
    ChevronDown,
    Link as LinkIcon,
    MoreHorizontal,
    ArrowRight,
    Filter,
    Menu,
    Settings,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import adminDashboardService from '../../../services/adminDashboardService';

function formatAdminCurrencyGbp(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

function adminGrowthBadgeClass(growthStr) {
    const s = String(growthStr || '').trim();
    if (!s || s === '—' || s === '…') return 'text-white/70 bg-white/10';
    if (s.startsWith('-')) return 'text-red-300 bg-red-500/20';
    return 'text-green-400 bg-green-500/10';
}

function adminGrowthHeaderClass(growthStr) {
    const s = String(growthStr || '').trim();
    if (!s || s === '—' || s === '…') return 'text-gray-400';
    if (s.startsWith('-')) return 'text-red-600';
    return 'text-green-500';
}

function formatAdminRelativeTime(iso) {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '';
    }
}

function mapQueueSeverityStyles(severity) {
    const s = String(severity || '').toLowerCase();
    if (s === 'red') {
        return { iconColor: 'text-red-500', iconBg: 'bg-red-50', reasonClass: 'text-red-600' };
    }
    if (s === 'yellow') {
        return { iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', reasonClass: 'text-amber-700' };
    }
    if (s === 'blue') {
        return { iconColor: 'text-blue-500', iconBg: 'bg-blue-50', reasonClass: 'text-blue-600' };
    }
    return { iconColor: 'text-gray-500', iconBg: 'bg-gray-50', reasonClass: 'text-gray-600' };
}

function mapAlertSeverityColor(severity) {
    const s = String(severity || '').toLowerCase();
    if (s === 'red') return 'bg-red-500';
    if (s === 'yellow') return 'bg-orange-500';
    if (s === 'blue') return 'bg-blue-500';
    return 'bg-gray-500';
}

function reviewQueueItemPath(queueType) {
    const t = String(queueType || '').toUpperCase();
    if (t === 'PROFESSIONAL_KYC') return '/admin/accounts';
    return '/admin/compliance';
}

function formatAdminExpiringTimeframe(tf) {
    const t = String(tf || '').toLowerCase();
    if (t === '30d') return '30 days';
    if (t === '7d') return '7 days';
    if (t === '48h' || t === '2d') return '48 hours';
    if (t === 'today' || t === '1d') return '24 hours';
    return tf ? String(tf) : '30 days';
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [adminStats, setAdminStats] = useState({
        pendingTotal: 0,
        pendingToday: 0,
        flaggedIssues: 0,
        expiringCount: 0,
        expiringTimeframe: '30d',
    });
    const [adminStatsLoading, setAdminStatsLoading] = useState(true);
    const [adminStatsError, setAdminStatsError] = useState(null);
    const [adminActivity, setAdminActivity] = useState({
        jobsPosted: 0,
        coursesPosted: 0,
        applicationsSubmitted: 0,
        bookingsMade: 0,
        successRate: '',
    });
    const [adminUserBreakdown, setAdminUserBreakdown] = useState({
        providers: 0,
        recruiters: 0,
        professionals: 0,
    });
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState(null);
    const [revenueData, setRevenueData] = useState({
        overview: { activeSubscriptions: 0, totalRevenue: 0, growth: '' },
        breakdown: {
            professionals: { amount: 0, active: 0, growth: '' },
            recruiters: { amount: 0, active: 0, growth: '' },
        },
        training: {
            totalThisMonth: 0,
            growth: '',
            sources: { courseSales: 0, pendingPayouts: 0, refunds: 0 },
        },
    });
    const [financeAnalytics, setFinanceAnalytics] = useState({
        summary: {
            totalRevenue: 0,
            platformCommission: 0,
            trainerPayouts: 0,
            totalBookings: 0,
            pendingPayouts: 0,
        },
        byTrainer: [],
    });
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState(null);
    const [financeAnalyticsError, setFinanceAnalyticsError] = useState(null);
    const [reviewQueueList, setReviewQueueList] = useState([]);
    const [systemAlertsList, setSystemAlertsList] = useState([]);
    const [queuesLoading, setQueuesLoading] = useState(true);
    const [queuesError, setQueuesError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAdminStatsLoading(true);
            setActivityLoading(true);
            setRevenueLoading(true);
            setQueuesLoading(true);
            setAdminStatsError(null);
            setActivityError(null);
            setRevenueError(null);
            setFinanceAnalyticsError(null);
            setQueuesError(null);
            try {
                const [statsOutcome, activityOutcome, revenueOutcome, analyticsOutcome, queuesOutcome] =
                    await Promise.allSettled([
                        adminDashboardService.getDashboardStats(),
                        adminDashboardService.getDashboardActivity(),
                        adminDashboardService.getDashboardRevenue(),
                        adminDashboardService.getRevenueAnalytics(),
                        adminDashboardService.getDashboardQueues(),
                    ]);

                if (statsOutcome.status === 'fulfilled') {
                    const s = statsOutcome.value?.data?.stats;
                    if (!cancelled && s && typeof s === 'object') {
                        const pending = s.pendingApprovals || {};
                        const exp = s.expiringCompliance || {};
                        setAdminStats({
                            pendingTotal: Number(pending.total) || 0,
                            pendingToday: Number(pending.today) || 0,
                            flaggedIssues: Number(s.flaggedIssues) || 0,
                            expiringCount: Number(exp.count) || 0,
                            expiringTimeframe: exp.timeframe || '30d',
                        });
                    }
                } else if (!cancelled) {
                    console.error('Failed to load admin dashboard stats:', statsOutcome.reason);
                    setAdminStatsError(
                        statsOutcome.reason?.message || 'Could not load dashboard stats.'
                    );
                }

                if (activityOutcome.status === 'fulfilled') {
                    const d = activityOutcome.value?.data;
                    const a = d?.activity;
                    const ub = d?.userBreakdown;
                    if (!cancelled && a && typeof a === 'object') {
                        setAdminActivity({
                            jobsPosted: Number(a.jobsPosted) || 0,
                            coursesPosted: Number(a.coursesPosted) || 0,
                            applicationsSubmitted: Number(a.applicationsSubmitted) || 0,
                            bookingsMade: Number(a.bookingsMade) || 0,
                            successRate:
                                a.successRate != null && a.successRate !== ''
                                    ? String(a.successRate)
                                    : '',
                        });
                    }
                    if (!cancelled && ub && typeof ub === 'object') {
                        setAdminUserBreakdown({
                            providers: Number(ub.providers) || 0,
                            recruiters: Number(ub.recruiters) || 0,
                            professionals: Number(ub.professionals) || 0,
                        });
                    }
                } else if (!cancelled) {
                    console.error('Failed to load admin dashboard activity:', activityOutcome.reason);
                    setActivityError(
                        activityOutcome.reason?.message || 'Could not load platform activity.'
                    );
                }

                if (revenueOutcome.status === 'fulfilled') {
                    const d = revenueOutcome.value?.data;
                    const ov = d?.overview || {};
                    const bd = d?.breakdown || {};
                    const tr = d?.training || {};
                    const src = tr?.sources || {};
                    if (!cancelled) {
                        setRevenueData({
                            overview: {
                                activeSubscriptions: Number(ov.activeSubscriptions) || 0,
                                totalRevenue: Number(ov.totalRevenue) || 0,
                                growth: ov.growth != null && ov.growth !== '' ? String(ov.growth) : '',
                            },
                            breakdown: {
                                professionals: {
                                    amount: Number(bd.professionals?.amount) || 0,
                                    active: Number(bd.professionals?.active) || 0,
                                    growth:
                                        bd.professionals?.growth != null && bd.professionals?.growth !== ''
                                            ? String(bd.professionals.growth)
                                            : '',
                                },
                                recruiters: {
                                    amount: Number(bd.recruiters?.amount) || 0,
                                    active: Number(bd.recruiters?.active) || 0,
                                    growth:
                                        bd.recruiters?.growth != null && bd.recruiters?.growth !== ''
                                            ? String(bd.recruiters.growth)
                                            : '',
                                },
                            },
                            training: {
                                totalThisMonth: Number(tr.totalThisMonth) || 0,
                                growth:
                                    tr.growth != null && tr.growth !== '' ? String(tr.growth) : '',
                                sources: {
                                    courseSales: Number(src.courseSales) || 0,
                                    pendingPayouts: Number(src.pendingPayouts) || 0,
                                    refunds: Number(src.refunds) || 0,
                                },
                            },
                        });
                    }
                } else if (!cancelled) {
                    console.error('Failed to load admin dashboard revenue:', revenueOutcome.reason);
                    setRevenueError(
                        revenueOutcome.reason?.message || 'Could not load revenue data.'
                    );
                }

                if (analyticsOutcome.status === 'fulfilled') {
                    const d = analyticsOutcome.value?.data;
                    const sum = d?.summary || {};
                    const byT = d?.byTrainer;
                    if (!cancelled) {
                        setFinanceAnalytics({
                            summary: {
                                totalRevenue: Number(sum.totalRevenue) || 0,
                                platformCommission: Number(sum.platformCommission) || 0,
                                trainerPayouts: Number(sum.trainerPayouts) || 0,
                                totalBookings: Number(sum.totalBookings) || 0,
                                pendingPayouts: Number(sum.pendingPayouts) || 0,
                            },
                            byTrainer: Array.isArray(byT) ? byT : [],
                        });
                    }
                } else if (!cancelled) {
                    console.error('Failed to load admin revenue analytics:', analyticsOutcome.reason);
                    setFinanceAnalyticsError(
                        analyticsOutcome.reason?.message || 'Could not load revenue analytics.'
                    );
                }

                if (queuesOutcome.status === 'fulfilled') {
                    const d = queuesOutcome.value?.data;
                    const rq = d?.reviewQueue;
                    const sa = d?.systemAlerts;
                    if (!cancelled) {
                        setReviewQueueList(Array.isArray(rq) ? rq : []);
                        setSystemAlertsList(Array.isArray(sa) ? sa : []);
                    }
                } else if (!cancelled) {
                    console.error('Failed to load admin dashboard queues:', queuesOutcome.reason);
                    setQueuesError(
                        queuesOutcome.reason?.message || 'Could not load review queue or alerts.'
                    );
                    setReviewQueueList([]);
                    setSystemAlertsList([]);
                }
            } finally {
                if (!cancelled) {
                    setAdminStatsLoading(false);
                    setActivityLoading(false);
                    setRevenueLoading(false);
                    setQueuesLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const topStats = useMemo(() => {
        const fmt = (n) => (adminStatsLoading ? '—' : String(n));
        const pendingBadge = adminStatsLoading
            ? '…'
            : adminStats.pendingToday > 0
                ? `+${adminStats.pendingToday} today`
                : 'No new today';
        const flaggedBadge =
            adminStatsLoading ? '…' : adminStats.flaggedIssues > 0 ? 'Needs attention' : 'None open';
        const expiringBadge = adminStatsLoading
            ? '…'
            : `Next ${formatAdminExpiringTimeframe(adminStats.expiringTimeframe)}`;

        return [
            {
                id: 1,
                icon: Users,
                value: fmt(adminStats.pendingTotal),
                label: 'Pending Approvals',
                badge: pendingBadge,
                gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8]',
                path: '/admin/compliance',
            },
            {
                id: 2,
                icon: AlertTriangle,
                value: fmt(adminStats.flaggedIssues),
                label: 'Flagged Issues',
                badge: flaggedBadge,
                gradient: 'from-[#ef4444] via-[#f87171] to-[#fca5a5]',
                path: '/admin/flagged-accounts',
            },
            {
                id: 3,
                icon: Shield,
                value: fmt(adminStats.expiringCount),
                label: 'Expiring Compliance',
                badge: expiringBadge,
                gradient: 'from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]',
                path: '/admin/accounts?view=expiring_compliance',
            },
        ];
    }, [adminStats, adminStatsLoading]);

    const platformActivityStats = useMemo(() => {
        const fmt = (n) => (activityLoading ? '—' : String(Number(n) || 0));
        return [
            {
                icon: Briefcase,
                label: 'Jobs Posted',
                value: fmt(adminActivity.jobsPosted),
                iconColor: 'text-blue-500',
                iconBg: 'bg-blue-50',
            },
            {
                icon: PlayCircle,
                label: 'Courses Posted',
                value: fmt(adminActivity.coursesPosted),
                iconColor: 'text-purple-500',
                iconBg: 'bg-purple-50',
            },
            {
                icon: FileText,
                label: 'Applications',
                value: fmt(adminActivity.applicationsSubmitted),
                iconColor: 'text-green-500',
                iconBg: 'bg-green-50',
            },
            {
                icon: Calendar,
                label: 'Bookings',
                value: fmt(adminActivity.bookingsMade),
                iconColor: 'text-orange-500',
                iconBg: 'bg-orange-50',
            },
        ];
    }, [adminActivity, activityLoading]);

    const platformMetrics = useMemo(() => {
        const fmt = (n) => (activityLoading ? '—' : String(Number(n) || 0));
        const successDisplay = activityLoading
            ? '…'
            : adminActivity.successRate || '—';
        return [
            {
                label: 'SUCCESS RATE',
                sublabel: successDisplay,
                icon: CheckCircle,
                iconColor: 'text-green-500',
                iconBg: 'bg-green-50',
            },
            { label: 'Providers', value: fmt(adminUserBreakdown.providers) },
            { label: 'Recruiters', value: fmt(adminUserBreakdown.recruiters) },
            { label: 'Professionals', value: fmt(adminUserBreakdown.professionals) },
        ];
    }, [adminActivity, adminUserBreakdown, activityLoading]);

    const revenueOverviewDisplay = useMemo(() => {
        const ov = revenueData.overview;
        const s = financeAnalytics.summary;
        return {
            bookings: revenueLoading ? '—' : String(Number(s.totalBookings) || 0),
            totalRevenue: revenueLoading ? '—' : formatAdminCurrencyGbp(s.totalRevenue),
            growth: revenueLoading ? '…' : ov.growth || '—',
        };
    }, [revenueData, financeAnalytics, revenueLoading]);

    const financeFeeRows = useMemo(() => {
        const s = financeAnalytics.summary;
        const fmt = (n) => (revenueLoading ? '—' : formatAdminCurrencyGbp(n));
        return [
            {
                label: 'Platform fees',
                sublabel: 'Commission on bookings',
                amount: fmt(s.platformCommission),
                icon: DollarSign,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
            },
            {
                label: 'Trainer payouts',
                sublabel: 'Paid to training providers',
                amount: fmt(s.trainerPayouts),
                icon: Building,
                iconColor: 'text-blue-500',
                iconBg: 'bg-blue-50',
            },
            {
                label: 'Pending payouts',
                sublabel: 'Awaiting settlement',
                amount: fmt(s.pendingPayouts),
                icon: Calendar,
                iconColor: 'text-orange-500',
                iconBg: 'bg-orange-50',
            },
        ];
    }, [financeAnalytics, revenueLoading]);

    const trainerRevenueRows = useMemo(() => {
        const fmt = (n) => (revenueLoading ? '—' : formatAdminCurrencyGbp(n));
        return financeAnalytics.byTrainer.map((t, index) => ({
            key: t.recruiterId || `trainer-${index}`,
            recruiterId: t.recruiterId,
            name: t.organizationName || 'Training provider',
            sublabel: `${Number(t.bookings) || 0} booking(s)`,
            revenue: fmt(t.revenue),
            payout: fmt(t.payout),
        }));
    }, [financeAnalytics, revenueLoading]);

    const trainingRevenueSources = useMemo(() => {
        const s = revenueData.training.sources;
        const fmt = (n) => (revenueLoading ? '—' : formatAdminCurrencyGbp(n));
        return [
            { label: 'Course Sales', value: fmt(s.courseSales) },
            { label: 'Pending Payouts', value: fmt(s.pendingPayouts) },
            { label: 'Refunds', value: fmt(s.refunds) },
        ];
    }, [revenueData, revenueLoading]);

    const trainingNetDisplay = useMemo(() => {
        const t = revenueData.training;
        return {
            total: revenueLoading ? '—' : formatAdminCurrencyGbp(t.totalThisMonth),
            growth: revenueLoading ? '…' : t.growth || '—',
        };
    }, [revenueData, revenueLoading]);

    const reviewQueueDisplay = useMemo(() => {
        return reviewQueueList.map((item) => {
            const styles = mapQueueSeverityStyles(item.severity);
            return {
                id: item.id,
                title: item.title || '—',
                reason: item.reason || '',
                time: formatAdminRelativeTime(item.timestamp),
                queueType: item.type,
                icon: AlertTriangle,
                iconColor: styles.iconColor,
                iconBg: styles.iconBg,
                reasonClass: styles.reasonClass,
                path: reviewQueueItemPath(item.type),
            };
        });
    }, [reviewQueueList]);

    const systemAlertsDisplay = useMemo(() => {
        return systemAlertsList.map((item, index) => ({
            rowKey: `${item.type || 'alert'}-${index}-${item.timestamp || ''}`,
            message: item.message || 'Alert',
            time: formatAdminRelativeTime(item.timestamp),
            dotClass: mapAlertSeverityColor(item.severity),
            badgeLabel: String(index + 1),
        }));
    }, [systemAlertsList]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#1e5a8f] text-sm font-bold tracking-wide">ADMIN VIEW</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500 text-sm">Overview</span>
                    </div>
                    <h1 className="text-[32px] font-bold text-gray-900">Analytics Overview</h1>
                </div>
            </div>

            {(adminStatsError || activityError || revenueError || financeAnalyticsError || queuesError) && (
                <div className="space-y-2">
                    {adminStatsError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {adminStatsError}
                        </p>
                    )}
                    {activityError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {activityError}
                        </p>
                    )}
                    {revenueError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {revenueError}
                        </p>
                    )}
                    {financeAnalyticsError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {financeAnalyticsError}
                        </p>
                    )}
                    {queuesError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            {queuesError}
                        </p>
                    )}
                </div>
            )}

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topStats.map((stat) => (
                    <div
                        key={stat.id}
                        onClick={() => navigate(stat.path)}
                        className={`bg-gradient-to-br ${stat.gradient} rounded-[24px] p-7 text-white shadow-lg relative overflow-hidden cursor-pointer ${adminStatsLoading ? 'opacity-90' : ''}`}
                    >
                        <div className="relative z-10">
                            {/* Icon and Badge */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    {stat.badge}
                                </span>
                            </div>

                            {/* Value and Label */}
                            <div className="mt-auto">
                                <div className="text-5xl font-extrabold mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-base font-semibold leading-snug">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Platform Activity & Review Queue */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Platform Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Platform Activity</h2>
                                <p className="text-sm text-gray-500 mt-1">Real-time overview of system events</p>
                            </div>
                            <Link
                                to="/admin/platform-activity"
                                className="text-sm font-bold text-[#1e5a8f] hover:underline flex items-center gap-1"
                            >
                                View Full Report
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Activity Stats Grid */}
                        <div
                            className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ${activityLoading ? 'opacity-80' : ''}`}
                        >
                            {platformActivityStats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className={`p-2.5 rounded-lg ${stat.iconBg} inline-flex mb-3`}>
                                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                        {stat.badge && (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {stat.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Additional Metrics */}
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${activityLoading ? 'opacity-80' : ''}`}>
                            {platformMetrics.map((metric, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-4">
                                    {metric.icon ? (
                                        <>
                                            <div className={`p-2.5 rounded-lg ${metric.iconBg} inline-flex mb-3`}>
                                                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold mb-0.5">{metric.label}</p>
                                            <p className="text-sm font-bold text-gray-900">{metric.sublabel}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500 font-medium mb-1">{metric.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Queue & System Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Review Queue */}
                        <div
                            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${queuesLoading ? 'opacity-90' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Review Queue</h2>
                                <span className="text-xs font-bold text-[#1e5a8f] bg-blue-50 px-3 py-1.5 rounded-full">
                                    {queuesLoading ? '…' : `${reviewQueueList.length} pending`}
                                </span>
                            </div>

                            {queuesLoading ? (
                                <p className="text-sm text-gray-500 py-6 text-center">Loading review queue…</p>
                            ) : reviewQueueDisplay.length === 0 ? (
                                <p className="text-sm text-gray-500 py-6 text-center">No review items right now.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reviewQueueDisplay.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate(item.path)}
                                            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <div className={`p-2 rounded-lg ${item.iconBg} flex-shrink-0`}>
                                                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                                <p className={`text-xs font-medium ${item.reasonClass}`}>
                                                    {item.reason}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                                {item.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/admin/compliance')}
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-4 py-2"
                            >
                                View All Reviews
                            </button>
                        </div>

                        {/* System Alerts */}
                        <div
                            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${queuesLoading ? 'opacity-90' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">System Alerts</h2>
                            </div>

                            {queuesLoading ? (
                                <p className="text-sm text-gray-500 py-6 text-center">Loading alerts…</p>
                            ) : systemAlertsDisplay.length === 0 ? (
                                <p className="text-sm text-gray-500 py-6 text-center">No system alerts.</p>
                            ) : (
                                <div className="space-y-3">
                                    {systemAlertsDisplay.map((alert) => (
                                        <div
                                            key={alert.rowKey}
                                            onClick={() => navigate('/admin/notifications')}
                                            className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                                        >
                                            <div
                                                className={`w-8 h-8 rounded-full ${alert.dotClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                                            >
                                                {alert.badgeLabel}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                                                <span className="text-xs text-gray-400">{alert.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-4 py-2"
                            >
                                View All Alerts
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Review Approval - Dark Blue Card */}
                        <button
                            onClick={() => navigate('/admin/compliance')}
                            className="bg-[#0f385c] text-white rounded-2xl p-6 text-left hover:shadow-lg transition-all hover:bg-[#0a2742]"
                        >
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm inline-flex mb-8">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-base font-bold mb-1">Review Approval</h3>
                            <p className="text-sm text-white/70">Start next pending item</p>
                        </button>

                        {/* Flagged Accounts - White Card */}
                        <button
                            onClick={() => navigate('/admin/flagged-accounts')}
                            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md transition-all hover:border-gray-200"
                        >
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 inline-flex mb-8">
                                <AlertTriangle className="h-5 w-5 text-gray-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Flagged Accounts</h3>
                            <p className="text-sm text-gray-500">
                                {adminStatsLoading
                                    ? 'Loading…'
                                    : adminStats.flaggedIssues === 0
                                        ? 'No open issues'
                                        : `View all ${adminStats.flaggedIssues} issue${adminStats.flaggedIssues === 1 ? '' : 's'}`}
                            </p>
                        </button>

                        {/* Upload Job - White Card */}
                        <button
                            onClick={() => navigate('/admin/marketplace/create-job', {
                                state: { dashboardType: 'admin', returnPath: '/admin-dashboard' }
                            })}
                            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md transition-all hover:border-gray-200"
                        >
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 inline-flex mb-8">
                                <ArrowUpRight className="h-5 w-5 text-gray-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Upload Job</h3>
                            <p className="text-sm text-gray-500">Import external listing</p>
                        </button>
                    </div>
                </div>

                {/* Right Column - Revenue */}
                <div className={`space-y-6 ${revenueLoading ? 'opacity-90' : ''}`}>
                    {/* Revenue Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Revenue</h2>
                                <p className="text-xs text-gray-500">Bookings, fees, and payouts</p>
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-bold ${adminGrowthHeaderClass(revenueOverviewDisplay.growth)}`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                {revenueOverviewDisplay.growth}
                            </div>
                        </div>

                        {/* Main Revenue Display */}
                        <div className="bg-gradient-to-br from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8] rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-white/80" />
                                <span className="text-xs font-bold text-white/80 tracking-wide">TOTAL BOOKINGS</span>
                            </div>
                            <div className="text-4xl font-extrabold text-white mb-4 tabular-nums">
                                {revenueOverviewDisplay.bookings}
                            </div>

                            <div className="pt-4 border-t border-white/20">
                                <span className="text-xs font-bold text-white/80 tracking-wide block mb-2">TOTAL REVENUE</span>
                                <div className="text-3xl font-extrabold text-white tabular-nums">
                                    {revenueOverviewDisplay.totalRevenue}
                                </div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-4">BREAKDOWN</h3>
                            <div className="space-y-4">
                                {financeFeeRows.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2 rounded-lg ${item.iconBg} flex-shrink-0`}>
                                                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.sublabel}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-2">
                                            <p className="text-sm font-bold text-gray-900 tabular-nums">{item.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-4 mt-8">
                                BY TRAINING PROVIDER
                            </h3>
                            {trainerRevenueRows.length === 0 && !revenueLoading ? (
                                <p className="text-sm text-gray-500">No trainer booking revenue yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {trainerRevenueRows.map((row) => (
                                        <div
                                            key={row.key}
                                            role={row.recruiterId ? 'button' : undefined}
                                            tabIndex={row.recruiterId ? 0 : undefined}
                                            onClick={() =>
                                                row.recruiterId &&
                                                navigate(`/admin/accounts/${row.recruiterId}`)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    row.recruiterId &&
                                                    (e.key === 'Enter' || e.key === ' ')
                                                ) {
                                                    e.preventDefault();
                                                    navigate(`/admin/accounts/${row.recruiterId}`);
                                                }
                                            }}
                                            className={`flex items-center justify-between ${row.recruiterId ? 'cursor-pointer hover:bg-gray-50 rounded-xl p-2 -mx-2' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0">
                                                    <Building className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {row.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{row.sublabel}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 pl-2">
                                                <p className="text-sm font-bold text-gray-900 tabular-nums">
                                                    {row.revenue}
                                                </p>
                                                <p className="text-xs text-gray-500 tabular-nums">
                                                    Payout {row.payout}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Training Revenue Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Training Revenue</h2>
                        </div>

                        {/* Net Revenue Display */}
                        <div className="bg-gradient-to-br from-[#1f2937] via-[#374151] to-[#4b5563] rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-white/80" />
                                    <span className="text-xs font-bold text-white/80 tracking-wide">NET REVENUE</span>
                                </div>
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${adminGrowthBadgeClass(trainingNetDisplay.growth)}`}
                                >
                                    {trainingNetDisplay.growth}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-4xl font-extrabold text-white tabular-nums">
                                    {trainingNetDisplay.total}
                                </div>
                            </div>
                            <span className="text-xs text-white/60">This Month</span>
                        </div>

                        {/* Sources */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-4">SOURCES</h3>
                            <div className="space-y-3">
                                {trainingRevenueSources.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{source.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 tabular-nums">{source.value}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/admin/transaction-history"
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-6 py-2 flex items-center justify-center gap-1"
                            >
                                View Transaction History
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

