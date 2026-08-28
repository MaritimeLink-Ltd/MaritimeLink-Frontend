import { useState, useEffect, useMemo } from 'react';
import { Search, Megaphone, Loader2, CheckCircle } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function normalizeUserRole(role) {
    if (!role) return '';
    return String(role).toUpperCase().replace(/-/g, '_');
}

/** Supports `{ data: { list } }`, nested `data.data`, or a raw array fallback — same shape admin list endpoints already return. */
function extractAdminUserList(apiBody, listKey) {
    if (!apiBody) return [];
    if (apiBody?.data?.[listKey] && Array.isArray(apiBody.data[listKey])) return apiBody.data[listKey];
    if (apiBody?.data?.data?.[listKey] && Array.isArray(apiBody.data.data[listKey])) return apiBody.data.data[listKey];
    if (apiBody?.[listKey] && Array.isArray(apiBody[listKey])) return apiBody[listKey];
    if (Array.isArray(apiBody.data)) return apiBody.data;
    if (Array.isArray(apiBody)) return apiBody;
    return [];
}

/** 'Verified' | 'Pending' | 'Other' — the two states the client asked to target, collapsing everything else (flagged/blocked/rejected) out of the way. */
function toVerificationState(rawStatus) {
    const s = String(rawStatus || '').toUpperCase();
    if (s === 'VERIFIED' || s === 'APPROVED') return 'Verified';
    if (s === 'PENDING') return 'Pending';
    return 'Other';
}

const TABS = ['Professionals', 'Recruiters', 'Training Providers'];

function Announcements() {
    const [activeTab, setActiveTab] = useState('Professionals');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All | Verified | Pending

    const [professionals, setProfessionals] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // professionalIds and recruiterIds (recruiters + training providers share one
    // backend list, same as the request payload) — selection persists across tabs
    // so one send can mix professionals with recruiters/trainers.
    const [selectedProfessionalIds, setSelectedProfessionalIds] = useState(new Set());
    const [selectedRecruiterIds, setSelectedRecruiterIds] = useState(new Set());

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            setLoadError('');
            try {
                const [proRes, recRes, trainRes] = await Promise.allSettled([
                    httpClient.get(`${API_ENDPOINTS.ADMIN.PROFESSIONALS}?${new URLSearchParams({ limit: '2000' })}`),
                    httpClient.get(`${API_ENDPOINTS.ADMIN.RECRUITERS}?${new URLSearchParams({ limit: '2000' })}`),
                    httpClient.get(`${API_ENDPOINTS.ADMIN.TRAINERS}?${new URLSearchParams({ limit: '2000' })}`),
                ]);

                if (proRes.status === 'fulfilled') {
                    const list = extractAdminUserList(proRes.value, 'professionals');
                    setProfessionals(list.map((item) => ({
                        id: item.id,
                        name: item.fullname || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown',
                        email: item.email || 'N/A',
                        verification: toVerificationState(item.status),
                    })));
                }

                if (recRes.status === 'fulfilled') {
                    const list = extractAdminUserList(recRes.value, 'recruiters')
                        .filter((item) => normalizeUserRole(item.role) !== 'TRAINING_AGENT');
                    setRecruiters(list.map((item) => ({
                        id: item.id,
                        name: item.organizationName || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown',
                        email: item.email || 'N/A',
                        verification: toVerificationState(item.status),
                    })));
                }

                if (trainRes.status === 'fulfilled') {
                    const list = extractAdminUserList(trainRes.value, 'trainers')
                        .filter((item) => normalizeUserRole(item.role) !== 'RECRUITMENT_AGENT');
                    setTrainers(list.map((item) => ({
                        id: item.id,
                        name: item.organizationName || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unknown',
                        email: item.email || 'N/A',
                        verification: toVerificationState(item.status),
                    })));
                }

                if ([proRes, recRes, trainRes].every((r) => r.status === 'rejected')) {
                    setLoadError('Failed to load recipients. Please refresh and try again.');
                }
            } catch (error) {
                console.error('Failed to load announcement recipients:', error);
                setLoadError(error.message || 'Failed to load recipients.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const listForTab = activeTab === 'Professionals' ? professionals : activeTab === 'Recruiters' ? recruiters : trainers;
    const selectedIdsForTab = activeTab === 'Professionals' ? selectedProfessionalIds : selectedRecruiterIds;
    const setSelectedIdsForTab = activeTab === 'Professionals' ? setSelectedProfessionalIds : setSelectedRecruiterIds;

    const visibleList = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return listForTab.filter((item) => {
            if (statusFilter !== 'All' && item.verification !== statusFilter) return false;
            if (q && !item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [listForTab, searchQuery, statusFilter]);

    const allVisibleSelected = visibleList.length > 0 && visibleList.every((item) => selectedIdsForTab.has(item.id));

    const toggleOne = (id) => {
        setSelectedIdsForTab((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllVisible = () => {
        setSelectedIdsForTab((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) visibleList.forEach((item) => next.delete(item.id));
            else visibleList.forEach((item) => next.add(item.id));
            return next;
        });
    };

    const selectEveryone = () => {
        setSelectedProfessionalIds(new Set(professionals.map((p) => p.id)));
        setSelectedRecruiterIds(new Set([...recruiters, ...trainers].map((r) => r.id)));
    };

    const clearSelection = () => {
        setSelectedProfessionalIds(new Set());
        setSelectedRecruiterIds(new Set());
    };

    const recruiterSelectedCount = useMemo(
        () => recruiters.filter((r) => selectedRecruiterIds.has(r.id)).length,
        [recruiters, selectedRecruiterIds],
    );
    const trainerSelectedCount = useMemo(
        () => trainers.filter((t) => selectedRecruiterIds.has(t.id)).length,
        [trainers, selectedRecruiterIds],
    );
    const totalSelected = selectedProfessionalIds.size + selectedRecruiterIds.size;

    const canSend = totalSelected > 0 && subject.trim().length >= 3 && message.trim().length >= 3;

    const openConfirm = () => {
        if (!canSend) return;
        setSendError('');
        setShowConfirmModal(true);
    };

    const submitSend = async () => {
        setIsSending(true);
        setSendError('');
        try {
            const response = await httpClient.post(API_ENDPOINTS.ADMIN.SEND_ANNOUNCEMENT, {
                subject: subject.trim(),
                message: message.trim(),
                professionalIds: [...selectedProfessionalIds],
                recruiterIds: [...selectedRecruiterIds],
            });
            const total = response?.data?.totalRecipients ?? totalSelected;
            setShowConfirmModal(false);
            setSubject('');
            setMessage('');
            clearSelection();
            setSuccessMessage(`Announcement is being sent to ${total} recipient${total === 1 ? '' : 's'}.`);
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (error) {
            setSendError(error.message || 'Failed to send announcement. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 relative">
            {successMessage && (
                <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2">Announcements</h1>
                <p className="text-sm text-gray-500">
                    Send a bulk email (and in-app notification for professionals) to any mix of professionals,
                    recruiters and training providers — verified or pending. Separate from, and does not affect,
                    the profile-completion reminders sent to pending professionals.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Recipient picker */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <div className="px-4 pt-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex gap-6">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative pb-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-[#1e5a8f]' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={selectEveryone}
                            className="mb-2 text-sm font-semibold text-[#1e5a8f] hover:underline"
                        >
                            Select all platform users
                        </button>
                    </div>

                    {/* Search + status filter */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {['All', 'Verified', 'Pending'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setStatusFilter(option)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${statusFilter === option
                                        ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-auto max-h-[520px]">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={toggleAllVisible}
                                            disabled={visibleList.length === 0}
                                            title="Select all in this view"
                                            className="h-4 w-4 rounded border-gray-300 text-[#1e5a8f] focus:ring-[#1e5a8f]/30 disabled:opacity-30"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading recipients...</td>
                                    </tr>
                                ) : loadError ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-red-500">{loadError}</td>
                                    </tr>
                                ) : visibleList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No {activeTab.toLowerCase()} match your filters.</td>
                                    </tr>
                                ) : (
                                    visibleList.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIdsForTab.has(item.id)}
                                                    onChange={() => toggleOne(item.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#1e5a8f] focus:ring-[#1e5a8f]/30"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.verification === 'Verified'
                                                    ? 'text-green-700 bg-green-50'
                                                    : item.verification === 'Pending'
                                                        ? 'text-orange-700 bg-orange-50'
                                                        : 'text-gray-600 bg-gray-100'
                                                    }`}>
                                                    {item.verification}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Compose panel */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                                <Megaphone className="h-4 w-4 text-[#1e5a8f]" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Compose</h2>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
                            <div className="flex justify-between font-semibold text-gray-900">
                                <span>Selected recipients</span>
                                <span>{totalSelected}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Professionals</span>
                                <span>{selectedProfessionalIds.size}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Recruiters</span>
                                <span>{recruiterSelectedCount}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Training Providers</span>
                                <span>{trainerSelectedCount}</span>
                            </div>
                            {totalSelected > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="text-xs font-medium text-gray-500 hover:underline mt-1"
                                >
                                    Clear selection
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Happy New Year from MaritimeLink!"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    maxLength={200}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your announcement..."
                                    rows={7}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    maxLength={5000}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openConfirm}
                            disabled={!canSend}
                            className="w-full px-4 py-3 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164569] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Send Announcement
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Megaphone className="h-6 w-6 text-[#1e5a8f]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Send Announcement</h3>
                                <p className="text-sm text-gray-500">
                                    To {totalSelected} recipient{totalSelected === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                        <div className="mb-6 space-y-2">
                            <p className="text-sm font-semibold text-gray-800">{subject}</p>
                            <p className="text-sm text-gray-600 whitespace-pre-line max-h-40 overflow-y-auto">{message}</p>
                        </div>
                        {sendError && <p className="text-sm text-red-600 mb-4">{sendError}</p>}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSending}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitSend}
                                disabled={isSending}
                                className="flex-1 px-4 py-3 bg-[#1e5a8f] text-white rounded-lg font-semibold hover:bg-[#164569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Announcements;
