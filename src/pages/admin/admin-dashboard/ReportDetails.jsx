import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    ExternalLink,
    Flag,
    Loader2,
    MessageSquare,
    ShieldAlert,
    StickyNote,
    User,
} from 'lucide-react';
import adminModerationService from '../../../services/adminModerationService';
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS } from '../../../services/reportService';

const STATUS_BADGE = {
    PENDING: 'bg-orange-50 text-orange-700',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700',
    ACTIONED: 'bg-green-50 text-green-700',
    DISMISSED: 'bg-gray-100 text-gray-600',
};

const ACTION_OPTIONS = [
    { value: 'NONE', label: 'No action — no policy breach found' },
    { value: 'WARNING_ISSUED', label: 'Warning issued to the account' },
    { value: 'ACCOUNT_SUSPENDED', label: 'Account suspended' },
    { value: 'ACCOUNT_BLOCKED', label: 'Account permanently suspended (blocked)' },
];

function formatDate(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Review screen for a single member report.
 *
 * Recording an outcome here closes the report and emails the reporter. Actually
 * suspending or blocking the reported account is done on the account profile, so
 * the moderation decision and the account state stay in one place.
 */
function ReportDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [actionTaken, setActionTaken] = useState('NONE');
    const [resolutionNote, setResolutionNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [toast, setToast] = useState('');

    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [noteError, setNoteError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const payload = await adminModerationService.getReportById(id);
            setData(payload);
            setActionTaken(payload?.report?.actionTaken || 'NONE');
            setResolutionNote(payload?.report?.resolutionNote || '');
            setNotes(payload?.report?.notes || []);
        } catch (err) {
            setError(err?.message || 'Failed to load this report');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(''), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const report = data?.report;
    const reportedAccount = data?.reportedAccount;
    const otherReports = data?.otherReports || [];
    const conversation = data?.conversation;
    const isClosed = report?.status === 'ACTIONED' || report?.status === 'DISMISSED';

    const save = async (nextStatus) => {
        if (!report) return;
        const needsNote = nextStatus === 'ACTIONED' || nextStatus === 'DISMISSED';
        if (needsNote && !resolutionNote.trim()) {
            setSaveError('Add a resolution note before closing this report.');
            return;
        }

        setSaving(true);
        setSaveError('');
        try {
            const updated = await adminModerationService.updateReport(report.id, {
                status: nextStatus,
                actionTaken,
                resolutionNote: resolutionNote.trim() || undefined,
            });
            setData((prev) => (prev ? { ...prev, report: updated || prev.report } : prev));
            setToast(
                nextStatus === 'UNDER_REVIEW'
                    ? 'Report marked as under review.'
                    : 'Report closed. The reporter has been notified.',
            );
        } catch (err) {
            setSaveError(err?.message || 'Could not update this report. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addNote = async () => {
        const content = newNote.trim();
        if (!content || addingNote) return;

        setAddingNote(true);
        setNoteError('');
        try {
            const created = await adminModerationService.addReportNote(report.id, content);
            if (created) setNotes((prev) => [...prev, created]);
            setNewNote('');
            setToast('Note added.');
        } catch (err) {
            setNoteError(err?.message || 'Could not add this note. Please try again.');
        } finally {
            setAddingNote(false);
        }
    };

    const openReportedAccount = () => {
        if (!report?.reportedId) return;
        navigate(`/admin/accounts/${report.reportedId}`, {
            state:
                report.reportedType === 'PROFESSIONAL'
                    ? { isProfessionalView: true, accountType: 'professional' }
                    : { accountType: 'recruiter' },
        });
    };

    if (loading) {
        return (
            <div className="max-w-5xl flex items-center gap-2 py-16 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading report…
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="max-w-5xl">
                <button
                    type="button"
                    onClick={() => navigate('/admin/reports')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to reports
                </button>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error || 'Report not found.'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <button
                    type="button"
                    onClick={() => navigate('/admin/reports')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to reports
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[28px] font-bold text-gray-900">{report.reference}</h1>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {REPORT_STATUS_LABELS[report.status] || report.status}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Filed {formatDate(report.createdAt)}</p>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {toast}
                </div>
            )}

            {otherReports.length > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    This account has {otherReports.length} other report
                    {otherReports.length === 1 ? '' : 's'} on file.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldAlert className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Reported account
                        </h3>
                    </div>
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">Name</dt>
                            <dd className="font-semibold text-gray-900">{report.reportedName || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">Email</dt>
                            <dd className="text-gray-700">{report.reportedEmail || '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                Current status
                            </dt>
                            <dd className="text-gray-700">
                                {reportedAccount?.status || 'Unknown'}
                                {reportedAccount?.suspensionReason && (
                                    <span className="block text-xs text-gray-500 mt-1">
                                        {reportedAccount.suspensionReason}
                                    </span>
                                )}
                            </dd>
                        </div>
                    </dl>
                    <button
                        type="button"
                        onClick={openReportedAccount}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open account to suspend or block
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Flag className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            The report
                        </h3>
                    </div>
                    <dl className="space-y-4 text-sm">
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">Reason</dt>
                            <dd className="font-semibold text-gray-900">
                                {report.reasonLabel ||
                                    REPORT_REASON_LABELS[report.reason] ||
                                    report.reason}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">Details</dt>
                            <dd className="text-gray-700 whitespace-pre-wrap break-words">
                                {report.details}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                Reported by
                            </dt>
                            <dd className="text-gray-700 flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                {report.reporterName || '—'}
                                <span className="text-xs text-gray-400">{report.reporterEmail}</span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {conversation?.messages?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Reported conversation ({conversation.messages.length} most recent messages)
                        </h3>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {[...conversation.messages].reverse().map((message) => (
                            <div key={message.id} className="bg-gray-50 rounded-lg px-4 py-3">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <span className="text-xs font-bold text-gray-600">
                                        {message.senderType}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatDate(message.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 break-words">{message.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {otherReports.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Other reports against this account
                    </h3>
                    <ul className="divide-y divide-gray-100">
                        {otherReports.map((other) => (
                            <li key={other.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {other.reference}
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            {other.reasonLabel ||
                                                REPORT_REASON_LABELS[other.reason] ||
                                                other.reason}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        By {other.reporterName || 'Unknown'} • {formatDate(other.createdAt)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/reports/${other.id}`)}
                                    className="text-sm font-semibold text-[#1e5a8f] hover:text-[#164773] flex-shrink-0"
                                >
                                    View
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-1">
                    <StickyNote className="h-4 w-4 text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Internal notes{notes.length > 0 ? ` (${notes.length})` : ''}
                    </h3>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                    Visible to admins only. Adding a note does not change the report&apos;s status.
                </p>

                {notes.length > 0 && (
                    <ul className="space-y-3 mb-5">
                        {notes.map((note) => (
                            <li key={note.id} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {note.admin?.email || note.adminEmail || 'Admin'}
                                    </span>
                                    <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {note.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <label htmlFor="report-new-note" className="sr-only">
                    Add an internal note
                </label>
                <textarea
                    id="report-new-note"
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note for other admins…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]"
                />

                {noteError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {noteError}
                    </div>
                )}

                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={() => void addNote()}
                        disabled={addingNote || !newNote.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addingNote && <Loader2 className="h-4 w-4 animate-spin" />}
                        Add note
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">
                    Review outcome
                </h3>

                {isClosed && (
                    <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                        Closed {formatDate(report.reviewedAt)}
                        {report.reviewedBy?.email ? ` by ${report.reviewedBy.email}` : ''}. You can
                        still amend the outcome below.
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label
                            htmlFor="report-action"
                            className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                        >
                            Action taken
                        </label>
                        <select
                            id="report-action"
                            value={actionTaken}
                            onChange={(e) => setActionTaken(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]"
                        >
                            {ACTION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="report-note"
                            className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                        >
                            Resolution note (internal)
                        </label>
                        <textarea
                            id="report-note"
                            rows={4}
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="What did the investigation find, and what was decided?"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]"
                        />
                    </div>

                    {saveError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {saveError}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        {report.status === 'PENDING' && (
                            <button
                                type="button"
                                onClick={() => void save('UNDER_REVIEW')}
                                disabled={saving}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Mark under review
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => void save('DISMISSED')}
                            disabled={saving}
                            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                            Dismiss report
                        </button>
                        <button
                            type="button"
                            onClick={() => void save('ACTIONED')}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Close as actioned
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportDetails;
