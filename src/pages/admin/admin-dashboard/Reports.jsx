import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertOctagon,
    ArrowLeft,
    Building,
    CheckCircle,
    Eye,
    Flag,
    GraduationCap,
    Loader2,
    RefreshCw,
    ShieldAlert,
    User,
} from 'lucide-react';
import adminModerationService from '../../../services/adminModerationService';
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS } from '../../../services/reportService';

const STATUS_TABS = ['Pending', 'Under Review', 'Actioned', 'Dismissed', 'All'];

const STATUS_VALUES = {
    Pending: 'PENDING',
    'Under Review': 'UNDER_REVIEW',
    Actioned: 'ACTIONED',
    Dismissed: 'DISMISSED',
    All: 'ALL',
};

const STATUS_BADGE = {
    PENDING: 'bg-orange-50 text-orange-700',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700',
    ACTIONED: 'bg-green-50 text-green-700',
    DISMISSED: 'bg-gray-100 text-gray-600',
};

function formatRelativeTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

function accountIcon(reportedType, reportedName) {
    if (reportedType === 'PROFESSIONAL') return <User className="h-4 w-4" />;
    if (String(reportedName || '').toLowerCase().includes('training')) {
        return <GraduationCap className="h-4 w-4" />;
    }
    return <Building className="h-4 w-4" />;
}

/**
 * Admin queue for member-to-member account reports.
 *
 * A report is a moderation signal against a specific account, distinct from the
 * support cases queue in Operations (which are help requests). Reviewing a report
 * here records the decision; suspending or blocking the account is done from the
 * account profile.
 */
function Reports() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Pending');
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [list, counters] = await Promise.all([
                adminModerationService.getReports({
                    status: STATUS_VALUES[activeTab],
                    limit: 100,
                }),
                adminModerationService.getReportStats(),
            ]);
            setReports(list.reports || []);
            setStats(counters);
        } catch (err) {
            setError(err?.message || 'Failed to load reported accounts');
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        void load();
    }, [load]);

    const statCards = [
        {
            label: 'Awaiting review',
            value: stats?.pending ?? 0,
            Icon: ShieldAlert,
            tone: 'bg-orange-50 text-orange-600',
        },
        {
            label: 'Under review',
            value: stats?.underReview ?? 0,
            Icon: AlertOctagon,
            tone: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Actioned',
            value: stats?.actioned ?? 0,
            Icon: CheckCircle,
            tone: 'bg-green-50 text-green-600',
        },
        {
            label: 'Total reports',
            value: stats?.total ?? 0,
            Icon: Flag,
            tone: 'bg-gray-100 text-gray-600',
        },
    ];

    return (
        <div className="max-w-7xl">
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[28px] font-bold text-gray-900">Reported Accounts</h1>
                            {(stats?.pending ?? 0) > 0 && (
                                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                                    {stats.pending} awaiting review
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">
                            Accounts reported by members for scams, abuse, or policy breaches
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void load()}
                        disabled={loading}
                        className="p-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {statCards.map(({ label, value, Icon, tone }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm"
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${tone}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</h3>
                            <p className="text-sm font-medium text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${
                            activeTab === tab ? 'text-[#1e5a8f]' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Reported account
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Reported by
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Filed
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#1e5a8f]" />
                                        Loading reports…
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No reports in this queue.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {report.reference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gray-100">
                                                    {accountIcon(report.reportedType, report.reportedName)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                                        {report.reportedName || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {report.reportedEmail || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {report.reasonLabel ||
                                                REPORT_REASON_LABELS[report.reason] ||
                                                report.reason}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {report.reporterName || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatRelativeTime(report.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                                    STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {REPORT_STATUS_LABELS[report.status] || report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/admin/reports/${report.id}`)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-500 hover:text-[#1e5a8f]"
                                                title="Review report"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reports;
