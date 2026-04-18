/**
 * Recruiter dashboard — aggregated stats (timeframe or custom date range).
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/** Custom range uses `from` / `to` as YYYY-MM-DD (adjust if backend expects different params). */
function buildStatsPath({ timeframe, from, to } = {}) {
    const params = new URLSearchParams();
    if (timeframe) params.set('timeframe', timeframe);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    const base = API_ENDPOINTS.RECRUITER.DASHBOARD_STATS;
    return qs ? `${base}?${qs}` : base;
}

class RecruiterDashboardService {
    /**
     * GET /api/recruiter/dashboard/stats
     * @param {{ timeframe?: 'today'|'7d'|'1m', from?: string, to?: string }} query
     * @returns {Promise<{ data?: { stats?: object } }>}
     */
    async getDashboardStats(query = {}) {
        return httpClient.get(buildStatsPath(query));
    }

    /**
     * GET /api/recruiter/dashboard/action-items
     * @returns {Promise<{ data?: { actionItems?: object[] }, results?: number }>}
     */
    async getDashboardActionItems() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.DASHBOARD_ACTION_ITEMS);
    }

    /**
     * GET /api/recruiter/dashboard/jobs
     * @returns {Promise<{ data?: { jobs?: object[] }, results?: number }>}
     */
    async getDashboardJobs() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.DASHBOARD_JOBS);
    }

    /**
     * GET /api/recruiter/dashboard/popular-searches
     * @returns {Promise<{ data?: { popularSearches?: { term: string, count?: number }[] } }>}
     */
    async getPopularSearches() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.DASHBOARD_POPULAR_SEARCHES);
    }
}

export default new RecruiterDashboardService();
