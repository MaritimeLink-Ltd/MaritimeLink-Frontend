import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Folder,
    Briefcase,
    GraduationCap,
    AlertCircle,
    CheckCircle,
    Calendar,
    RefreshCw,
    Bell,
    LogIn,
} from 'lucide-react';
import professionalDashboardService from '../../../../services/professionalDashboardService';

const defaultOverview = {
    complianceStatus: '',
    expiringCertificates: { count: 0, timeframe: '90 days' },
    resumeCompletionPercentage: 0,
    documentWalletStatus: '',
    jobMatchesCount: 0,
    recommendedCoursesCount: 0,
};

function compliancePillStyles(status) {
    const raw = (status || '').trim();
    const lower = raw.toLowerCase();
    if (lower.includes('green') || lower === 'compliant' || lower === 'fully compliant') {
        return { className: 'bg-[#587B42] text-white', label: raw || 'Compliant', Icon: CheckCircle };
    }
    if (lower.includes('red') || lower.includes('critical')) {
        return { className: 'bg-red-600 text-white', label: raw || 'Needs attention', Icon: AlertCircle };
    }
    if (lower.includes('amber') || lower.includes('yellow') || lower.includes('orange')) {
        return { className: 'bg-amber-600 text-white', label: raw || 'Review', Icon: AlertCircle };
    }
    if (lower.includes('action')) {
        return { className: 'bg-[#003971] text-white', label: raw || 'Action required', Icon: AlertCircle };
    }
    return { className: 'bg-gray-600 text-white', label: raw || 'Compliance', Icon: AlertCircle };
}

function formatRelativeTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 45) return 'Just now';
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
}

function alertRowIconComponent(type) {
    const t = (type || '').toUpperCase();
    if (t === 'INVITATION') return Briefcase;
    return Bell;
}

function alertRowIconClass(type) {
    const t = (type || '').toUpperCase();
    if (t === 'INVITATION') return 'text-[#003971]';
    return 'text-gray-600';
}

function alertDestination(alert) {
    const type = (alert?.type || '').toUpperCase();
    const metadata = alert?.metadata && typeof alert.metadata === 'object' ? alert.metadata : {};

    if ((type === 'INVITATION' || type === 'JOB_APPLICATION_STATUS') && metadata.jobId) {
        return `/personal/jobs/${metadata.jobId}`;
    }

    if (type === 'COURSE_BOOKING_STATUS' && metadata.bookingId) {
        return `/personal/training/applied/${metadata.bookingId}`;
    }

    return null;
}

function activityDescription(entry) {
    const action = (entry?.action || '').toUpperCase();
    const meta = entry?.metadata && typeof entry.metadata === 'object' ? entry.metadata : {};
    if (action === 'JOB_APPLY') {
        const title = meta.jobTitle ? String(meta.jobTitle) : 'a job';
        return `Applied for "${title}"`;
    }
    if (action === 'LOGIN') {
        return 'Signed in to MaritimeLink';
    }
    if (!entry?.action) return 'Activity recorded';
    return entry.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function activityRowIconComponent(action) {
    const a = (action || '').toUpperCase();
    if (a === 'JOB_APPLY') return Briefcase;
    if (a === 'LOGIN') return LogIn;
    return FileText;
}

function activityRowIconClass(action) {
    const a = (action || '').toUpperCase();
    if (a === 'JOB_APPLY') return 'text-[#003971]';
    if (a === 'LOGIN') return 'text-gray-600';
    return 'text-gray-500';
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [apiAlerts, setApiAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertsError, setAlertsError] = useState(null);
    const [activityError, setActivityError] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const markingReadIdsRef = useRef(new Set());

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setAlertsLoading(true);
        setActivityLoading(true);
        setError(null);
        setAlertsError(null);
        setActivityError(null);

        const overviewP = professionalDashboardService
            .getOverview()
            .then((res) => {
                const next = res?.data?.overview;
                if (next && typeof next === 'object') {
                    setOverview({ ...defaultOverview, ...next });
                } else {
                    setOverview({ ...defaultOverview });
                }
            })
            .catch((e) => {
                console.error('Professional dashboard overview:', e);
                setError(e?.message || 'Could not load dashboard metrics.');
                setOverview(null);
            });

        const alertsP = professionalDashboardService
            .getAlerts()
            .then((res) => {
                const list = res?.data?.alerts;
                setApiAlerts(Array.isArray(list) ? list : []);
            })
            .catch((e) => {
                console.error('Professional dashboard alerts:', e);
                setAlertsError(e?.message || 'Could not load alerts.');
                setApiAlerts([]);
            });

        const activityP = professionalDashboardService
            .getActivity()
            .then((res) => {
                const list = res?.data?.activity;
                setActivityLog(Array.isArray(list) ? list : []);
            })
            .catch((e) => {
                console.error('Professional dashboard activity:', e);
                setActivityError(e?.message || 'Could not load activity.');
                setActivityLog([]);
            });

        await Promise.allSettled([overviewP, alertsP, activityP]);
        setLoading(false);
        setAlertsLoading(false);
        setActivityLoading(false);
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const markAlertReadRemote = useCallback(async (alert) => {
        if (!alert?.id || alert.isRead !== false) return;
        if (markingReadIdsRef.current.has(alert.id)) return;
        markingReadIdsRef.current.add(alert.id);
        try {
            await professionalDashboardService.markAlertRead(alert.id);
            const readAt = new Date().toISOString();
            setApiAlerts((prev) =>
                prev.map((a) => (a.id === alert.id ? { ...a, isRead: true, readAt } : a))
            );
        } catch (e) {
            console.error('Mark alert read:', e);
        } finally {
            markingReadIdsRef.current.delete(alert.id);
        }
    }, []);

    const onApiAlertPress = useCallback(
        async (alert) => {
            const destination = alertDestination(alert);
            await markAlertReadRemote(alert);
            if (destination) {
                navigate(destination);
            }
        },
        [markAlertReadRemote, navigate]
    );

    const handleActivityClick = useCallback(
        (entry) => {
            const a = (entry?.action || '').toUpperCase();
            if (a === 'JOB_APPLY' && entry?.metadata?.jobId) {
                navigate(`/personal/jobs/${entry.metadata.jobId}`);
            }
        },
        [navigate]
    );

    const o = overview || defaultOverview;
    const expiring = o.expiringCertificates || defaultOverview.expiringCertificates;
    const expiringCount = typeof expiring.count === 'number' ? expiring.count : 0;
    const timeframeLabel = expiring.timeframe || '90 days';

    const quickAccessCards = useMemo(() => {
        const pct = Math.min(100, Math.max(0, Number(o.resumeCompletionPercentage) || 0));
        return [
            {
                id: 'resume',
                title: 'Resume',
                icon: FileText,
                iconColor: 'text-[#003971]',
                statusType: 'progress',
                progress: pct,
                status: `${pct}% complete`,
                buttonText: 'Go To Resume',
                onClick: () => navigate('/personal/resume'),
            },
            {
                id: 'documents',
                title: 'Document Wallet',
                icon: Folder,
                iconColor: 'text-[#003971]',
                statusType: 'text',
                status: o.documentWalletStatus || '—',
                buttonText: 'Go To Documents',
                onClick: () => navigate('/personal/documents'),
            },
            {
                id: 'jobs',
                title: 'Jobs',
                icon: Briefcase,
                iconColor: 'text-[#003971]',
                statusType: 'text',
                statusLight: true,
                status:
                    o.jobMatchesCount === 0
                        ? 'No job matches yet'
                        : `${o.jobMatchesCount} job match${o.jobMatchesCount === 1 ? '' : 'es'}`,
                buttonText: 'Go To Jobs',
                onClick: () => navigate('/personal/jobs'),
            },
            {
                id: 'courses',
                title: 'Courses',
                icon: GraduationCap,
                iconColor: 'text-[#003971]',
                statusType: 'text',
                statusLight: true,
                status:
                    o.recommendedCoursesCount === 0
                        ? 'No recommended courses'
                        : `${o.recommendedCoursesCount} recommended course${o.recommendedCoursesCount === 1 ? '' : 's'}`,
                buttonText: 'Go To Training',
                onClick: () => navigate('/personal/training'),
            },
        ];
    }, [navigate, o]);

    const compliancePill = useMemo(() => compliancePillStyles(o.complianceStatus), [o.complianceStatus]);
    const ComplianceStatusIcon = compliancePill.Icon;

    const expiringSummaryMessage =
        expiringCount > 0
            ? `${expiringCount} certificate${expiringCount === 1 ? '' : 's'} expiring in the next ${timeframeLabel}`
            : `No certificates expiring in the next ${timeframeLabel}`;

    const activitySorted = useMemo(() => {
        return [...activityLog].sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }, [activityLog]);

    const bannerTone =
        expiringCount > 0 ? 'bg-orange-50 hover:bg-orange-100' : 'bg-slate-50 hover:bg-slate-100';
    const bannerIconWrap = expiringCount > 0 ? 'bg-orange-100' : 'bg-slate-200';
    const bannerIconClass = expiringCount > 0 ? 'text-orange-600' : 'text-slate-600';

    return (
        <div className="w-full flex flex-col bg-white">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 bg-white">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Dashboard</h1>
                        <p className="text-gray-500 text-sm sm:text-base mt-1">View everything at a glance</p>
                        {error && (
                            <p className="text-red-600 text-sm mt-2 flex flex-wrap items-center gap-2">
                                {error}
                                <button
                                    type="button"
                                    onClick={loadDashboard}
                                    className="inline-flex items-center gap-1 text-[#003971] font-medium hover:underline"
                                >
                                    <RefreshCw size={14} />
                                    Retry
                                </button>
                            </p>
                        )}
                    </div>
                    {!loading && (
                        <button
                            type="button"
                            onClick={loadDashboard}
                            className="self-start sm:self-center inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#003971] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    )}
                </div>

                <div
                    onClick={() => (expiringCount > 0 || o.documentWalletStatus) && navigate('/personal/documents')}
                    className={`${bannerTone} rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                        expiringCount > 0 || o.documentWalletStatus ? 'cursor-pointer' : ''
                    }`}
                >
                    <div className="flex items-center gap-3 flex-1">
                        <div
                            className={`w-8 h-8 ${bannerIconWrap} rounded-full flex items-center justify-center shrink-0`}
                        >
                            <Calendar size={18} className={bannerIconClass} />
                        </div>
                        <span className="text-sm sm:text-base text-gray-800 font-medium">{expiringSummaryMessage}</span>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium w-full sm:w-auto justify-center ${compliancePill.className}`}
                    >
                        <ComplianceStatusIcon size={16} />
                        {compliancePill.label}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {loading
                        ? [1, 2, 3, 4].map((k) => (
                              <div
                                  key={k}
                                  className="bg-[#F3FAFF] rounded-xl p-5 flex flex-col animate-pulse min-h-[180px]"
                              >
                                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                                  <div className="h-2 bg-gray-200 rounded-full w-full mb-2" />
                                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                                  <div className="mt-auto h-10 bg-gray-200 rounded-full w-full" />
                              </div>
                          ))
                        : quickAccessCards.map((card) => {
                              const Icon = card.icon;
                              return (
                                  <div key={card.id} className="bg-[#F3FAFF] rounded-xl p-5 flex flex-col">
                                      <div className="flex items-center gap-3 mb-4">
                                          <Icon size={20} className={card.iconColor} />
                                          <h3 className="text-base font-semibold text-gray-800">{card.title}</h3>
                                      </div>

                                      <div className="mb-4 flex-1">
                                          {card.statusType === 'progress' ? (
                                              <>
                                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                      <div
                                                          className="bg-[#003971] h-2 rounded-full transition-all"
                                                          style={{ width: `${card.progress}%` }}
                                                      />
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-700">
                                                      {card.status}
                                                  </span>
                                              </>
                                          ) : (
                                              <span
                                                  className={`text-sm font-medium ${
                                                      card.statusLight ? 'text-gray-600' : 'text-gray-800'
                                                  }`}
                                              >
                                                  {card.status}
                                              </span>
                                          )}
                                      </div>

                                      <button
                                          type="button"
                                          onClick={card.onClick}
                                          className="w-full bg-[#003971] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#002855] transition-colors"
                                      >
                                          {card.buttonText}
                                      </button>
                                  </div>
                              );
                          })}
                </div>
            </div>

            <div className="flex-1 lg:overflow-hidden px-4 sm:px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:h-full">
                    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col overflow-hidden min-h-[300px] lg:h-auto">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Alerts</h2>
                            {alertsError && (
                                <p className="text-red-600 text-xs sm:text-sm flex flex-wrap items-center gap-2">
                                    {alertsError}
                                    <button
                                        type="button"
                                        onClick={loadDashboard}
                                        className="text-[#003971] font-medium hover:underline inline-flex items-center gap-1"
                                    >
                                        <RefreshCw size={12} />
                                        Retry
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                            {alertsLoading ? (
                                [1, 2, 3].map((k) => (
                                    <div
                                        key={k}
                                        className="bg-gray-50 rounded-lg p-4 animate-pulse flex gap-3"
                                    >
                                        <div className="h-4 w-4 bg-gray-200 rounded shrink-0 mt-0.5" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 rounded w-full" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {expiringCount > 0 && (
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => navigate('/personal/documents')}
                                            onKeyDown={(e) =>
                                                (e.key === 'Enter' || e.key === ' ') &&
                                                navigate('/personal/documents')
                                            }
                                            className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">Certificates</p>
                                                <p className="text-sm text-gray-800 mt-0.5">{expiringSummaryMessage}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 shrink-0">Now</span>
                                        </div>
                                    )}
                                    {apiAlerts.map((alert) => {
                                        const Icon = alertRowIconComponent(alert.type);
                                        const iconClass = alertRowIconClass(alert.type);
                                        const canNavigate = Boolean(alertDestination(alert));
                                        const unread = alert.isRead === false;
                                        const interactive = unread || canNavigate;
                                        const rel = formatRelativeTime(alert.createdAt);
                                        return (
                                            <div
                                                key={alert.id}
                                                role={interactive ? 'button' : undefined}
                                                tabIndex={interactive ? 0 : undefined}
                                                onClick={() => interactive && onApiAlertPress(alert)}
                                                onKeyDown={(e) => {
                                                    if (
                                                        interactive &&
                                                        (e.key === 'Enter' || e.key === ' ')
                                                    ) {
                                                        e.preventDefault();
                                                        onApiAlertPress(alert);
                                                    }
                                                }}
                                                className={`rounded-lg p-4 flex items-start gap-3 border border-transparent ${
                                                    unread
                                                        ? 'bg-[#f0f6fc] border-[#003971]/15'
                                                        : 'bg-gray-50'
                                                } ${interactive ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                                            >
                                                <Icon size={16} className={`${iconClass} shrink-0 mt-0.5`} />
                                                <div className="flex-1 min-w-0">
                                                    {alert.title && (
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {alert.title}
                                                        </p>
                                                    )}
                                                    <p
                                                        className={`text-sm text-gray-800 ${
                                                            alert.title ? 'mt-0.5' : ''
                                                        }`}
                                                    >
                                                        {alert.message}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                                                    {rel || '—'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {!alertsLoading &&
                                        apiAlerts.length === 0 &&
                                        expiringCount === 0 && (
                                            <p className="text-sm text-gray-500 py-2">
                                                No notifications right now. You are all caught up.
                                            </p>
                                        )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col overflow-hidden min-h-[300px] lg:h-auto">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                            {activityError && (
                                <p className="text-red-600 text-xs sm:text-sm flex flex-wrap items-center gap-2">
                                    {activityError}
                                    <button
                                        type="button"
                                        onClick={loadDashboard}
                                        className="text-[#003971] font-medium hover:underline inline-flex items-center gap-1"
                                    >
                                        <RefreshCw size={12} />
                                        Retry
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                            {activityLoading ? (
                                [1, 2, 3].map((k) => (
                                    <div
                                        key={k}
                                        className="bg-gray-50 rounded-lg p-4 animate-pulse flex gap-3"
                                    >
                                        <div className="h-4 w-4 bg-gray-200 rounded shrink-0" />
                                        <div className="flex-1 h-4 bg-gray-200 rounded" />
                                    </div>
                                ))
                            ) : activitySorted.length === 0 ? (
                                <p className="text-sm text-gray-500 py-2">No recent activity yet.</p>
                            ) : (
                                activitySorted.map((entry) => {
                                    const Icon = activityRowIconComponent(entry.action);
                                    const iconClass = activityRowIconClass(entry.action);
                                    const clickable =
                                        (entry.action || '').toUpperCase() === 'JOB_APPLY' &&
                                        Boolean(entry.metadata?.jobId);
                                    const rel = formatRelativeTime(entry.createdAt);
                                    const line = activityDescription(entry);
                                    return (
                                        <div
                                            key={entry.id}
                                            role={clickable ? 'button' : undefined}
                                            tabIndex={clickable ? 0 : undefined}
                                            onClick={() => clickable && handleActivityClick(entry)}
                                            onKeyDown={(e) => {
                                                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                                                    e.preventDefault();
                                                    handleActivityClick(entry);
                                                }
                                            }}
                                            className={`bg-gray-50 rounded-lg p-4 flex items-center gap-3 ${
                                                clickable
                                                    ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                                                    : ''
                                            }`}
                                        >
                                            <Icon size={16} className={iconClass} />
                                            <span className="flex-1 text-sm text-gray-800 line-clamp-2">
                                                {line}
                                            </span>
                                            <span className="text-xs text-gray-400 shrink-0">{rel || '—'}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
