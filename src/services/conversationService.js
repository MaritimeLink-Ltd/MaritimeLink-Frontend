import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/** Default page size for GET .../conversations/:id/messages */
export const CONVERSATION_MESSAGE_PAGE_SIZE = 20;

const decodeTokenPayload = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('authToken');
    if (!token || typeof token !== 'string') return null;

    try {
        const [, payload] = token.split('.');
        if (!payload) return null;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const getCurrentUserId = () => {
    if (typeof window === 'undefined') return '';
    const userType = getCurrentUserType();
    const stored =
        userType === 'professional'
            ? localStorage.getItem('professionalId')
            : userType === 'recruiter' || userType === 'training-provider'
              ? localStorage.getItem('recruiterId') || localStorage.getItem('trainingProviderId')
              : userType === 'admin'
                ? localStorage.getItem('adminId')
                : localStorage.getItem('professionalId') ||
                  localStorage.getItem('recruiterId') ||
                  localStorage.getItem('trainingProviderId') ||
                  localStorage.getItem('adminId');
    if (stored) return stored;

    const tokenPayload = decodeTokenPayload();
    return (
        tokenPayload?.id ||
        tokenPayload?.sub ||
        tokenPayload?.userId ||
        tokenPayload?.professionalId ||
        tokenPayload?.recruiterId ||
        ''
    );
};

const getCurrentUserType = () => {
    if (typeof window === 'undefined') return '';
    return String(localStorage.getItem('userType') || localStorage.getItem('adminUserType') || '').toLowerCase();
};

const getAdminDisplayName = (admin) => {
    if (!admin) return '';
    return admin.role ? 'Support Admin' : admin.email || 'Support Admin';
};

/**
 * Map API conversation to list row + profile routing fields.
 * Uses embedded `messages` when present for preview and unread counts.
 * @param {object} conv
 */
export function mapConversationToChatItem(conv) {
    if (!conv?.id) return null;
    const msgs = Array.isArray(conv.messages)
        ? [...conv.messages].sort(
              (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          )
        : [];
    const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
    let lastMessage = 'No messages yet';
    if (lastMsg?.content != null && String(lastMsg.content).trim() !== '') {
        const t = String(lastMsg.content).trim();
        lastMessage = t.length > 120 ? `${t.slice(0, 117)}…` : t;
    }
    const currentUserId = getCurrentUserId();
    const unread =
        typeof conv._count?.messages === 'number'
            ? conv._count.messages
            : msgs.filter((m) => {
                  if (currentUserId) return String(m.senderId || '') !== String(currentUserId) && !m.isRead;
                  const st = String(m.senderType || '').toUpperCase();
                  return st === 'PROFESSIONAL' && !m.isRead;
              }).length;

    const iso = conv.lastMessageAt || lastMsg?.createdAt || conv.updatedAt || conv.createdAt;
    let time = '';
    try {
        if (iso) {
            const d = new Date(iso);
            if (!Number.isNaN(d.getTime())) {
                time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            }
        }
    } catch {
        time = '';
    }
    const currentUserType = getCurrentUserType();
    const professionalName = conv.professional
        ? conv.professional.fullname || conv.professional.email || 'Professional'
        : '';
    const recruiterName = conv.recruiter
        ? conv.recruiter.organizationName || conv.recruiter.email || 'Recruiter'
        : '';
    const adminName = getAdminDisplayName(conv.admin) || 'Support Admin';
    let name = professionalName;

    if (currentUserId) {
        if (conv.professionalId && String(conv.professionalId) !== String(currentUserId)) {
            name = professionalName;
        } else if (conv.recruiterId && String(conv.recruiterId) !== String(currentUserId)) {
            name = recruiterName;
        } else if (conv.adminId && String(conv.adminId) !== String(currentUserId)) {
            name = adminName;
        } else {
            name = professionalName || recruiterName || adminName || 'Conversation';
        }
    } else if (currentUserType === 'admin') {
        name = professionalName || recruiterName || adminName;
    } else {
        name = professionalName || adminName || recruiterName;
    }

    return {
        id: conv.id,
        professionalId: conv.professionalId,
        recruiterId: conv.recruiterId,
        adminId: conv.adminId,
        name,
        lastMessage,
        time,
        unread,
        online: false,
        raw: conv,
    };
}

/**
 * Professional dashboard list row: show recruiter/trainer org as the other party;
 * unread = messages from staff (non-PROFESSIONAL) not yet read by the professional.
 */
export function mapConversationToProfessionalChatItem(conv) {
    if (!conv?.id) return null;
    const msgs = Array.isArray(conv.messages)
        ? [...conv.messages].sort(
              (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          )
        : [];
    const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
    let lastMessage = 'No messages yet';
    if (lastMsg?.content != null && String(lastMsg.content).trim() !== '') {
        const t = String(lastMsg.content).trim();
        lastMessage = t.length > 120 ? `${t.slice(0, 117)}…` : t;
    }
    const currentUserId = getCurrentUserId();
    const unread =
        typeof conv._count?.messages === 'number'
            ? conv._count.messages
            : msgs.filter((m) => {
                  if (currentUserId) return String(m.senderId || '') !== String(currentUserId) && !m.isRead;
                  const st = String(m.senderType || '').toUpperCase();
                  const fromProfessional = st === 'PROFESSIONAL';
                  return !fromProfessional && !m.isRead;
              }).length;

    const iso = conv.lastMessageAt || lastMsg?.createdAt || conv.updatedAt || conv.createdAt;
    let time = '';
    try {
        if (iso) {
            const d = new Date(iso);
            if (!Number.isNaN(d.getTime())) {
                time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            }
        }
    } catch {
        time = '';
    }
    const company =
        (conv.recruiter?.organizationName && String(conv.recruiter.organizationName).trim()) ||
        (conv.recruiter?.email && String(conv.recruiter.email).trim()) ||
        getAdminDisplayName(conv.admin) ||
        'Recruiter';

    return {
        id: conv.id,
        company,
        lastMessage,
        time,
        unread,
        raw: conv,
    };
}

export function formatMessageCaptionTime(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

/**
 * Map API message to bubble state. Staff (recruiter/trainer/admin): left / received for professional;
 * professional's own messages on the right.
 * @param {object} msg
 */
export function mapApiMessageToChatMessage(msg) {
    if (!msg?.id) return null;
    const st = String(msg.senderType || '').toUpperCase();
    const isFromProfessional = st === 'PROFESSIONAL';
    const currentUserId = getCurrentUserId();
    return {
        id: msg.id,
        text: msg.content ?? '',
        sent: currentUserId ? String(msg.senderId || '') === String(currentUserId) : !isFromProfessional,
        seen: msg.isRead === true,
        createdAt: msg.createdAt,
    };
}

class ConversationService {
    /**
     * GET /api/conversations — all conversations for the authenticated user
     * @returns {Promise<object[]>}
     */
    async listConversations() {
        const body = await httpClient.get(API_ENDPOINTS.CONVERSATIONS.LIST);
        return body?.data?.conversations ?? [];
    }

    /**
     * POST /api/conversations  body: { recipientId: string } — professional UUID
     * @returns {Promise<object|null>} conversation object or null
     */
    async createConversation(recipientId) {
        const body = await httpClient.post(API_ENDPOINTS.CONVERSATIONS.CREATE, {
            recipientId,
        });
        const conv = body?.data?.conversation;
        return conv || null;
    }

    /**
     * POST /api/conversations/support/bootstrap
     * Opens or creates the shared support conversation with admin.
     * @returns {Promise<object|null>}
     */
    async openSupportConversation() {
        const body = await httpClient.post(API_ENDPOINTS.CONVERSATIONS.SUPPORT_BOOTSTRAP, {});
        const conv = body?.data?.conversation;
        return conv || null;
    }

    /**
     * GET /api/conversations/:conversationId/messages?limit=&cursor=
     * Cursor-based history (older pages typically use `cursor` = id of oldest loaded message).
     * @param {string} conversationId
     * @param {{ limit?: number, cursor?: string }} query
     * @returns {Promise<{ messages: object[], hasMore: boolean }>}
     */
    async getConversationMessages(conversationId, query = {}) {
        const limit = query.limit ?? CONVERSATION_MESSAGE_PAGE_SIZE;
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        if (query.cursor) params.set('cursor', query.cursor);
        const qs = params.toString();
        const path = `${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}?${qs}`;
        const body = await httpClient.get(path);
        const messages = body?.data?.messages ?? [];
        let hasMore =
            typeof body?.data?.hasMore === 'boolean'
                ? body.data.hasMore
                : typeof body?.data?.has_more === 'boolean'
                  ? body.data.has_more
                  : null;
        if (hasMore == null) {
            hasMore = messages.length >= limit;
        }
        return { messages, hasMore };
    }

    /**
     * POST /api/conversations/:conversationId/messages  body: { content: string }
     * @returns {Promise<object|null>}
     */
    async sendMessage(conversationId, content) {
        const trimmed = typeof content === 'string' ? content.trim() : '';
        if (!conversationId || !trimmed) return null;
        const body = await httpClient.post(
            API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId),
            { content: trimmed }
        );
        return body?.data?.message ?? null;
    }

    /**
     * PATCH /api/conversations/:conversationId/read — mark all messages received by the current user as read.
     */
    async markConversationRead(conversationId) {
        if (!conversationId) return false;
        await httpClient.patch(API_ENDPOINTS.CONVERSATIONS.MARK_READ(conversationId), {});
        return true;
    }
}

export default new ConversationService();
