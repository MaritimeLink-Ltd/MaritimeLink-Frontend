/**
 * Profile Share API Service
 * Secure, expiring "Share Profile" links for professionals.
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api.config';

class ProfileShareService {
    /**
     * Create a secure share link for the logged-in professional's profile.
     * @param {Object} options
     * @param {boolean} [options.includeResume=true] - Share the full resume detail.
     * @param {string[]} [options.documentIds=[]] - Document wallet items to expose.
     * @param {number} [options.expiresInHours=24] - Link lifetime (1-168 hours).
     * @param {boolean} [options.allowDownload=false] - Let recipients save the files.
     */
    async createShareLink({
        includeResume = true,
        documentIds = [],
        expiresInHours = 24,
        allowDownload = false,
    } = {}) {
        try {
            return await httpClient.post(API_ENDPOINTS.PROFILE_SHARE.CREATE_LINK, {
                includeResume,
                documentIds,
                expiresInHours,
                allowDownload,
            });
        } catch (error) {
            console.error('Create profile share link error:', error);
            throw error;
        }
    }

    /**
     * Public: load a shared profile by token (no auth).
     */
    async getSharedProfile(token) {
        if (!token) throw new Error('Share token is required');
        return httpClient.get(API_ENDPOINTS.PROFILE_SHARE.SHARED_PROFILE(token), {
            skipAuth: true,
        });
    }

    /**
     * Absolute URL for a shared document file.
     *
     * Always resolved against API_CONFIG.BASE_URL rather than a bare path: relying on the
     * Vite dev proxy silently breaks whenever VITE_PROXY_TARGET does not match the port the
     * API actually listens on. The API sends permissive CORS, so a direct cross-origin
     * fetch behaves identically in dev and production.
     */
    sharedFileUrl(token, documentId, { download = false } = {}) {
        const path = API_ENDPOINTS.PROFILE_SHARE.SHARED_FILE(token, documentId);
        // `?download=1` is ignored by the API unless the sharer allowed downloads.
        const query = download ? '?download=1' : '';
        return `${API_CONFIG.BASE_URL.replace(/\/+$/, '')}${path}${query}`;
    }
}

const profileShareService = new ProfileShareService();
export default profileShareService;
