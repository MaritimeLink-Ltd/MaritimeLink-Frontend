import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Admin account moderation.
 *
 * Kept separate from the KYC approve/reject flow: approval decides whether an
 * account may join the platform, moderation decides whether an existing account
 * keeps its access.
 *
 * `accountType` ('professional' | 'recruiter' | 'trainer') is only a lookup hint —
 * the backend resolves the account by id either way.
 */
class AdminModerationService {
    /** Current moderation state, action history, and report count for one account. */
    async getModerationState(id, accountType) {
        const path = accountType
            ? `${API_ENDPOINTS.ADMIN.ACCOUNT_MODERATION(id)}?accountType=${encodeURIComponent(accountType)}`
            : API_ENDPOINTS.ADMIN.ACCOUNT_MODERATION(id);
        const body = await httpClient.get(path);
        return body?.data ?? null;
    }

    /** Every currently suspended or blocked account. */
    async getModeratedAccounts(status = 'ALL') {
        const path = status && status !== 'ALL'
            ? `${API_ENDPOINTS.ADMIN.MODERATED_ACCOUNTS}?status=${encodeURIComponent(status)}`
            : API_ENDPOINTS.ADMIN.MODERATED_ACCOUNTS;
        const body = await httpClient.get(path);
        return body?.data?.accounts ?? [];
    }

    /**
     * Reversible suspension. `suspendedUntil` (ISO string) is optional — when set,
     * the suspension lifts itself on that date.
     */
    async suspendAccount(id, { reason, suspendedUntil, accountType } = {}) {
        const body = await httpClient.post(API_ENDPOINTS.ADMIN.SUSPEND_ACCOUNT(id), {
            reason,
            ...(suspendedUntil ? { suspendedUntil } : {}),
            ...(accountType ? { accountType } : {}),
        });
        return body?.data?.moderation ?? null;
    }

    /** Permanent suspension, for severe cases. */
    async blockAccount(id, { reason, accountType } = {}) {
        const body = await httpClient.post(API_ENDPOINTS.ADMIN.BLOCK_ACCOUNT(id), {
            reason,
            ...(accountType ? { accountType } : {}),
        });
        return body?.data?.moderation ?? null;
    }

    /** Restores the status the account held before it was moderated. */
    async reinstateAccount(id, { note, accountType } = {}) {
        const body = await httpClient.post(API_ENDPOINTS.ADMIN.REINSTATE_ACCOUNT(id), {
            ...(note ? { note } : {}),
            ...(accountType ? { accountType } : {}),
        });
        return body?.data?.moderation ?? null;
    }

    // --- Report queue ---

    async getReports(query = {}) {
        const params = new URLSearchParams();
        if (query.status && query.status !== 'All') params.set('status', query.status);
        if (query.reason && query.reason !== 'All') params.set('reason', query.reason);
        if (query.reportedId) params.set('reportedId', query.reportedId);
        if (query.page) params.set('page', query.page);
        if (query.limit) params.set('limit', query.limit);

        const qs = params.toString();
        const path = qs ? `${API_ENDPOINTS.ADMIN.REPORTS}?${qs}` : API_ENDPOINTS.ADMIN.REPORTS;
        const body = await httpClient.get(path);
        return {
            reports: body?.data?.reports ?? [],
            pagination: body?.pagination ?? null,
        };
    }

    async getReportStats() {
        const body = await httpClient.get(API_ENDPOINTS.ADMIN.REPORTS_STATS);
        return body?.data ?? null;
    }

    /** Accepts a report UUID or its reference (e.g. RPT-1001). */
    async getReportById(id) {
        const body = await httpClient.get(API_ENDPOINTS.ADMIN.REPORT_DETAIL(id));
        return body?.data ?? null;
    }

    /** Records the review outcome. Closing a report requires a resolution note. */
    async updateReport(id, payload) {
        const body = await httpClient.patch(API_ENDPOINTS.ADMIN.REPORT_DETAIL(id), payload);
        return body?.data?.report ?? null;
    }

    /**
     * Adds an internal admin note without changing the report's status.
     * The note is attributed to the signed-in admin.
     */
    async addReportNote(id, content) {
        const body = await httpClient.post(API_ENDPOINTS.ADMIN.REPORT_NOTES(id), { content });
        return body?.data?.note ?? null;
    }
}

export default new AdminModerationService();
