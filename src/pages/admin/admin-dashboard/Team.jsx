import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Loader2, Mail, Pencil, RefreshCw, ShieldCheck, UserPlus, X } from 'lucide-react';
import adminTeamService from '../../../services/adminTeamService';

// Fallback descriptions; the API sends the same text with the access levels.
const ROLE_HELP = {
    SUPER_ADMIN: 'Full access, including revenue, commission, payouts and managing the admin team.',
    OPERATIONS_MANAGER:
        'Access to the admin panel except revenue, commission, payouts and managing the admin team.',
};

// Suggestions only: any title can be typed. A title is a label; what someone
// can see comes from their access level.
const TITLE_SUGGESTIONS = [
    'Operations Manager',
    'Developer',
    'Support Agent',
    'Compliance Officer',
    'Content Manager',
    'Marketing Manager',
];

const TITLE_PATTERN = /^[\p{L}\p{N} &.,'()/+-]*$/u;
const titleProblem = (value) => {
    const t = value.trim();
    if (t.length > 60) return 'Title must be 60 characters or fewer.';
    if (!TITLE_PATTERN.test(t)) return 'Title can use letters, numbers, spaces and & . , \' ( ) / + - only.';
    return '';
};

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const errorText = (err, fallback) => err?.data?.message || err?.message || fallback;

function Badge({ children, tone = 'gray' }) {
    const tones = {
        gray: 'bg-gray-100 text-gray-700',
        blue: 'bg-blue-50 text-[#1e5a8f]',
        green: 'bg-green-50 text-green-700',
        amber: 'bg-amber-50 text-amber-700',
        red: 'bg-red-50 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tones[tone]}`}>
            {children}
        </span>
    );
}

/** /admin/team — super admins invite collaborators and manage roles. */
function Team() {
    const [team, setTeam] = useState({ members: [], invitations: [], invitableRoles: [] });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [notice, setNotice] = useState('');
    const [actionError, setActionError] = useState('');
    const [busyId, setBusyId] = useState('');

    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('OPERATIONS_MANAGER');
    const [inviteTitle, setInviteTitle] = useState('');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');

    const load = useCallback(async () => {
        setLoadError('');
        try {
            setTeam(await adminTeamService.getTeam());
        } catch (err) {
            setLoadError(errorText(err, 'Could not load the admin team.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!notice) return undefined;
        const t = setTimeout(() => setNotice(''), 3500);
        return () => clearTimeout(t);
    }, [notice]);

    const run = async (id, action, successMessage) => {
        setBusyId(id);
        setActionError('');
        try {
            await action();
            setNotice(successMessage);
            await load();
        } catch (err) {
            setActionError(errorText(err, 'That did not work. Please try again.'));
        } finally {
            setBusyId('');
        }
    };

    const submitInvite = async (e) => {
        e.preventDefault();
        setInviteError('');
        const email = inviteEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setInviteError('Please enter a valid email address.');
            return;
        }
        const problem = titleProblem(inviteTitle);
        if (problem) {
            setInviteError(problem);
            return;
        }
        setInviting(true);
        try {
            await adminTeamService.invite({ email, role: inviteRole, title: inviteTitle.trim() });
            setShowInvite(false);
            setInviteEmail('');
            setInviteRole('OPERATIONS_MANAGER');
            setInviteTitle('');
            setNotice(`Invitation sent to ${email}`);
            await load();
        } catch (err) {
            setInviteError(errorText(err, 'Could not send the invitation.'));
        } finally {
            setInviting(false);
        }
    };

    const roleOptions = team.invitableRoles?.length
        ? team.invitableRoles
        : [
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'OPERATIONS_MANAGER', label: 'Team Member' },
          ];

    const editTitle = (member) => {
        const who = member.name || member.email;
        const next = window.prompt(`Title for ${who} (leave empty to remove it):`, member.title || '');
        if (next === null) return;
        const problem = titleProblem(next);
        if (problem) {
            setActionError(problem);
            return;
        }
        if (next.trim() === (member.title || '')) return;
        run(member.id, () => adminTeamService.updateTitle(member.id, next.trim()), 'Title updated');
    };

    const activeMembers = team.members.filter((m) => m.status === 'ACTIVE');
    const deactivatedMembers = team.members.filter((m) => m.status !== 'ACTIVE');

    return (
        <div className="p-6 relative">
            {notice && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{notice}</span>
                </div>
            )}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">Team</h1>
                    <p className="text-sm text-gray-500">
                        Invite collaborators to the admin panel, give them a title and choose what they can access.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setInviteError('');
                        setShowInvite(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#003971] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#002855]"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite collaborator
                </button>
            </div>

            {actionError && (
                <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {actionError}
                </p>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading team…
                </div>
            ) : loadError ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{loadError}</p>
            ) : (
                <div className="space-y-6">
                    {/* Pending invitations */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-4">Pending invitations</h2>
                        {team.invitations.length === 0 ? (
                            <p className="text-sm text-gray-500">No pending invitations.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {team.invitations.map((invite) => (
                                    <li key={invite.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 break-all flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                                {invite.email}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {invite.title ? `${invite.title} · ` : ''}
                                                {invite.roleLabel} access · sent {formatDate(invite.createdAt)}
                                                {invite.invitedBy ? ` by ${invite.invitedBy}` : ''} ·{' '}
                                                {invite.status === 'EXPIRED'
                                                    ? 'expired'
                                                    : `expires ${formatDate(invite.expiresAt)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {invite.status === 'EXPIRED' ? (
                                                <Badge tone="red">Expired</Badge>
                                            ) : (
                                                <Badge tone="amber">Pending</Badge>
                                            )}
                                            <button
                                                type="button"
                                                disabled={busyId === invite.id}
                                                onClick={() =>
                                                    run(
                                                        invite.id,
                                                        () => adminTeamService.resendInvitation(invite.id),
                                                        `Invitation re-sent to ${invite.email}`
                                                    )
                                                }
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e5a8f] hover:underline disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" /> Resend
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busyId === invite.id}
                                                onClick={() => {
                                                    if (!window.confirm(`Cancel the invitation for ${invite.email}?`)) return;
                                                    run(
                                                        invite.id,
                                                        () => adminTeamService.revokeInvitation(invite.id),
                                                        'Invitation cancelled'
                                                    );
                                                }}
                                                className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Members */}
                    {[
                        { title: 'Team members', list: activeMembers, empty: 'No active team members.' },
                        { title: 'Deactivated', list: deactivatedMembers, empty: null },
                    ].map(({ title, list, empty }) =>
                        list.length === 0 && !empty ? null : (
                            <section key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-base font-bold text-gray-900 mb-4">
                                    {title} <span className="text-gray-400 font-normal">({list.length})</span>
                                </h2>
                                {list.length === 0 ? (
                                    <p className="text-sm text-gray-500">{empty}</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {list.map((member) => {
                                            const active = member.status === 'ACTIVE';
                                            const editableRole = ['SUPER_ADMIN', 'OPERATIONS_MANAGER'].includes(member.role)
                                                ? member.role
                                                : '';
                                            return (
                                                <li key={member.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 break-all">
                                                            {member.name || member.email}
                                                            {member.isYou && <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>}
                                                        </p>
                                                        {member.title && (
                                                            <p className="text-xs font-medium text-[#1e5a8f]">{member.title}</p>
                                                        )}
                                                        {member.name && <p className="text-xs text-gray-500 break-all">{member.email}</p>}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Joined {formatDate(member.createdAt)} · last sign-in {formatDate(member.lastLoginAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                        {member.isYou || !active ? (
                                                            <Badge tone={member.role === 'SUPER_ADMIN' ? 'blue' : 'gray'}>
                                                                {member.role === 'SUPER_ADMIN' && <ShieldCheck className="h-3 w-3 mr-1" />}
                                                                {member.roleLabel}
                                                            </Badge>
                                                        ) : (
                                                            <select
                                                                aria-label={`Access for ${member.email}`}
                                                                value={editableRole}
                                                                disabled={busyId === member.id}
                                                                onChange={(e) => {
                                                                    const next = e.target.value;
                                                                    if (!next || next === member.role) return;
                                                                    const label = roleOptions.find((r) => r.value === next)?.label || next;
                                                                    if (!window.confirm(`Change ${member.email} to ${label} access?`)) return;
                                                                    run(member.id, () => adminTeamService.changeRole(member.id, next), 'Access updated');
                                                                }}
                                                                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                                                            >
                                                                {!editableRole && <option value="">{member.roleLabel}</option>}
                                                                {roleOptions.map((r) => (
                                                                    <option key={r.value} value={r.value}>
                                                                        {r.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                        {active && (
                                                            <button
                                                                type="button"
                                                                disabled={busyId === member.id}
                                                                onClick={() => editTitle(member)}
                                                                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e5a8f] hover:underline disabled:opacity-50"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" /> Edit title
                                                            </button>
                                                        )}
                                                        {!member.isYou &&
                                                            (active ? (
                                                                <button
                                                                    type="button"
                                                                    disabled={busyId === member.id}
                                                                    onClick={() => {
                                                                        if (
                                                                            !window.confirm(
                                                                                `Deactivate ${member.email}? They will be signed out and can no longer access the admin panel.`
                                                                            )
                                                                        )
                                                                            return;
                                                                        run(member.id, () => adminTeamService.deactivate(member.id), 'Team member deactivated');
                                                                    }}
                                                                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                                                                >
                                                                    Deactivate
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    disabled={busyId === member.id}
                                                                    onClick={() =>
                                                                        run(member.id, () => adminTeamService.reactivate(member.id), 'Team member reactivated')
                                                                    }
                                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline disabled:opacity-50"
                                                                >
                                                                    Reactivate
                                                                </button>
                                                            ))}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>
                        )
                    )}
                </div>
            )}

            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Invite collaborator</h2>
                                <p className="text-sm text-gray-500">They will get an email to set their password.</p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => setShowInvite(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {inviteError && (
                            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {inviteError}
                            </p>
                        )}
                        <form onSubmit={submitInvite} className="space-y-4">
                            <div>
                                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    id="invite-email"
                                    type="email"
                                    required
                                    autoFocus
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971]"
                                />
                            </div>
                            <div>
                                <label htmlFor="invite-title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    id="invite-title"
                                    type="text"
                                    list="invite-title-suggestions"
                                    maxLength={60}
                                    value={inviteTitle}
                                    onChange={(e) => setInviteTitle(e.target.value)}
                                    placeholder="e.g. Developer"
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971]"
                                />
                                <datalist id="invite-title-suggestions">
                                    {TITLE_SUGGESTIONS.map((t) => (
                                        <option key={t} value={t} />
                                    ))}
                                </datalist>
                                <p className="mt-1 text-xs text-gray-500">
                                    Shown on the team list. It doesn&apos;t change what they can see — access below does.
                                </p>
                            </div>
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 mb-2">Access</legend>
                                <div className="space-y-2">
                                    {roleOptions.map((r) => (
                                        <label
                                            key={r.value}
                                            className={`flex gap-3 p-3 border rounded-lg cursor-pointer ${
                                                inviteRole === r.value ? 'border-[#003971] bg-blue-50/50' : 'border-gray-200'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="invite-role"
                                                value={r.value}
                                                checked={inviteRole === r.value}
                                                onChange={() => setInviteRole(r.value)}
                                                className="mt-1"
                                            />
                                            <span>
                                                <span className="block text-sm font-semibold text-gray-900">{r.label}</span>
                                                <span className="block text-xs text-gray-500">{r.description || ROLE_HELP[r.value]}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInvite(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="inline-flex items-center gap-2 bg-[#003971] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002855] disabled:opacity-50"
                                >
                                    {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Send invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Team;
