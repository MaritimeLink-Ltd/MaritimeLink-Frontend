import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    User,
    Clock,
    RefreshCw,
    Paperclip,
    AlertTriangle,
    Send,
    CheckCircle,
    X,
    Shield,
    MessageSquare,
    FileText,
    Loader2,
} from 'lucide-react';
import adminOperationsService from '../../../services/adminOperationsService';
import { parseJwtPayload } from '../../../utils/sessionManager';

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

const formatRelativeTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const diff = Date.now() - date.getTime();
    const minutes = Math.max(0, Math.floor(diff / (60 * 1000)));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const getInitials = (name) => {
    if (!name) return 'SC';
    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'SC';
};

const getCurrentAdminId = () => {
    if (typeof window === 'undefined') return null;
    const payload = parseJwtPayload(localStorage.getItem('authToken'));
    if (!payload || typeof payload !== 'object') return null;
    return payload.adminId || payload.admin_id || payload.id || payload.userId || payload.sub || null;
};

function SupportCaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Reply to User');
    const [replyText, setReplyText] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const conversationEndRef = useRef(null);
    const replyTabs = ['Reply to User', 'Internal Note'];

    const currentAdminId = useMemo(() => getCurrentAdminId(), []);

    const loadCase = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await adminOperationsService.getSupportCaseById(id);
            setCaseData(response?.data?.case || null);
        } catch (err) {
            console.error('Failed to load support case:', err);
            setError(err?.message || 'Failed to load support case');
            setCaseData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCase();
    }, [id]);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [caseData?.notes?.length]);

    const openModal = (type) => {
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const caseStatus = String(caseData?.status || 'OPEN').toUpperCase();
    const assignedToId = caseData?.assignedTo?.id || caseData?.assignedToId || null;
    const isAssignedToMe = Boolean(currentAdminId && assignedToId && String(assignedToId) === String(currentAdminId));
    const user = caseData?.user || null;
    const notes = Array.isArray(caseData?.notes) ? caseData.notes : [];
    const publicReplies = notes.filter((note) => !note.isInternal);
    const internalNotes = notes.filter((note) => note.isInternal);

    const confirmAction = async () => {
        if (!activeModal || saving) return;

        setSaving(true);
        setError('');
        setFeedback('');

        try {
            if (activeModal === 'assign') {
                if (!currentAdminId) {
                    throw new Error('Unable to determine the current admin session.');
                }

                await adminOperationsService.updateSupportCase(id, {
                    assignedToId: currentAdminId,
                    status: caseStatus === 'OPEN' ? 'IN_PROGRESS' : caseStatus,
                });
                setFeedback('Case assigned successfully.');
            } else if (activeModal === 'resolve') {
                await adminOperationsService.updateSupportCase(id, {
                    status: 'RESOLVED',
                });
                setFeedback('Case marked as resolved.');
            } else if (activeModal === 'close') {
                await adminOperationsService.updateSupportCase(id, {
                    status: 'CLOSED',
                });
                setFeedback('Case closed successfully.');
            }

            await loadCase();
            closeModal();
        } catch (err) {
            console.error('Failed to update support case:', err);
            setError(err?.message || 'Failed to update support case');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        const message = replyText.trim();
        if (!message || saving) return;

        setSaving(true);
        setError('');
        setFeedback('');

        try {
            await adminOperationsService.addSupportCaseNote(id, {
                content: message,
                isInternal: activeTab === 'Internal Note',
            });
            setReplyText('');
            setFeedback(activeTab === 'Internal Note' ? 'Internal note added.' : 'Reply recorded.');
            await loadCase();
        } catch (err) {
            console.error('Failed to add note:', err);
            setError(err?.message || 'Failed to add note');
        } finally {
            setSaving(false);
        }
    };

    const caseStatusLabel = useMemo(() => {
        const map = {
            OPEN: 'Open',
            IN_PROGRESS: 'In Progress',
            WAITING: 'Waiting',
            RESOLVED: 'Resolved',
            CLOSED: 'Closed',
        };
        return map[caseStatus] || caseStatus;
    }, [caseStatus]);

    const priority = String(caseData?.priority || 'MEDIUM').toUpperCase();
    const priorityLabelClass = {
        HIGH: 'text-red-600',
        MEDIUM: 'text-orange-600',
        LOW: 'text-gray-600',
    }[priority] || 'text-gray-600';

    const statusBadgeClass = {
        OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
        IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        WAITING: 'bg-orange-50 text-orange-700 border-orange-100',
        RESOLVED: 'bg-green-50 text-green-700 border-green-100',
        CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
    }[caseStatus] || 'bg-gray-100 text-gray-700 border-gray-200';

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Loading support case...</span>
                </div>
            </div>
        );
    }

    if (error && !caseData) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Support case not available</h1>
                <p className="text-sm text-gray-600 mb-6 max-w-md">{error}</p>
                <button
                    onClick={() => void loadCase()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#003971] px-4 py-2 text-sm font-semibold text-white"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex-shrink-0 mb-4 pt-2 px-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back to Cases</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-2" />
                        <div className="min-w-0">
                            <span className="text-xl font-bold text-gray-900 block truncate">
                                {caseData?.caseId || caseData?.id || `#${id}`}
                            </span>
                            <span className="text-sm text-gray-600 block truncate">
                                {caseData?.subject || 'Support case details'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => !isAssignedToMe && openModal('assign')}
                            disabled={saving || isAssignedToMe}
                            className={`px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors shadow-sm ${isAssignedToMe
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                                }`}
                        >
                            {isAssignedToMe ? 'Assigned to Me' : 'Assign to Me'}
                        </button>
                        <button
                            onClick={() => !saving && openModal('resolve')}
                            disabled={saving || caseStatus === 'RESOLVED'}
                            className={`flex items-center gap-2 px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${caseStatus === 'RESOLVED'
                                ? 'bg-green-50 text-green-400 border-green-100 cursor-not-allowed'
                                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Resolve
                        </button>
                        <button
                            onClick={() => !saving && openModal('close')}
                            disabled={saving || caseStatus === 'CLOSED'}
                            className={`flex items-center gap-2 px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${caseStatus === 'CLOSED'
                                ? 'bg-orange-50 text-orange-400 border-orange-100 cursor-not-allowed'
                                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                }`}
                        >
                            <span className={`font-bold text-lg leading-none ${caseStatus === 'CLOSED' ? 'text-orange-400' : 'text-orange-600'}`}>
                                &times;
                            </span>
                            Close Case
                        </button>
                    </div>
                </div>

                {feedback && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {feedback}
                    </div>
                )}
                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pb-4 px-6 min-h-0">
                <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-gray-500">
                                        {getInitials(user?.name || caseData?.userLabel || caseData?.userId)}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-0.5">{user?.name || caseData?.userLabel || 'Unknown user'}</h3>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase rounded-md">
                                {user?.role || caseData?.userType || 'User'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs text-gray-600 pl-1">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                <span>{user?.email || 'No email available'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 pl-1">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{caseData?.userPhone || 'No phone available'}</span>
                            </div>
                            {user?.id && (
                                <Link
                                    to={`/admin/accounts/${user.id}`}
                                    className="flex items-center gap-3 text-xs text-blue-600 hover:underline cursor-pointer pl-1 font-medium bg-transparent border-0 p-0"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    <span>View Profile</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">CASE DETAILS</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium mb-1">Subject</p>
                                <p className="text-xs font-bold text-gray-900 leading-snug">{caseData?.subject || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium mb-1">Description</p>
                                <p className="text-xs text-gray-700 leading-5 whitespace-pre-line">
                                    {caseData?.description || '—'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Priority</p>
                                    <p className={`text-xs font-bold ${priorityLabelClass}`}>{priority}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Category</p>
                                    <p className="text-xs font-semibold text-gray-900">{caseData?.category || '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Created</p>
                                    <p className="text-xs text-gray-700">{formatDateTime(caseData?.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Updated</p>
                                    <p className="text-xs text-gray-700">{formatDateTime(caseData?.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">STATUS</h4>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-500">Current status</span>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                                {caseStatusLabel}
                            </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-500">Assigned to</span>
                            <span className="text-xs font-semibold text-gray-900">
                                {caseData?.assignedTo?.name || caseData?.assignedTo?.email || 'Unassigned'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-blue-50 text-[#003971]">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{caseData?.subject || 'Support case'}</h2>
                                        <p className="text-sm text-gray-600">
                                            {caseData?.caseId || caseData?.id} · {caseStatusLabel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                                {caseStatusLabel}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Case Activity</h4>
                                    <p className="text-xs text-gray-500">Public replies and internal notes</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{notes.length} entries</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {notes.length > 0 ? (
                                    notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className={`rounded-xl border p-4 ${note.isInternal ? 'border-amber-200 bg-amber-50/60' : 'border-blue-100 bg-blue-50/60'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {getInitials(note.author?.name || 'Admin')}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {note.author?.name || 'Admin'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {note.author?.email || 'System'} · {formatRelativeTime(note.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${note.isInternal ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {note.isInternal ? 'Internal Note' : 'Public Reply'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-line leading-6">
                                                {note.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full min-h-[200px] flex items-center justify-center text-sm text-gray-500">
                                        No notes yet.
                                    </div>
                                )}
                                <div ref={conversationEndRef} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                            <div className="p-5 border-b border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900">Reply / Note</h4>
                                <p className="text-xs text-gray-500">Choose whether this is public or internal.</p>
                            </div>

                            <div className="p-5 flex flex-col gap-4 min-h-0">
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    {replyTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab
                                                ? 'bg-white shadow-sm text-[#003971]'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={10}
                                    placeholder={
                                        activeTab === 'Reply to User'
                                            ? 'Write a reply that will be recorded against the case...'
                                            : 'Add an internal note for other admins...'
                                    }
                                    className="w-full flex-1 min-h-[220px] resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                />

                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={handleSend}
                                        disabled={saving || !replyText.trim()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#003971] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {activeTab === 'Reply to User' ? 'Record Reply' : 'Save Note'}
                                    </button>
                                    <button
                                        onClick={() => setReplyText('')}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear
                                    </button>
                                </div>

                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-2">
                                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                                        <FileText className="h-4 w-4" />
                                        Case summary
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>Created {formatRelativeTime(caseData?.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-gray-400" />
                                        <span>Updated {formatRelativeTime(caseData?.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-gray-400" />
                                        <span>{publicReplies.length} public replies · {internalNotes.length} internal notes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {activeModal === 'assign'
                                ? 'Assign this case to yourself?'
                                : activeModal === 'resolve'
                                    ? 'Mark this case as resolved?'
                                    : 'Close this case?'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {activeModal === 'assign'
                                ? 'This will assign the case to your admin account and move it into active handling.'
                                : activeModal === 'resolve'
                                    ? 'This will mark the support case as resolved.'
                                    : 'This will close the case and archive it from active support work.'}
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void confirmAction()}
                                disabled={saving}
                                className="rounded-lg bg-[#003971] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupportCaseDetails;
