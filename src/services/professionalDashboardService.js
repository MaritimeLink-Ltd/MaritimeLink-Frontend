/**
 * Professional dashboard API — overview metrics (compliance, certs, matches, etc.)
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

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
    async getAlerts() {
        const response = await httpClient.get(API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ALERTS);
        return response;
    }

    /**
     * GET /api/professional/dashboard/activity
     * @returns {Promise<{ status?: string, results?: number, data?: { activity?: object[] } }>}
     */
    async getActivity() {
        const response = await httpClient.get(API_ENDPOINTS.PROFESSIONAL.DASHBOARD_ACTIVITY);
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
