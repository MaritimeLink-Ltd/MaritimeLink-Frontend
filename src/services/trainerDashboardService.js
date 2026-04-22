/**
 * Training provider (trainer) dashboard — aggregated stats by timeframe.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

function buildStatsPath({ timeframe } = {}) {
    const params = new URLSearchParams();
    if (timeframe) params.set('timeframe', timeframe);
    const qs = params.toString();
    const base = API_ENDPOINTS.TRAINER.DASHBOARD_STATS;
    return qs ? `${base}?${qs}` : base;
}

class TrainerDashboardService {
    /**
     * GET /api/trainer/dashboard/stats
     * @param {{ timeframe?: 'today'|'7d'|'30d' }} query — omit timeframe for all-time aggregate
     * @returns {Promise<{ data?: { stats?: { activeCoursesCount?: number, newBookingsCount?: number, demandSignalsCount?: number } } }>}
     */
    async getDashboardStats(query = {}) {
        return httpClient.get(buildStatsPath(query));
    }

    /**
     * GET /api/trainer/dashboard/action-items
     * @returns {Promise<{ data?: { actionItems?: object[] }, results?: number }>}
     */
    async getDashboardActionItems() {
        return httpClient.get(API_ENDPOINTS.TRAINER.DASHBOARD_ACTION_ITEMS);
    }

    /**
     * GET /api/trainer/dashboard/courses
     * @returns {Promise<{ data?: { courses?: object[] }, results?: number }>}
     */
    async getDashboardCourses() {
        return httpClient.get(API_ENDPOINTS.TRAINER.DASHBOARD_COURSES);
    }

    async getNotifications() {
        return httpClient.get(API_ENDPOINTS.TRAINER.DASHBOARD_NOTIFICATIONS);
    }

    async getStripeStatus() {
        return httpClient.get(API_ENDPOINTS.TRAINER.STRIPE_STATUS);
    }

    async startStripeOnboarding() {
        return httpClient.post(API_ENDPOINTS.TRAINER.STRIPE_ONBOARDING, {});
    }

    async refreshStripeOnboarding() {
        return httpClient.post(API_ENDPOINTS.TRAINER.STRIPE_ONBOARDING_REFRESH, {});
    }
}

export default new TrainerDashboardService();
