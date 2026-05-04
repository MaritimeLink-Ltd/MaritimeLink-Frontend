/**
 * Professional dashboard API — overview metrics (compliance, certs, matches, etc.)
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';
import { DASHBOARD_LIST_PAGE_SIZE } from '../constants/dashboardPagination';

function alertsActivityQuery({ limit = DASHBOARD_LIST_PAGE_SIZE, offset = 0 } = {}) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    return params.toString();
}

class ProfessionalDashboardService {
    /**
     * GET /api/professional/dashboard/overview
     * @returns {Promise<{ status?: string, data?: { overview?: object } }>}
     */
    async getOverview() {
        const response = await httpClient.get(API_ENDPOINTS.PROFESSIONAL.DASHBOARD_OVERVIEW);
        return response;
    }

    /**
     * GET /api/professional/dashboard/alerts
     * @returns {Promise<{ status?: string, results?: number, data?: { alerts?: object[] } }>}
     */
    async getAlerts(pagination = {}) {
        const qs = alertsActivityQuery({
            limit: pagination.limit,
            offset: pagination.offset,
        });
        const url = qs
            ? `${API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ALERTS}?${qs}`
            : API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ALERTS;
        const response = await httpClient.get(url);
        return response;
    }

    /**
     * GET /api/professional/dashboard/activity
     * @param {{ limit?: number, offset?: number }} [pagination]
     * @returns {Promise<{ status?: string, results?: number, data?: { activity?: object[] } }>}
     */
    async getActivity(pagination = {}) {
        const qs = alertsActivityQuery({
            limit: pagination.limit,
            offset: pagination.offset,
        });
        const url = qs
            ? `${API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ACTIVITY}?${qs}`
            : API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ACTIVITY;
        const response = await httpClient.get(url);
        return response;
    }

    /**
     * PATCH /api/professional/dashboard/alerts/:id/read
     * @param {string} alertId
     * @returns {Promise<{ status?: string, message?: string }>}
     */
    async markAlertRead(alertId) {
        const response = await httpClient.patch(
            API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ALERT_READ(alertId),
            {}
        );
        return response;
    }
}

export default new ProfessionalDashboardService();
