/**
 * Training provider (trainer) dashboard — aggregated stats by timeframe.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';
import { DASHBOARD_LIST_PAGE_SIZE } from '../constants/dashboardPagination';

function listPaginationQuery({ limit = DASHBOARD_LIST_PAGE_SIZE, offset = 0 } = {}) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    return params.toString();
}

function buildStatsPath({ timeframe } = {}) {
    const params = new URLSearchParams();
    if (timeframe) params.set('timeframe', timeframe);
    const qs = params.toString();
    const base = API_ENDPOINTS.TRAINER.DASHBOARD_STATS;
    return qs ? `${base}?${qs}` : base;
}

function buildQueryPath(base, query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
    });
    const qs = params.toString();
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
    async getDashboardActionItems(pagination = {}) {
        const qs = listPaginationQuery(pagination);
        const url = qs
            ? `${API_ENDPOINTS.TRAINER.DASHBOARD_ACTION_ITEMS}?${qs}`
            : API_ENDPOINTS.TRAINER.DASHBOARD_ACTION_ITEMS;
        return httpClient.get(url);
    }

    /**
     * GET /api/trainer/dashboard/courses
     * @returns {Promise<{ data?: { courses?: object[] }, results?: number }>}
     */
    async getDashboardCourses(pagination = {}) {
        const qs = listPaginationQuery(pagination);
        const url = qs
            ? `${API_ENDPOINTS.TRAINER.DASHBOARD_COURSES}?${qs}`
            : API_ENDPOINTS.TRAINER.DASHBOARD_COURSES;
        return httpClient.get(url);
    }

    async getDemandOverview(query = {}) {
        const url = buildQueryPath(API_ENDPOINTS.TRAINER.DEMAND_OVERVIEW, query);
        return httpClient.get(url);
    }

    async getDemandExpiries(query = {}) {
        const url = buildQueryPath(API_ENDPOINTS.TRAINER.DEMAND_EXPIRIES, query);
        return httpClient.get(url);
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
