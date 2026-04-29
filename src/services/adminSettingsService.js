import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class AdminSettingsService {
    async getSettings() {
        return httpClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
    }

    async updateProfile(payload) {
        return httpClient.patch(API_ENDPOINTS.ADMIN.SETTINGS_PROFILE, payload);
    }

    async updatePassword(currentPassword, newPassword) {
        return httpClient.patch(API_ENDPOINTS.ADMIN.SETTINGS_PASSWORD, {
            oldPassword: currentPassword,
            newPassword,
        });
    }
}

export default new AdminSettingsService();
