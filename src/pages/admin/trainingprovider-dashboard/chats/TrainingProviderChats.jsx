import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search,
    Building2,
    Send,
    FileText,
    X,
    AlertTriangle,
    Loader2
} from 'lucide-react';

import conversationService, {
    mapConversationToChatItem,
    mapApiMessageToChatMessage,
    formatMessageCaptionTime,
    CONVERSATION_MESSAGE_PAGE_SIZE,
} from '../../../../services/conversationService';
import { subscribeConversationMessages } from '../../../../services/socketClient';

function TrainingProviderChats({ candidateId: propCandidateId }) {
    const location = useLocation();

    const candidateId = propCandidateId || location.state?.candidateId;

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const messagesEndRef = useRef(null);
    const skipScrollToEndRef = useRef(false);
    const [messagesList, setMessagesList] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [messagesHasMore, setMessagesHasMore] = useState(false);
    const [bootstrapLoading, setBootstrapLoading] = useState(false);
    const [bootstrapError, setBootstrapError] = useState(null);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);

    const upsertChatFromConversation = useCallback((conv) => {
        if (!conv?.id) return;
        setChats((prev) => {
            const idx = prev.findIndex((c) => c.id === conv.id);
            const prevRow = idx >= 0 ? prev[idx] : null;
            let mergedConv = conv;
            if (
                prevRow?.raw &&
                (!Array.isArray(conv.messages) || conv.messages.length === 0) &&
                Array.isArray(prevRow.raw.messages) &&
                prevRow.raw.messages.length > 0
            ) {
                mergedConv = {
                    ...conv,
                    messages: prevRow.raw.messages,
                    lastMessageAt: prevRow.raw.lastMessageAt || conv.lastMessageAt,
                };
            }
            const item = mapConversationToChatItem(mergedConv);
            if (!item) return prev;
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = item;
                return next;
            }
            return [item, ...prev];
        });
        setSelectedChat(conv.id);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setListLoading(true);
            setListError(null);
            try {
                const list = await conversationService.listConversations();
                if (cancelled) return;
                const rows = (list || []).map(mapConversationToChatItem).filter(Boolean);
                rows.sort((a, b) => {
                    const ta = new Date(a.raw?.lastMessageAt || a.raw?.updatedAt || 0).getTime();
                    const tb = new Date(b.raw?.lastMessageAt || b.raw?.updatedAt || 0).getTime();
                    return tb - ta;
                });
                setChats(rows);
            } catch (err) {
                if (!cancelled) {
                    setListError(err?.message || 'Could not load conversations.');
                }
            } finally {
                if (!cancelled) setListLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!candidateId) return undefined;

        let cancelled = false;
        (async () => {
            setBootstrapError(null);
            setBootstrapLoading(true);
            try {
                const conv = await conversationService.createConversation(String(candidateId));
                if (cancelled || !conv) return;
                upsertChatFromConversation(conv);
            } catch (err) {
                if (!cancelled) {
                    setBootstrapError(err?.message || 'Could not start conversation.');
                }
            } finally {
                if (!cancelled) setBootstrapLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [candidateId, upsertChatFromConversation]);

    useEffect(() => {
        if (!selectedChat) return undefined;

        let cancelled = false;
        (async () => {
            try {
                await conversationService.markConversationRead(selectedChat);
                if (cancelled) return;
                setChats((prev) =>
                    prev.map((c) => (c.id === selectedChat ? { ...c, unread: 0 } : c))
                );
            } catch {
                /* non-blocking */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedChat]);

    useEffect(() => {
        if (!selectedChat) return undefined;

        const unsubscribe = subscribeConversationMessages(selectedChat, (rawMsg) => {
            const ui = mapApiMessageToChatMessage(rawMsg);
            if (!ui) return;

            setMessagesList((prev) => {
                const byId = new Map();
                [...prev, ui].forEach((m) => byId.set(m.id, m));
                return [...byId.values()].sort(
                    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );
            });

            setChats((prev) =>
                prev.map((c) => {
                    if (c.id !== selectedChat) return c;
                    const nextMessages = [...(c.raw?.messages || []), rawMsg];
                    const t = String(rawMsg.content || '').trim();
                    const lm = t ? (t.length > 120 ? `${t.slice(0, 117)}…` : t) : c.lastMessage;
                    return {
                        ...c,
                        lastMessage: lm,
                        time: formatMessageCaptionTime(rawMsg.createdAt) || c.time,
                        raw: {
                            ...c.raw,
                            messages: nextMessages,
                            lastMessageAt: rawMsg.createdAt || c.raw?.lastMessageAt,
                        },
                    };
                })
            );

            const senderType = String(rawMsg.senderType || '').toUpperCase();
            if (senderType === 'PROFESSIONAL') {
                void conversationService.markConversationRead(selectedChat);
            }
        });

        return unsubscribe;
    }, [selectedChat]);

    useEffect(() => {
        if (!selectedChat) {
            setMessagesList([]);
            setHistoryError(null);
            setMessagesHasMore(false);
            return undefined;
        }

        let cancelled = false;
        (async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            setMessagesHasMore(false);
            try {
                const { messages, hasMore } = await conversationService.getConversationMessages(
                    selectedChat,
                    { limit: CONVERSATION_MESSAGE_PAGE_SIZE }
                );
                if (cancelled) return;
                const sorted = [...messages].sort(
                    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );
                setMessagesList(
                    sorted.map((m) => mapApiMessageToChatMessage(m)).filter(Boolean)
                );
                setMessagesHasMore(!!hasMore);
            } catch (err) {
                if (!cancelled) {
                    setHistoryError(err?.message || 'Could not load messages.');
                    setMessagesList([]);
                }
            } finally {
                if (!cancelled) setHistoryLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedChat]);

    const handleLoadOlderMessages = useCallback(async () => {
        if (!selectedChat || historyLoadingMore || !messagesHasMore) return;
        const oldest = messagesList[0];
        if (!oldest?.id) return;

        setHistoryLoadingMore(true);
        setHistoryError(null);
        skipScrollToEndRef.current = true;
        try {
            const { messages, hasMore } = await conversationService.getConversationMessages(
                selectedChat,
                { limit: CONVERSATION_MESSAGE_PAGE_SIZE, cursor: oldest.id }
            );
            const sorted = [...messages].sort(
                (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            );
            const incoming = sorted
                .map((m) => mapApiMessageToChatMessage(m))
                .filter(Boolean);
            setMessagesList((prev) => {
                const byId = new Map();
                [...incoming, ...prev].forEach((m) => byId.set(m.id, m));
                return [...byId.values()].sort(
                    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                );
            });
            setMessagesHasMore(!!hasMore);
        } catch (err) {
            setHistoryError(err?.message || 'Could not load older messages.');
        } finally {
            setHistoryLoadingMore(false);
        }
    }, [
        selectedChat,
        historyLoadingMore,
        messagesHasMore,
        messagesList,
    ]);

    const filteredChats = chats.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const reportReasons = [
        { id: 'spam', label: 'Spam or unwanted messages' },
        { id: 'inappropriate', label: 'Inappropriate content' },
        { id: 'harassment', label: 'Harassment or bullying' },
        { id: 'scam', label: 'Scam or fraud' },
        { id: 'fake', label: 'Fake profile' },
        { id: 'other', label: 'Other' }
    ];

    const handleReport = () => {
        if (selectedReason) {
            setShowReportModal(false);
            setSelectedReason('');
        }
    };

    useEffect(() => {
        if (skipScrollToEndRef.current) {
            skipScrollToEndRef.current = false;
            return;
        }
        scrollToBottom();
    }, [messagesList]);

    const handleSendMessage = async () => {
        const text = messageInput.trim();
        if (!text || !selectedChat || sending) return;
        setSendError(null);
        setSending(true);
        try {
            const raw = await conversationService.sendMessage(selectedChat, text);
            if (raw) {
                setMessageInput('');
                const ui = mapApiMessageToChatMessage(raw);
                if (ui) {
                    setMessagesList((prev) => {
                        const byId = new Map();
                        [...prev, ui].forEach((m) => byId.set(m.id, m));
                        return [...byId.values()].sort(
                            (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                        );
                    });
                }
                setChats((prev) =>
                    prev.map((c) => {
                        if (c.id !== selectedChat) return c;
                        const nextMessages = [...(c.raw?.messages || []), raw];
                        const lm = text.length > 120 ? `${text.slice(0, 117)}…` : text;
                        return {
                            ...c,
                            lastMessage: lm,
                            time: formatMessageCaptionTime(raw.createdAt) || c.time,
                            raw: {
                                ...c.raw,
                                messages: nextMessages,
                                lastMessageAt: raw.createdAt || c.raw?.lastMessageAt,
                            },
                        };
                    })
                );
            }
        } catch (err) {
            setSendError(err?.message || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSendMessage();
        }
    };

    const currentChat = chats.find((c) => c.id === selectedChat);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
                <p className="text-gray-500 mt-1 text-sm">Connect with professionals</p>
            </div>

            {(bootstrapError || listError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {bootstrapError || listError}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-220px)]">
                <div className="lg:col-span-1 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col">
                        <div className="relative mb-4 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>

                        <div
                            className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#CBD5E0 transparent'
                            }}
                        >
                            {listLoading && (
                                <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading conversations…
                                </div>
                            )}
                            {!listLoading && bootstrapLoading && candidateId && (
                                <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Opening conversation…
                                </div>
                            )}
                            {!listLoading &&
                                !bootstrapLoading &&
                                filteredChats.length > 0 &&
                                filteredChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        type="button"
                                        onClick={() => setSelectedChat(chat.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-gray-50' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-[#003971] rounded-xl flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            {chat.online && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-bold text-gray-900 text-sm">{chat.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                                    {chat.unread > 0 && (
                                                        <div className="bg-[#003971] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                            {chat.unread}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                                        </div>
                                    </button>
                                ))}
                            {!listLoading &&
                                !bootstrapLoading &&
                                filteredChats.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No conversations yet. Message a trainee from session attendance or their profile.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        {currentChat ? (
                            <>
                                <div className="border-b border-gray-100 p-5 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-[#003971] rounded-xl flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            {currentChat?.online && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{currentChat?.name}</h3>
                                            {currentChat?.online && (
                                                <p className="text-xs text-green-600 flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                    Online
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowReportModal(true)}
                                            className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Report
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="flex-1 overflow-y-auto p-5 space-y-4"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#CBD5E0 transparent',
                                        maxHeight: 'calc(100vh - 400px)',
                                        minHeight: '400px'
                                    }}
                                >
                                    {historyLoading && (
                                        <div className="flex items-center justify-center gap-2 py-12 text-gray-500 text-sm">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            Loading messages…
                                        </div>
                                    )}
                                    {!historyLoading && historyError && (
                                        <p className="text-center text-sm text-red-600 py-2">{historyError}</p>
                                    )}
                                    {!historyLoading && messagesHasMore && (
                                        <div className="flex justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleLoadOlderMessages()}
                                                disabled={historyLoadingMore}
                                                className="text-sm font-semibold text-[#003971] hover:text-[#002855] disabled:opacity-50 inline-flex items-center gap-2"
                                            >
                                                {historyLoadingMore ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Loading…
                                                    </>
                                                ) : (
                                                    'Load older messages'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {!historyLoading &&
                                        messagesList.length === 0 &&
                                        !historyError && (
                                        <p className="text-center text-sm text-gray-400 py-8">
                                            No messages yet.
                                        </p>
                                    )}
                                    {!historyLoading &&
                                        messagesList.map((message) => (
                                        <div key={message.id}>
                                            <div className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                                                <div className="max-w-[70%]">
                                                    <div
                                                        className={`px-4 py-3 rounded-2xl ${message.sent
                                                            ? 'bg-[#003971] text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{message.text}</p>
                                                    </div>
                                                    <p
                                                        className={`text-[11px] text-gray-400 mt-1 ${message.sent ? 'text-right' : 'text-left'}`}
                                                    >
                                                        {formatMessageCaptionTime(message.createdAt)}
                                                    </p>
                                                    {message.seen && message.sent && (
                                                        <p className="text-xs text-gray-500 mt-0.5 text-right">Seen</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {!historyLoading && <div ref={messagesEndRef} />}
                                </div>

                                <div className="border-t border-gray-100 p-5 flex-shrink-0 space-y-2">
                                    {sendError && (
                                        <p className="text-sm text-red-600">{sendError}</p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="Message..."
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={sending}
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] disabled:opacity-60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => void handleSendMessage()}
                                            disabled={sending || !messageInput.trim()}
                                            className="bg-[#003971] text-white p-3 rounded-full hover:bg-[#002855] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {sending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center min-h-[320px] text-gray-500 text-sm px-6 text-center">
                                <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                                <p>Select a conversation from the list, or message a professional from session attendance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h2 className="text-xl font-bold text-gray-900">Report User</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Please select a reason for reporting {currentChat?.name}
                        </p>

                        <div className="space-y-2 mb-6">
                            {reportReasons.map((reason) => (
                                <label
                                    key={reason.id}
                                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedReason === reason.id
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason.id}
                                        checked={selectedReason === reason.id}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-900">{reason.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedReason('');
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReport}
                                disabled={!selectedReason}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${selectedReason
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TrainingProviderChats;
