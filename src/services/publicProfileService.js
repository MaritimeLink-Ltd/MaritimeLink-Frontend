/**
 * Public Profile API Service
 * Opt-in, search-engine indexable professional profiles.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class PublicProfileService {
    /** Current visibility setting + canonical slug for the logged-in professional. */
    async getMySettings() {
        return httpClient.get(API_ENDPOINTS.PUBLIC_PROFILE.MY_SETTINGS);
    }

    /** Turn the public, indexable profile on or off. */
    async setEnabled(publicProfileEnabled) {
        return httpClient.patch(API_ENDPOINTS.PUBLIC_PROFILE.MY_SETTINGS, {
            publicProfileEnabled,
        });
    }

    /** Public: fetch a profile by slug (no auth). */
    async getBySlug(slug) {
        if (!slug) throw new Error('Profile slug is required');
        return httpClient.get(API_ENDPOINTS.PUBLIC_PROFILE.BY_SLUG(slug), {
            skipAuth: true,
        });
    }
}

const publicProfileService = new PublicProfileService();
export default publicProfileService;
