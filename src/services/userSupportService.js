import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

const buildSupportEndpoints = (basePath) => {
    if (basePath === 'professional') return API_ENDPOINTS.PROFESSIONAL.SUPPORT;
    if (basePath === 'recruiter') return API_ENDPOINTS.RECRUITER.SUPPORT;
    if (basePath === 'trainer') return API_ENDPOINTS.TRAINER.SUPPORT;
    throw new Error(`Unsupported support base path: ${basePath}`);
};

const buildQueryPath = (path, query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
};

class UserSupportService {
    getCases(basePath, query = {}) {
        const endpoints = buildSupportEndpoints(basePath);
        return httpClient.get(buildQueryPath(endpoints.CASES, query));
    }

    getCaseById(basePath, id) {
        const endpoints = buildSupportEndpoints(basePath);
        return httpClient.get(endpoints.CASE_DETAIL(id));
    }

    createCase(basePath, payload) {
        const endpoints = buildSupportEndpoints(basePath);
        return httpClient.post(endpoints.CASES, payload);
    }

    addReply(basePath, id, payload) {
        const endpoints = buildSupportEndpoints(basePath);
        return httpClient.post(endpoints.REPLY(id), payload);
    }
}

export default new UserSupportService();
