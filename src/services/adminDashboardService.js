/**
 * Admin dashboard — aggregated stats for overview cards.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class AdminDashboardService {
    /**
     * GET /api/admin/dashboard/stats
     * @returns {Promise<{ data?: { stats?: object } }>}
     */
    async getDashboardStats() {
        return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    }

    /**
     * GET /api/admin/dashboard/activity
     * @returns {Promise<{ data?: { activity?: object, userBreakdown?: object } }>}
     */
    async getDashboardActivity() {
        return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY);
    }

    async getPlatformActivityReport(range = '7d') {
        const params = new URLSearchParams();
        if (range) params.set('range', range);
        const qs = params.toString();
        const path = qs
            ? `${API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY_REPORT}?${qs}`
            : API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY_REPORT;
        return httpClient.get(path);
    }

    /**
     * GET /api/admin/dashboard/revenue
     * @returns {Promise<{ data?: { overview?: object, breakdown?: object, training?: object } }>}
     */
    async getDashboardRevenue() {
        return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_REVENUE);
    }

    /**
     * GET /api/admin/dashboard/queues
     * @returns {Promise<{ data?: { reviewQueue?: object[], systemAlerts?: object[] } }>}
     */
    async getDashboardQueues() {
        return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_QUEUES);
    }

    async getTransactions(query = {}) {
        const params = new URLSearchParams();
        if (query.page) params.set('page', query.page);
        if (query.limit) params.set('limit', query.limit);
        if (query.search) params.set('search', query.search);
        if (query.status && query.status !== 'All') params.set('status', query.status);
        const qs = params.toString();
        const path = qs
            ? `${API_ENDPOINTS.ADMIN.DASHBOARD_TRANSACTIONS}?${qs}`
            : API_ENDPOINTS.ADMIN.DASHBOARD_TRANSACTIONS;
        return httpClient.get(path);
    }

    async getNotifications() {
        return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_NOTIFICATIONS);
    }

    /**
     * GET /api/admin/revenue
     * @returns {Promise<{ data?: { summary?: object, byTrainer?: object[] } }>}
     */
    async getRevenueAnalytics() {
        return httpClient.get(API_ENDPOINTS.ADMIN.REVENUE);
    }
}

export default new AdminDashboardService();
