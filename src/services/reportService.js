import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Member-to-member account reporting, shared by professionals, recruiters and
 * training providers.
 *
 * A report is not a support case: support cases ask us for help, a report flags
 * another account for moderation review. The backend only accepts a report
 * against an account the reporter has already interacted with.
 */

/** Fallback list so the report form renders even if /reasons is unreachable. */
export const REPORT_REASONS = [
    { value: 'SCAM_OR_FRAUD', label: 'Scam or fraud' },
    { value: 'HARASSMENT_OR_ABUSE', label: 'Harassment or abuse' },
    { value: 'FAKE_ACCOUNT', label: 'Fake account or impersonation' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
    { value: 'SPAM', label: 'Spam or unsolicited contact' },
    { value: 'PAYMENT_ISSUE', label: 'Payment issue' },
    { value: 'OTHER', label: 'Other' },
];

export const REPORT_REASON_LABELS = REPORT_REASONS.reduce((acc, reason) => {
    acc[reason.value] = reason.label;
    return acc;
}, {});

export const REPORT_STATUS_LABELS = {
    PENDING: 'Pending review',
    UNDER_REVIEW: 'Under review',
    ACTIONED: 'Actioned',
    DISMISSED: 'Dismissed',
};

class ReportService {
    async getReasons() {
        try {
            const body = await httpClient.get(API_ENDPOINTS.REPORTS.REASONS);
            const reasons = body?.data?.reasons;
            return Array.isArray(reasons) && reasons.length ? reasons : REPORT_REASONS;
        } catch {
            return REPORT_REASONS;
        }
    }

    /**
     * @param {{ reportedId: string, reason: string, details: string, conversationId?: string }} payload
     */
    async createReport(payload) {
        const body = await httpClient.post(API_ENDPOINTS.REPORTS.CREATE, {
            reportedId: payload.reportedId,
            reason: payload.reason,
            details: payload.details,
            ...(payload.conversationId ? { conversationId: payload.conversationId } : {}),
        });
        return body?.data?.report ?? null;
    }

    async getMyReports() {
        const body = await httpClient.get(API_ENDPOINTS.REPORTS.MINE);
        return body?.data?.reports ?? [];
    }
}

export default new ReportService();
