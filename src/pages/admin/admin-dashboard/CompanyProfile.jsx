import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, RefreshCw, Users } from 'lucide-react';
import adminDashboardService from '../../../services/adminDashboardService';

function formatRelativeTime(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '—';
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
        return '—';
    }
}

function formatOrgType(type) {
    if (type === 'TRAINING_AGENT') return 'Training Provider';
    if (type === 'RECRUITMENT_AGENT') return 'Recruiting Agency';
    return type || '—';
}

function isAgentOrganization(type) {
    const t = String(type || '').toUpperCase();
    return t === 'RECRUITMENT_AGENT' || t === 'TRAINING_AGENT';
}

function websiteHref(company) {
    const site = (company?.website || '').trim();
    const domain = (company?.domain || '').trim();
    if (site && /^https?:\/\//i.test(site)) return site;
    if (site) return `https://${site.replace(/^\/\//, '')}`;
    if (domain) return `https://${domain}`;
    return '';
}

function displayWebsiteLabel(company) {
    const site = (company?.website || '').trim();
    const domain = (company?.domain || '').trim();
    return site || domain || '—';
}

function formatHeadquarters(c) {
    const parts = [c?.address, [c?.city, c?.state].filter(Boolean).join(', '), c?.zip, c?.country]
        .filter((p) => p && String(p).trim())
        .map((p) => String(p).trim());
    const unique = [...new Set(parts)];
    return unique.length ? unique.join(' · ') : '—';
}

function activityAccent(action) {
    const a = String(action || '').toUpperCase();
    if (a.includes('REMOVE') || a.includes('DELETE') || a.includes('FAIL')) return 'bg-red-500';
    if (a.includes('UPDATE') || a.includes('VERIFY') || a.includes('CLAIM')) return 'bg-green-500';
    if (a.includes('MEMBER') || a.includes('ADD')) return 'bg-blue-500';
    return 'bg-gray-400';
}

const COMPANY_MEMBER_ACTIONS = new Set([
    'COMPANY_MEMBER_REMOVED',
    'COMPANY_MEMBER_ADDED',
]);

function formatActivityAction(action) {
    const labels = {
        COMPANY_UPDATED: 'Company profile updated',
    };
    if (labels[action]) return labels[action];
    const raw = String(action || 'Event');
    return raw
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

function activityDescription(log) {
    const action = String(log?.action || '');
    const meta = log?.metadata;

    if (action === 'COMPANY_UPDATED' && meta && typeof meta === 'object') {
        const parts = [];
        if (typeof meta.isClaimed === 'boolean') {
            parts.push(meta.isClaimed ? 'Marked as claimed' : 'Marked as unclaimed');
        }
        if (meta.tier) {
            parts.push(`Tier set to ${String(meta.tier).toUpperCase()}`);
        }
        if (parts.length) return parts.join(' · ');
    }

    if (meta && typeof meta === 'object' && Object.keys(meta).length) {
        return '—';
    }
    return [log?.actorType, log?.targetType].filter(Boolean).join(' · ') || '—';
}

function CompanyProfile() {
    const navigate = useNavigate();
    const { id: companyId } = useParams();

    const [company, setCompany] = useState(null);
    const [staff, setStaff] = useState([]);
    const [canMerge, setCanMerge] = useState(false);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);

    const loadCompany = useCallback(async () => {
        if (!companyId) {
            setError('Missing company id');
            setLoading(false);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await adminDashboardService.getCompanyById(companyId);
            const payload = res?.data ?? res;
            const c = payload?.company ?? res?.company;
            const activity = payload?.recentActivity ?? res?.recentActivity ?? [];
            const staffList = payload?.staff ?? res?.staff ?? [];
            if (!c) {
                setError('Company not found');
                setCompany(null);
                setStaff([]);
                setRecentActivity([]);
                return;
            }
            setCompany(c);
            setStaff(Array.isArray(staffList) ? staffList : []);
            setCanMerge(Boolean(payload?.canMerge ?? res?.canMerge));
            setRecentActivity(
                Array.isArray(activity)
                    ? activity.filter((log) => !COMPANY_MEMBER_ACTIONS.has(log?.action))
                    : []
            );
        } catch (e) {
            console.error('Failed to load company:', e);
            setError(e?.message || 'Could not load company');
            setCompany(null);
            setStaff([]);
            setRecentActivity([]);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    const href = useMemo(() => (company ? websiteHref(company) : ''), [company]);

    const patchCompany = useCallback(
        async (body) => {
            if (!companyId) return;
            setActionBusy(true);
            setError(null);
            try {
                await adminDashboardService.updateCompany(companyId, body);
                await loadCompany();
            } catch (e) {
                console.error(e);
                setError(e?.message || 'Update failed');
            } finally {
                setActionBusy(false);
            }
        },
        [companyId, loadCompany]
    );

    const handleMergeStaff = useCallback(async () => {
        if (!staff.length) return;
        setActionBusy(true);
        setError(null);
        try {
            const res = await adminDashboardService.mergeCompanies({
                recruiterIds: staff.map((member) => member.id),
                name: company?.name,
            });
            const mergedId = res?.data?.company?.id ?? res?.company?.id;
            if (mergedId && mergedId !== companyId) {
                navigate(`/admin/companies/${mergedId}`, { replace: true });
                return;
            }
            await loadCompany();
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Merge failed');
        } finally {
            setActionBusy(false);
        }
    }, [staff, company?.name, companyId, navigate, loadCompany]);

    const staffAccountPath = useCallback(
        (member) =>
            `/admin/accounts/${member.id}?dashboardType=${
                member.role === 'TRAINING_AGENT' ? 'training-provider' : 'recruiter'
            }`,
        []
    );

    if (loading && !company) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-600">
                <Loader2 className="h-8 w-8 animate-spin text-[#1e5a8f]" />
                <p className="text-sm">Loading company…</p>
            </div>
        );
    }

    if (error && !company) {
        return (
            <div className="min-h-screen bg-gray-50/50 max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate('/admin/companies')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Companies
                </button>
                <div className="bg-white rounded-2xl border border-red-100 p-6 flex gap-3 items-start">
                    <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="font-semibold text-gray-900 mb-1">Could not load company</h2>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <button
                            type="button"
                            onClick={loadCompany}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#1e5a8f] hover:underline"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!company) return null;

    const agentOrg = isAgentOrganization(company.type);
    const tierLabel = agentOrg
        ? 'Free'
        : String(company.tier || 'FREE').toUpperCase() === 'PRO'
          ? 'Pro'
          : 'Free';

    return (
        <div className="min-h-screen bg-gray-50/50">
            <button
                type="button"
                onClick={() => navigate('/admin/companies')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Companies
            </button>

            {error && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name || '—'}</h1>
                        {href ? (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-[#1e5a8f] hover:underline"
                            >
                                {displayWebsiteLabel(company)}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        ) : (
                            <span className="text-sm text-gray-500">{displayWebsiteLabel(company)}</span>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                                {tierLabel}
                            </span>
                            <span
                                className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                    company.isVerified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                }`}
                                title={
                                    company.isVerified
                                        ? 'Organization data verified via Gemini'
                                        : 'Organization data not verified via Gemini'
                                }
                            >
                                {company.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <span
                                className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                    company.isClaimed ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {company.isClaimed ? 'Claimed' : 'Unclaimed'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {canMerge ? (
                            <button
                                type="button"
                                disabled={actionBusy}
                                onClick={handleMergeStaff}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 disabled:opacity-50"
                            >
                                Merge into company profile
                            </button>
                        ) : null}
                        <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => patchCompany({ isClaimed: !company.isClaimed })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {company.isClaimed ? 'Unclaim' : 'Mark claimed'}
                        </button>
                        {!agentOrg ? (
                            <button
                                type="button"
                                disabled={actionBusy}
                                onClick={() => patchCompany({ tier: company.tier === 'PRO' ? 'FREE' : 'PRO' })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e5a8f]/10 text-[#1e5a8f] hover:bg-[#1e5a8f]/15 disabled:opacity-50"
                            >
                                {company.tier === 'PRO' ? 'Set tier Free' : 'Set tier Pro'}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Users className="h-5 w-5 text-[#1e5a8f]" />
                                Registered staff ({staff.length})
                            </h3>
                        </div>
                        {staff.length === 0 ? (
                            <p className="text-sm text-gray-500">No staff registered for this company yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                                            <th className="pb-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                            <th className="pb-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                            <th className="pb-3 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
                                            <th className="pb-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {staff.map((member) => {
                                            const fullName = [member.firstName, member.lastName]
                                                .filter(Boolean)
                                                .join(' ')
                                                .trim();
                                            return (
                                                <tr key={member.id} className="hover:bg-gray-50/50">
                                                    <td className="py-3 pr-4">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {fullName || member.organizationName || '—'}
                                                        </div>
                                                        {!member.isLinked ? (
                                                            <span className="text-xs text-orange-600">Not linked</span>
                                                        ) : null}
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-600">{member.email}</td>
                                                    <td className="py-3 pr-4">
                                                        <span className="text-xs font-semibold text-gray-700">
                                                            {member.status || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4 text-sm text-gray-500">
                                                        {formatRelativeTime(member.createdAt)}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Link
                                                            to={staffAccountPath(member)}
                                                            className="text-sm font-bold text-[#1e5a8f] hover:underline"
                                                        >
                                                            View account
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-5">Company information</h3>
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                        Legal name
                                    </span>
                                    <div className="text-sm font-semibold text-gray-900">{company.name || '—'}</div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                        Organization type
                                    </span>
                                    <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                        {formatOrgType(company.type)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                    Headquarters
                                </span>
                                <div className="text-sm font-semibold text-gray-900">{formatHeadquarters(company)}</div>
                            </div>
                            {(company.email || company.linkedIn) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {company.email ? (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                                Email
                                            </span>
                                            <a href={`mailto:${company.email}`} className="text-sm text-[#1e5a8f] hover:underline break-all">
                                                {company.email}
                                            </a>
                                        </div>
                                    ) : null}
                                    {company.linkedIn ? (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                                LinkedIn
                                            </span>
                                            <a
                                                href={
                                                    company.linkedIn.startsWith('http')
                                                        ? company.linkedIn
                                                        : `https://${company.linkedIn}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#1e5a8f] hover:underline break-all"
                                            >
                                                {company.linkedIn}
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                        Profile created
                                    </span>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {company.createdAt
                                            ? new Date(company.createdAt).toLocaleDateString(undefined, {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                                        Last updated
                                    </span>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatRelativeTime(company.updatedAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Recent activity</h3>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-gray-500">No activity logged yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((log, index) => (
                                    <div key={log.id || index} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2 h-2 ${activityAccent(log.action)} rounded-full`} />
                                            {index < recentActivity.length - 1 && (
                                                <div className="w-0.5 flex-1 min-h-[12px] bg-gray-200 mt-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="text-sm font-semibold text-gray-900 mb-0.5">
                                                {formatActivityAction(log.action)}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">{activityDescription(log)}</div>
                                            <div className="text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompanyProfile;
