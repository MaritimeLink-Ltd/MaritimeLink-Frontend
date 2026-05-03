import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class RecruiterCandidateService {
    async searchCandidates(query = {}) {
        const params = new URLSearchParams();

        if (query.page) params.set('page', query.page);
        if (query.limit) params.set('limit', query.limit);
        if (query.search) params.set('search', query.search);
        if (query.sortBy) params.set('sortBy', query.sortBy);

        const appendMulti = (key, value) => {
            if (!value) return;
            const values = Array.isArray(value) ? value : [value];
            values.filter(Boolean).forEach((item) => params.append(key, item));
        };

        appendMulti('rankPosition', query.rankPosition);
        appendMulti('experienceLevel', query.experienceLevel);
        appendMulti('vesselType', query.vesselType);

        const qs = params.toString();
        const path = qs
            ? `${API_ENDPOINTS.RECRUITER.CANDIDATE_SEARCH}?${qs}`
            : API_ENDPOINTS.RECRUITER.CANDIDATE_SEARCH;

        return httpClient.get(path);
    }
}

export default new RecruiterCandidateService();
