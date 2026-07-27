import { useCallback, useEffect, useState } from 'react';
import {
    AlertTriangle,
    Ban,
    CheckCircle,
    Clock,
    Flag,
    Loader2,
    PauseCircle,
    RotateCcw,
    ShieldCheck,
    X,
} from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';
import adminModerationService from '../../services/adminModerationService';

const MIN_REASON_LENGTH = 5;

const STATUS_STYLES = {
    SUSPENDED: 'bg-orange-50 text-orange-700 border-orange-200',
    BLOCKED: 'bg-red-50 text-red-700 border-red-200',
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
};

function formatDate(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDateOnly(iso) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

const ACTION_COPY = {
    suspend: {
        title: 'Suspend account',
        blurb:
            'Pauses this account’s access to the platform. The account holder is emailed the reason and can be reinstated at any time.',
        confirmLabel: 'Suspend account',
        tone: 'orange',
        requiresReason: true,
        allowsExpiry: true,
    },
    block: {
        title: 'Block account permanently',
        blurb:
            'Permanently suspends this account for a severe breach of platform policy. The account holder is emailed the reason and may appeal.',
        confirmLabel: 'Block account',
        tone: 'red',
        requiresReason: true,
        allowsExpiry: false,
    },
    reinstate: {
        title: 'Reinstate account',
        blurb:
            'Restores the status this account held before it was moderated and emails the account holder that access is back.',
        confirmLabel: 'Reinstate account',
        tone: 'green',
        requiresReason: false,
        allowsExpiry: false,
    },
};

/**
 * Admin moderation controls for a single account: suspend, block (permanent
 * suspension), and reinstate, plus the recorded action history.
 *
 * Deliberately separate from the Stage 1 KYC approve/reject flow on the same
 * page — approval decides whether an account may join, moderation decides
 * whether an existing account keeps its access.
 *
 * @param {string} accountId
 * @param {'professional'|'recruiter'|'trainer'} [accountKind] lookup hint only
 * @param {string} [accountName]
 * @param {(moderation: object) => void} [onModerationChange]
 */
export default function AccountModerationPanel({
    accountId,
    accountKind,
    accountName = 'this account',
    onModerationChange,
}) {
    const [moderation, setModeration] = useState(null);
    const [history, setHistory] = useState([]);
    const [reportCount, setReportCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [activeAction, setActiveAction] = useState(null);
    const [reason, setReason] = useState('');
    const [suspendedUntil, setSuspendedUntil] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState('');

    const load = useCallback(async () => {
        if (!accountId) return;
        setLoading(true);
        setLoadError('');
        try {
            const data = await adminModerationService.getModerationState(accountId, accountKind);
            setModeration(data?.moderation ?? null);
            setHistory(Array.isArray(data?.history) ? data.history : []);
            setReportCount(Number(data?.reportCount) || 0);
        } catch (err) {
            setLoadError(err?.message || 'Could not load moderation status.');
            setModeration(null);
        } finally {
            setLoading(false);
        }
    }, [accountId, accountKind]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(''), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const openAction = (action) => {
        setActiveAction(action);
        setReason('');
        setSuspendedUntil('');
        setActionError('');
    };

    const closeAction = () => {
        if (submitting) return;
        setActiveAction(null);
        setReason('');
        setSuspendedUntil('');
        setActionError('');
    };

    const config = activeAction ? ACTION_COPY[activeAction] : null;
    const trimmedReason = reason.trim();
    const canConfirm =
        !submitting &&
        (!config?.requiresReason || trimmedReason.length >= MIN_REASON_LENGTH);

    const handleConfirm = async () => {
        if (!canConfirm || !activeAction) return;
        setSubmitting(true);
        setActionError('');
        try {
            let next;
            if (activeAction === 'suspend') {
                next = await adminModerationService.suspendAccount(accountId, {
                    reason: trimmedReason,
                    // <input type="date"> gives a local date; send end-of-day UTC so the
                    // suspension covers the whole chosen day.
                    suspendedUntil: suspendedUntil
                        ? new Date(`${suspendedUntil}T23:59:59Z`).toISOString()
                        : undefined,
                    accountType: accountKind,
                });
                setToast('Account suspended. The account holder has been notified.');
            } else if (activeAction === 'block') {
                next = await adminModerationService.blockAccount(accountId, {
                    reason: trimmedReason,
                    accountType: accountKind,
                });
                setToast('Account blocked. The account holder has been notified.');
            } else {
                next = await adminModerationService.reinstateAccount(accountId, {
                    note: trimmedReason || undefined,
                    accountType: accountKind,
                });
                setToast('Account reinstated. The account holder has been notified.');
            }

            setActiveAction(null);
            setReason('');
            setSuspendedUntil('');
            if (next) {
                setModeration(next);
                onModerationChange?.(next);
            }
            void load();
        } catch (err) {
            setActionError(err?.message || 'The action could not be completed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isRestricted = Boolean(moderation?.isRestricted);
    const status = String(moderation?.status || '').toUpperCase();
    const badgeStyle = STATUS_STYLES[status] || STATUS_STYLES.ACTIVE;
    const expiryLabel = formatDateOnly(moderation?.suspendedUntil);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Account Moderation
                    </h3>
                </div>
                {reportCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                        <Flag className="h-3.5 w-3.5" />
                        {reportCount} report{reportCount === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {toast && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {toast}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading moderation status…
                </div>
            ) : loadError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loadError}
                </div>
            ) : (
                <>
                    <div
                        className={`rounded-xl border px-4 py-4 mb-5 ${
                            isRestricted ? badgeStyle : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {isRestricted ? (
                                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                            )}
                            <span className="text-sm font-bold">
                                {status === 'SUSPENDED'
                                    ? 'Suspended'
                                    : status === 'BLOCKED'
                                      ? 'Blocked (permanent suspension)'
                                      : `Active — ${status || 'UNKNOWN'}`}
                            </span>
                        </div>
                        {isRestricted ? (
                            <div className="text-sm space-y-1 mt-2">
                                <p>
                                    <span className="font-semibold">Reason:</span>{' '}
                                    {moderation?.suspensionReason || 'Not recorded'}
                                </p>
                                <p>
                                    <span className="font-semibold">Since:</span>{' '}
                                    {formatDate(moderation?.suspendedAt)}
                                </p>
                                {expiryLabel && (
                                    <p className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Lifts automatically on {expiryLabel}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-1">
                                This account has full access to the platform.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isRestricted ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openAction('reinstate')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reinstate
                                </button>
                                {status !== 'BLOCKED' && (
                                    <button
                                        type="button"
                                        onClick={() => openAction('block')}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                    >
                                        <Ban className="h-4 w-4" />
                                        Escalate to block
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => openAction('suspend')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                                >
                                    <PauseCircle className="h-4 w-4" />
                                    Suspend
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openAction('block')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                >
                                    <Ban className="h-4 w-4" />
                                    Block
                                </button>
                            </>
                        )}
                    </div>

                    {history.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Moderation history
                            </h4>
                            <ul className="space-y-3">
                                {history.map((entry) => {
                                    const meta = entry.metadata || {};
                                    const label =
                                        entry.action === 'ACCOUNT_SUSPENDED'
                                            ? 'Suspended'
                                            : entry.action === 'ACCOUNT_BLOCKED'
                                              ? 'Blocked'
                                              : 'Reinstated';
                                    return (
                                        <li key={entry.id} className="flex gap-3">
                                            <div
                                                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                                    entry.action === 'ACCOUNT_REINSTATED'
                                                        ? 'bg-green-500'
                                                        : entry.action === 'ACCOUNT_BLOCKED'
                                                          ? 'bg-red-500'
                                                          : 'bg-orange-500'
                                                }`}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {label}
                                                    <span className="ml-2 text-xs font-normal text-gray-400">
                                                        {formatDate(entry.createdAt)}
                                                    </span>
                                                </p>
                                                {(meta.reason || meta.note) && (
                                                    <p className="text-sm text-gray-600 break-words">
                                                        {meta.reason || meta.note}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </>
            )}

            <ModalOverlay isOpen={Boolean(activeAction)} onClose={closeAction} className="max-w-lg">
                {config && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>
                                <p className="text-sm text-gray-500">{accountName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeAction}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            <p className="text-sm text-gray-600">{config.blurb}</p>

                            <div>
                                <label
                                    htmlFor="moderation-reason"
                                    className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                                >
                                    {config.requiresReason ? 'Reason (sent to the user)' : 'Internal note (optional)'}
                                </label>
                                <textarea
                                    id="moderation-reason"
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={
                                        config.requiresReason
                                            ? 'e.g. Multiple members reported fraudulent job offers from this account.'
                                            : 'e.g. Appeal reviewed — documents verified as genuine.'
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]"
                                />
                                {config.requiresReason && trimmedReason.length < MIN_REASON_LENGTH && (
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        At least {MIN_REASON_LENGTH} characters.
                                    </p>
                                )}
                            </div>

                            {config.allowsExpiry && (
                                <div>
                                    <label
                                        htmlFor="moderation-expiry"
                                        className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                                    >
                                        Lift automatically on (optional)
                                    </label>
                                    <input
                                        id="moderation-expiry"
                                        type="date"
                                        value={suspendedUntil}
                                        min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                                        onChange={(e) => setSuspendedUntil(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        Leave empty to keep the account suspended until an admin reinstates it.
                                    </p>
                                </div>
                            )}

                            {actionError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {actionError}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={closeAction}
                                disabled={submitting}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleConfirm()}
                                disabled={!canConfirm}
                                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                                    config.tone === 'green'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : config.tone === 'orange'
                                          ? 'bg-orange-500 hover:bg-orange-600'
                                          : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {config.confirmLabel}
                            </button>
                        </div>
                    </div>
                )}
            </ModalOverlay>
        </div>
    );
}
