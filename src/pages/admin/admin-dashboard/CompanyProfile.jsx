import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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

function formatMemberRole(role) {
    if (!role) return '—';
    const r = String(role).toUpperCase();
    if (r === 'ADMIN') return 'Admin';
    if (r === 'RECRUITER') return 'Recruiter';
    if (r === 'VIEWER') return 'Viewer';
    return role;
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

function activityDescription(log) {
    const meta = log?.metadata;
    if (meta && typeof meta === 'object' && Object.keys(meta).length) {
        try {
            const s = JSON.stringify(meta);
            return s.length > 160 ? `${s.slice(0, 157)}…` : s;
        } catch {
            return '—';
        }
    }
    return [log?.actorType, log?.targetType].filter(Boolean).join(' · ') || '—';
}

function CompanyProfile() {
    const navigate = useNavigate();
    const { id: companyId } = useParams();

    const [company, setCompany] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

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
            if (!c) {
                setError('Company not found');
                setCompany(null);
                setRecentActivity([]);
                return;
            }
            setCompany(c);
            setRecentActivity(Array.isArray(activity) ? activity : []);
        } catch (e) {
            console.error('Failed to load company:', e);
            setError(e?.message || 'Could not load company');
            setCompany(null);
            setRecentActivity([]);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadCompany();
    }, [loadCompany]);

    const href = useMemo(() => (company ? websiteHref(company) : ''), [company]);

    const teamRows = useMemo(() => {
        const members = company?.members;
        if (!Array.isArray(members)) return [];
        return members.map((m) => {
            const r = m.recruiter || {};
            const first = r.firstName || '';
            const last = r.lastName || '';
            const name = `${first} ${last}`.trim() || r.email || 'Unknown';
            const status = String(m.status || 'ACTIVE').toUpperCase();
            const active = status === 'ACTIVE';
            return {
                rowKey: m.id,
                recruiterId: m.recruiterId,
                name,
                email: r.email || '—',
                role: formatMemberRole(m.role),
                statusLabel: active ? 'Active' : status,
                statusBg: active ? 'bg-green-50' : 'bg-orange-50',
                statusColor: active ? 'text-green-600' : 'text-orange-600',
                joined: formatRelativeTime(m.joinedAt || r.createdAt),
            };
        });
    }, [company]);

    const handleDeleteClick = (row) => {
        setMemberToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!memberToDelete || !companyId) return;
        setActionBusy(true);
        try {
            await adminDashboardService.removeCompanyMember(companyId, memberToDelete.recruiterId);
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
            await loadCompany();
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Failed to remove member');
        } finally {
            setActionBusy(false);
        }
    };

    const patchCompany = async (body) => {
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
    };

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

    const tierLabel = String(company.tier || 'FREE').toUpperCase() === 'PRO' ? 'Pro' : 'Free';

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
                        <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => patchCompany({ isVerified: !company.isVerified })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {company.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => patchCompany({ isClaimed: !company.isClaimed })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {company.isClaimed ? 'Unclaim' : 'Mark claimed'}
                        </button>
                        <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => patchCompany({ tier: company.tier === 'PRO' ? 'FREE' : 'PRO' })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e5a8f]/10 text-[#1e5a8f] hover:bg-[#1e5a8f]/15 disabled:opacity-50"
                        >
                            {company.tier === 'PRO' ? 'Set tier Free' : 'Set tier Pro'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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

                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                            Team members
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                {teamRows.length}
                            </span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {teamRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                                No team members linked yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        teamRows.map((member) => (
                                            <tr key={member.rowKey} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-bold text-gray-600">
                                                                {member.name
                                                                    .split(' ')
                                                                    .filter(Boolean)
                                                                    .map((n) => n[0])
                                                                    .join('')
                                                                    .slice(0, 2) || '?'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                                            <div className="text-xs text-gray-500">{member.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-700">{member.role}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${member.statusBg} ${member.statusColor}`}
                                                    >
                                                        {member.statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-600">{member.joined}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(member)}
                                                        disabled={actionBusy}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                                            <div className="text-sm font-semibold text-gray-900 mb-0.5">{log.action || 'Event'}</div>
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

            {isDeleteModalOpen && memberToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove team member?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Remove <span className="font-semibold text-gray-900">{memberToDelete.name}</span> from this
                                company? This cannot be undone.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setMemberToDelete(null);
                                    }}
                                    disabled={actionBusy}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={actionBusy}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 inline-flex items-center justify-center gap-2"
                                >
                                    {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyProfile;
