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
}

export default new AdminOperationsService();
