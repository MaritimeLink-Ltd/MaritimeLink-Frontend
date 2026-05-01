import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Building2, ArrowUp, ArrowLeft, Loader2 } from 'lucide-react';

import conversationService, {
    mapApiMessageToChatMessage,
    mapConversationToProfessionalChatItem,
    formatMessageCaptionTime,
    CONVERSATION_MESSAGE_PAGE_SIZE,
} from '../../../../services/conversationService';
import { subscribeConversationMessages } from '../../../../services/socketClient';

const Chats = ({ onViewJob }) => {
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const skipScrollToEndRef = useRef(false);

    const [messagesList, setMessagesList] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [messagesHasMore, setMessagesHasMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setListLoading(true);
            setListError(null);
            try {
                const list = await conversationService.listConversations();
                if (cancelled) return;
                const rows = (list || [])
                    .map(mapConversationToProfessionalChatItem)
                    .filter(Boolean);
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
        if (!selectedChatId) {
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
                    selectedChatId,
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
    }, [selectedChatId]);

    useEffect(() => {
        if (!selectedChatId) return undefined;

        let cancelled = false;
        (async () => {
            try {
                await conversationService.markConversationRead(selectedChatId);
                if (cancelled) return;
                setChats((prev) =>
                    prev.map((c) => (c.id === selectedChatId ? { ...c, unread: 0 } : c))
                );
            } catch {
                /* non-blocking */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedChatId]);

    useEffect(() => {
        if (!selectedChatId) return undefined;

        const unsubscribe = subscribeConversationMessages(selectedChatId, (rawMsg) => {
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
                    if (c.id !== selectedChatId) return c;
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

            // For professionals: staff messages are "incoming", so mark read when focused.
            const senderType = String(rawMsg.senderType || '').toUpperCase();
            if (senderType !== 'PROFESSIONAL') {
                void conversationService.markConversationRead(selectedChatId);
            }
        });

        return unsubscribe;
    }, [selectedChatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    useEffect(() => {
        if (skipScrollToEndRef.current) {
            skipScrollToEndRef.current = false;
            return;
        }
        scrollToBottom();
    }, [messagesList]);

    useEffect(() => {
        if (selectedChatId && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [selectedChatId]);

    const handleLoadOlderMessages = useCallback(async () => {
        if (!selectedChatId || historyLoadingMore || !messagesHasMore) return;
        const oldest = messagesList[0];
        if (!oldest?.id) return;

        setHistoryLoadingMore(true);
        setHistoryError(null);
        skipScrollToEndRef.current = true;
        try {
            const { messages, hasMore } = await conversationService.getConversationMessages(
                selectedChatId,
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
    }, [selectedChatId, historyLoadingMore, messagesHasMore, messagesList]);

    const handleSendMessage = async () => {
        const text = messageInput.trim();
        if (!text || !selectedChatId || sending) return;
        setSendError(null);
        setSending(true);
        try {
            const raw = await conversationService.sendMessage(selectedChatId, text);
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
                        if (c.id !== selectedChatId) return c;
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

    const selectedRow = chats.find((c) => c.id === selectedChatId);

    if (!listLoading && chats.length === 0 && !listError) {
        return (
            <div className="w-full max-w-7xl mx-auto px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-800">Chats</h1>
                    <p className="text-gray-500 mt-1 text-lg">Connect with recruiters</p>
                </div>
                <div className="flex flex-col items-center justify-center mt-32">
                    <div className="mb-6">
                        <MessageCircle
                            size={80}
                            strokeWidth={1.5}
                            className="text-gray-300"
                        />
                    </div>
                    <p className="text-gray-400 text-lg">No messages yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Chats</h1>
                <p className="text-gray-500 mt-1 text-base sm:text-lg">Connect with recruiters</p>
                {listError && (
                    <p className="text-sm text-red-600 mt-2">{listError}</p>
                )}
            </div>

            <div className="flex-1 flex lg:overflow-hidden">
                <div
                    className={`${selectedChatId && 'hidden lg:block'} w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto`}
                >
                    {listLoading && (
                        <div className="flex items-center justify-center gap-2 py-12 text-gray-500 text-sm">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading conversations…
                        </div>
                    )}
                    {!listLoading &&
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    setSelectedChatId(chat.id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedChatId(chat.id);
                                    }
                                }}
                                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedChatId === chat.id ? 'bg-[#003971]/5' : ''
                                    }`}
                            >
                                <div className="shrink-0">
                                    <div className="w-12 h-12 bg-[#003971] rounded-lg flex items-center justify-center">
                                        <Building2 size={24} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                                            {chat.company}
                                        </h3>
                                        <span className="text-xs text-gray-400 ml-2">{chat.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                                </div>

                                {chat.unread > 0 && (
                                    <div className="shrink-0">
                                        <div className="w-6 h-6 bg-[#003971] rounded-full flex items-center justify-center">
                                            <span className="text-xs text-white font-semibold">{chat.unread}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>

                <div
                    className={`${!selectedChatId && 'hidden lg:flex'} flex-1 flex flex-col bg-white`}
                >
                    {selectedChatId && selectedRow ? (
                        <>
                            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedChatId(null);
                                        }}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <ArrowLeft size={20} className="text-gray-700" />
                                    </button>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#003971] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 size={18} className="text-white sm:w-5 sm:h-5" />
                                    </div>
                                    <h2 className="text-base sm:text-xl font-semibold text-gray-800 truncate">
                                        {selectedRow.company}
                                    </h2>
                                </div>
                                {selectedRow.raw?.job && onViewJob && (
                                    <button
                                        type="button"
                                        onClick={() => onViewJob(selectedRow.raw.job)}
                                        className="hidden sm:flex items-center px-5 py-2 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                                    >
                                        View Job Description
                                    </button>
                                )}
                            </div>

                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-gray-50"
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
                                    <div className="flex justify-center pb-4">
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
                                    <p className="text-center text-sm text-gray-400 py-12">No messages yet.</p>
                                )}
                                {!historyLoading &&
                                    messagesList.map((message) => (
                                        <div key={message.id} className="mb-4">
                                            <div
                                                className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-md px-4 py-2.5 rounded-2xl ${message.sent
                                                        ? 'bg-[#003971] text-white rounded-br-sm'
                                                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`mt-0.5 ${message.sent ? 'text-right' : 'text-left'}`}
                                            >
                                                <span className="text-[11px] text-gray-400">
                                                    {formatMessageCaptionTime(message.createdAt)}
                                                </span>
                                            </div>
                                            {message.seen && message.sent && (
                                                <div className="flex justify-end mt-0.5">
                                                    <span className="text-xs text-gray-400">Seen</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                {!historyLoading && <div ref={messagesEndRef} />}
                            </div>

                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white space-y-2">
                                {sendError && (
                                    <p className="text-sm text-red-600">{sendError}</p>
                                )}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') void handleSendMessage();
                                        }}
                                        placeholder="Message..."
                                        disabled={sending}
                                        className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971] disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handleSendMessage()}
                                        disabled={sending || !messageInput.trim()}
                                        className="w-12 h-12 bg-[#003971] rounded-full flex items-center justify-center hover:bg-[#003971]/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {sending ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <ArrowUp size={20} className="text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                                <p className="text-gray-400 text-lg">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;
