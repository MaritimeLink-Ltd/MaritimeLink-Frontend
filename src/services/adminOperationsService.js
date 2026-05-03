import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class AdminOperationsService {
    async getActivityLogs(query = {}) {
        const params = new URLSearchParams();

        if (query.page) params.set('page', query.page);
        if (query.limit) params.set('limit', query.limit);
        if (query.action) params.set('action', query.action);
        if (query.actorType) params.set('actorType', query.actorType);
        if (query.status) params.set('status', query.status);

        const qs = params.toString();
        const path = qs
            ? `${API_ENDPOINTS.ADMIN.OPERATIONS_ACTIVITY}?${qs}`
            : API_ENDPOINTS.ADMIN.OPERATIONS_ACTIVITY;

        return httpClient.get(path);
    }

    async getActivityLogById(id) {
        return httpClient.get(API_ENDPOINTS.ADMIN.OPERATIONS_ACTIVITY_DETAIL(id));
    }

    async getSystemStats() {
        return httpClient.get(API_ENDPOINTS.ADMIN.OPERATIONS_STATS);
    }

    async getSupportCases(query = {}) {
        const params = new URLSearchParams();

        if (query.page) params.set('page', query.page);
        if (query.limit) params.set('limit', query.limit);
        if (query.status && query.status !== 'All') params.set('status', query.status);
        if (query.priority && query.priority !== 'All') params.set('priority', query.priority);
        if (query.userId) params.set('userId', query.userId);

        const qs = params.toString();
        const path = qs
            ? `${API_ENDPOINTS.ADMIN.SUPPORT_CASES}?${qs}`
            : API_ENDPOINTS.ADMIN.SUPPORT_CASES;

        return httpClient.get(path);
    }

    async getSupportCaseById(id) {
        return httpClient.get(API_ENDPOINTS.ADMIN.SUPPORT_CASE_DETAIL(id));
    }

    async updateSupportCase(id, payload) {
        return httpClient.patch(API_ENDPOINTS.ADMIN.SUPPORT_CASE_DETAIL(id), payload);
    }

    async addSupportCaseNote(id, payload) {
        return httpClient.post(`${API_ENDPOINTS.ADMIN.SUPPORT_CASE_DETAIL(id)}/notes`, payload);
    }
}

export default new AdminOperationsService();
