import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Filter,
    Shield,
    AlertTriangle,
    Eye,
    XCircle,
    ChevronDown,
    User,
    Building,
    GraduationCap,
    ShieldAlert,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function formatRelativeTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
}

function getDaysAgoFromIso(iso) {
    if (!iso) return 999;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 999;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function mapApiAccount(row) {
    const severity = row.severity || 'CRITICAL';
    const severityColor =
        severity === 'CRITICAL'
            ? 'text-red-600 bg-red-50'
            : severity === 'MEDIUM'
              ? 'text-orange-600 bg-orange-50'
              : 'text-blue-600 bg-blue-50';

    return {
        id: row.id,
        accountName: row.accountName || 'Unknown',
        accountType: row.accountType || 'Unknown',
        accountKind: row.accountKind || 'recruiter',
        email: row.email || '',
        issueType: row.issueType || 'Account Rejected',
        severity,
        severityColor,
        detected: formatRelativeTime(row.rejectedAt),
        rejectedAt: row.rejectedAt,
        status: row.status || 'Rejected',
        statusColor: 'text-red-600',
    };
}

function FlaggedAccounts() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('30 Days');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [flaggedAccounts, setFlaggedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const timeFilters = ['Today', '7 Days', '30 Days'];

    const loadRejectedAccounts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await httpClient.get(API_ENDPOINTS.ADMIN.REJECTED_ACCOUNTS);
            const list =
                response?.data?.accounts ??
                response?.accounts ??
                (Array.isArray(response?.data) ? response.data : []);
            setFlaggedAccounts(Array.isArray(list) ? list.map(mapApiAccount) : []);
        } catch (err) {
            console.error('Failed to load rejected accounts:', err);
            setError(err?.message || 'Failed to load rejected accounts');
            setFlaggedAccounts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadRejectedAccounts();
    }, [loadRejectedAccounts]);

    const filteredAccounts = flaggedAccounts.filter((account) => {
        const typeMatch =
            activeFilter === 'all' || account.accountType === activeFilter;

        let timeMatch = true;
        if (timeFilter !== '30 Days') {
            const daysAgo = getDaysAgoFromIso(account.rejectedAt);
            if (timeFilter === 'Today') {
                timeMatch = daysAgo === 0;
            } else if (timeFilter === '7 Days') {
                timeMatch = daysAgo <= 7;
            }
        }

        return typeMatch && timeMatch;
    });

    const getAccountTypeIcon = (type) => {
        switch (type) {
            case 'Professional':
                return <User className="h-4 w-4" />;
            case 'Recruiter':
                return <Building className="h-4 w-4" />;
            case 'Training Provider':
                return <GraduationCap className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const navigateToProfile = (account) => {
        const state =
            account.accountKind === 'trainer'
                ? { accountType: 'trainer' }
                : account.accountKind === 'professional'
                  ? { isProfessionalView: true, accountType: 'professional' }
                  : { accountType: 'recruiter' };
        navigate(`/admin/accounts/${account.id}`, { state });
    };

    const filterOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'Professional', label: 'Professionals' },
        { value: 'Recruiter', label: 'Recruiters' },
        { value: 'Training Provider', label: 'Training Providers' },
    ];

    const rejectedCount = filteredAccounts.length;

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
                            <h1 className="text-[28px] font-bold text-gray-900">Flagged Accounts</h1>
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                {rejectedCount} Rejected
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Accounts rejected by an admin during review
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                            {timeFilters.map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setTimeFilter(filter)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        timeFilter === filter
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                            >
                                <Filter className="h-4 w-4" />
                                {filterOptions.find((f) => f.value === activeFilter)?.label}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">
                                        Account Type
                                    </div>
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setActiveFilter(option.value);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                activeFilter === option.value
                                                    ? 'text-[#1e5a8f] font-semibold bg-blue-50'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeFilter !== 'all' && (
                            <button
                                type="button"
                                onClick={() => setActiveFilter('all')}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => void loadRejectedAccounts()}
                            disabled={loading}
                            className="p-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {filteredAccounts.filter((a) => a.accountType === 'Recruiter').length}
                        </h3>
                        <p className="text-sm font-medium text-gray-500">Rejected Recruiters</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {filteredAccounts.filter((a) => a.accountType === 'Professional').length}
                        </h3>
                        <p className="text-sm font-medium text-gray-500">Rejected Professionals</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {
                                filteredAccounts.filter(
                                    (a) => a.accountType === 'Training Provider',
                                ).length
                            }
                        </h3>
                        <p className="text-sm font-medium text-gray-500">Rejected Training Providers</p>
                    </div>
                </div>
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
                                    Account
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Issue Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Rejected
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#1e5a8f]" />
                                        Loading rejected accounts…
                                    </td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No rejected accounts match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gray-100">
                                                    {getAccountTypeIcon(account.accountType)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {account.accountName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {account.accountType}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {account.issueType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${account.severityColor}`}
                                            >
                                                {account.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {account.detected}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                <span className={`text-sm font-medium ${account.statusColor}`}>
                                                    {account.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigateToProfile(account)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-500 hover:text-[#1e5a8f]"
                                                title="View profile"
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

            {showFilterDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

export default FlaggedAccounts;
