import { useEffect, useMemo, useState } from 'react';
import {
    MessageSquare,
    Send,
    Plus,
    RefreshCw,
    Clock,
    AlertTriangle,
    Loader2,
    X,
    Info,
} from 'lucide-react';
import userSupportService from '../../services/userSupportService';

const DEFAULT_CATEGORIES = [
    'Account Access',
    'Subscription',
    'Billing',
    'Document Wallet',
    'Course Booking',
    'Job Application',
    'Technical Issue',
    'Other',
];

const priorityMeta = {
    HIGH: { label: 'High', className: 'bg-red-50 text-red-700 border-red-100' },
    MEDIUM: { label: 'Medium', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    LOW: { label: 'Low', className: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const statusMeta = {
    OPEN: { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-100' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    WAITING: { label: 'Waiting', className: 'bg-orange-50 text-orange-700 border-orange-100' },
    RESOLVED: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-100' },
    CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const getInitials = (name = '') =>
    String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'SC';

function SupportCenterSection({
    basePath,
    title = 'Support',
    description = 'Create a support request, track progress, and continue the conversation with admin.',
    priorityDefault = 'MEDIUM',
    categoryOptions = DEFAULT_CATEGORIES,
    caseLabel = 'Support case',
}) {
    const [subject, setSubject] = useState('');
    const [descriptionText, setDescriptionText] = useState('');
    const [category, setCategory] = useState(categoryOptions[0] || 'Other');
    const [priority, setPriority] = useState(priorityDefault);
    const [loadingCases, setLoadingCases] = useState(true);
    const [creating, setCreating] = useState(false);
    const [replying, setReplying] = useState(false);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedCaseLoading, setSelectedCaseLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const resolvedPriority = useMemo(() => String(priority || priorityDefault || 'MEDIUM').toUpperCase(), [priority, priorityDefault]);

    const loadCases = async () => {
        setLoadingCases(true);
        try {
            const response = await userSupportService.getCases(basePath, { page: 1, limit: 20 });
            setCases(response?.data?.cases || []);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || `Failed to load ${caseLabel.toLowerCase()}s.` });
            setCases([]);
        } finally {
            setLoadingCases(false);
        }
    };

    useEffect(() => {
        void loadCases();
        setPriority(priorityDefault);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [basePath, priorityDefault]);

    const openCase = async (caseItem) => {
        if (!caseItem) return;
        setSelectedCaseLoading(true);
        setSelectedCase(null);
        setReplyText('');
        try {
            const response = await userSupportService.getCaseById(basePath, caseItem.caseId || caseItem.id);
            setSelectedCase(response?.data?.case || caseItem);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || `Failed to open ${caseLabel.toLowerCase()}.` });
            setSelectedCase(caseItem);
        } finally {
            setSelectedCaseLoading(false);
        }
    };

    const handleCreateCase = async () => {
        const nextSubject = subject.trim();
        const nextDescription = descriptionText.trim();
        if (!nextSubject || !nextDescription) {
            setMessage({ type: 'error', text: 'Subject and description are required.' });
            return;
        }

        setCreating(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await userSupportService.createCase(basePath, {
                subject: nextSubject,
                description: nextDescription,
                category,
                priority: resolvedPriority,
            });

            setSubject('');
            setDescriptionText('');
            setPriority(priorityDefault);
            await loadCases();
            const createdCase = response?.data?.case;
            if (createdCase) {
                await openCase(createdCase);
            }
            setMessage({ type: 'success', text: 'Support request submitted successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to create support request.' });
        } finally {
            setCreating(false);
        }
    };

    const handleReply = async () => {
        const messageText = replyText.trim();
        if (!messageText || !selectedCase) return;

        setReplying(true);
        try {
            await userSupportService.addReply(basePath, selectedCase.caseId || selectedCase.id, {
                content: messageText,
            });
            setReplyText('');
            await openCase(selectedCase);
            await loadCases();
            setMessage({ type: 'success', text: 'Message sent to support.' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to send message.' });
        } finally {
            setReplying(false);
        }
    };

    const selectedNotes = Array.isArray(selectedCase?.notes) ? selectedCase.notes : [];
    const status = String(selectedCase?.status || 'OPEN').toUpperCase();
    const priorityKey = String(selectedCase?.priority || resolvedPriority).toUpperCase();
    const statusInfo = statusMeta[status] || statusMeta.OPEN;
    const priorityInfo = priorityMeta[priorityKey] || priorityMeta.MEDIUM;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{description}</p>
                    </div>
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003971]">
                        Priority default: {priorityInfo.label}
                    </div>
                </div>

                {message.text && (
                    <div
                        className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                            message.type === 'error'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-green-200 bg-green-50 text-green-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Plus className="h-4 w-4 text-[#003971]" />
                            <h3 className="text-sm font-semibold text-gray-900">Create Support Request</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Account Access Issue"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/15"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/15"
                                >
                                    {categoryOptions.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Description</label>
                                <textarea
                                    value={descriptionText}
                                    onChange={(e) => setDescriptionText(e.target.value)}
                                    rows={5}
                                    placeholder="I cannot reset my password via email..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/15"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Priority</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setPriority(item)}
                                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                                                resolvedPriority === item
                                                    ? 'border-[#003971] bg-[#003971] text-white'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateCase}
                                disabled={creating}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#003971] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#002855] disabled:opacity-60"
                            >
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {creating ? 'Submitting...' : 'Submit Support Request'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-[#003971]" />
                                <h3 className="text-sm font-semibold text-gray-900">My Support Cases</h3>
                            </div>
                            <button
                                type="button"
                                onClick={loadCases}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                            </button>
                        </div>

                        {loadingCases ? (
                            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-8 text-sm text-gray-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading your cases...
                            </div>
                        ) : cases.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                No support cases yet. Submit one on the left and the chat will appear here.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cases.map((caseItem) => {
                                    const caseStatus = String(caseItem.status || 'OPEN').toUpperCase();
                                    const casePriority = String(caseItem.priority || 'MEDIUM').toUpperCase();
                                    const caseStatusInfo = statusMeta[caseStatus] || statusMeta.OPEN;
                                    const casePriorityInfo = priorityMeta[casePriority] || priorityMeta.MEDIUM;
                                    return (
                                        <div key={caseItem.id} className="rounded-xl border border-gray-100 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900">{caseItem.subject || 'Support case'}</h4>
                                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${caseStatusInfo.className}`}>
                                                            {caseStatusInfo.label}
                                                        </span>
                                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${casePriorityInfo.className}`}>
                                                            {casePriorityInfo.label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                        {caseItem.description || 'No description'}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openCase(caseItem)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-[#003971] px-3 py-2 text-xs font-semibold text-white hover:bg-[#002855]"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    Open Chat
                                                </button>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDateTime(caseItem.createdAt)}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Info className="h-3.5 w-3.5" />
                                                    {caseItem.category || 'General'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Updated {formatDateTime(caseItem.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedCase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedCase.subject || 'Support case'}</h3>
                                <p className="text-xs text-gray-500">
                                    {selectedCase.caseId || selectedCase.id} · {selectedCase.category || 'General'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCase(null)}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-6">
                            <div className="space-y-4">
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusMeta[status]?.className || statusMeta.OPEN.className}`}>
                                            {statusMeta[status]?.label || status}
                                        </span>
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityMeta[priorityKey]?.className || priorityMeta.MEDIUM.className}`}>
                                            {priorityMeta[priorityKey]?.label || priorityKey}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">
                                        {selectedCase.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-white">
                                    <div className="border-b border-gray-100 px-4 py-3">
                                        <h4 className="text-sm font-semibold text-gray-900">Conversation</h4>
                                        <p className="text-xs text-gray-500">Replies from the support team appear here.</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                                        {selectedCaseLoading ? (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading conversation...
                                            </div>
                                        ) : selectedNotes.length > 0 ? (
                                            selectedNotes.map((note) => (
                                                <div key={note.id} className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {note.author?.name || 'Support'}
                                                        </div>
                                                        <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                                            {note.isInternal ? 'Internal' : 'Public'}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 whitespace-pre-line">{note.content}</p>
                                                    <p className="mt-2 text-[11px] text-gray-500">{formatDate(note.createdAt)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                                No replies yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Send a message</h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    This message will be added to the support thread for the admin team.
                                </p>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={10}
                                    placeholder="Write your update or follow-up here..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#003971] focus:outline-none focus:ring-2 focus:ring-[#003971]/15"
                                />
                                <div className="mt-4 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleReply}
                                        disabled={replying || !replyText.trim() || String(selectedCase.status || '').toUpperCase() === 'CLOSED'}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#003971] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002855] disabled:opacity-60"
                                    >
                                        {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {replying ? 'Sending...' : 'Send Message'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCase(null)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white p-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
                                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                                        Case summary
                                    </div>
                                    <div>Created: {formatDateTime(selectedCase.createdAt)}</div>
                                    <div>Updated: {formatDateTime(selectedCase.updatedAt)}</div>
                                    <div>Priority: {priorityInfo.label}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupportCenterSection;
