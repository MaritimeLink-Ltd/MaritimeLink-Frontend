import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api.config';
import { parseJwtPayload } from '../utils/sessionManager';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_CONFIG.BASE_URL;

let socket = null;
let activeToken = null;
let authListenerAttached = false;

function getAuthToken() {
    return localStorage.getItem('authToken') || null;
}

function getAuthPayload(token) {
    const payload = parseJwtPayload(token);
    if (!payload) return null;
    return { id: payload.id, role: payload.role };
}

export function connectSocket() {
    const token = getAuthToken();

    // Already connected with same token.
    if (socket?.connected && token && token === activeToken) return socket;

    // Token changed (or missing): reset.
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        activeToken = null;
    }

    socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        auth: token ? { token } : undefined,
        query: token ? { token } : undefined,
    });
    activeToken = token;

    // Help debug in dev without crashing UI.
    socket.on('connect_error', () => {});
    socket.on('error', () => {});

    // Auto-reconnect after auth changes (attach once).
    if (typeof window !== 'undefined' && !authListenerAttached) {
        authListenerAttached = true;
        const onAuthChange = () => {
            const nextToken = getAuthToken();
            if (nextToken !== activeToken) connectSocket();
        };
        window.addEventListener('authTokenChanged', onAuthChange);
    }

    return socket;
}

export function disconnectSocket() {
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    activeToken = null;
}

/**
 * Subscribe to incoming messages for a conversation.
 * This tries a small set of common event names and join/leave patterns so that
 * only this file needs updating if the backend changes event names.
 */
export function subscribeConversationMessages(conversationId, onMessage) {
    if (!conversationId || typeof onMessage !== 'function') return () => {};
    const s = connectSocket();

    const token = getAuthToken();
    const authPayload = token ? getAuthPayload(token) : null;

    const joinPayload = { conversationId, ...(authPayload || {}) };

    // Join (support multiple backend conventions).
    s.emit('conversation:join', joinPayload);
    s.emit('joinConversation', joinPayload);
    s.emit('join', joinPayload);

    const handler = (payload) => {
        const msg = payload?.message || payload;
        if (!msg) return;
        const cid = msg.conversationId || payload?.conversationId;
        if (cid && String(cid) !== String(conversationId)) return;
        onMessage(msg);
    };

    const eventNames = [
        'conversation:message',
        'conversation:message:new',
        'message:new',
        'newMessage',
        'message',
    ];

    eventNames.forEach((name) => s.on(name, handler));

    // Catch-all: helps when backend event names differ.
    const anyHandler = (_eventName, payload) => {
        const msg = payload?.message || payload;
        if (!msg) return;
        if (!msg.conversationId || !msg.content) return;
        if (String(msg.conversationId) !== String(conversationId)) return;
        onMessage(msg);
    };
    s.onAny(anyHandler);

    return () => {
        eventNames.forEach((name) => s.off(name, handler));
        s.offAny(anyHandler);
        s.emit('conversation:leave', joinPayload);
        s.emit('leaveConversation', joinPayload);
        s.emit('leave', joinPayload);
    };
}

