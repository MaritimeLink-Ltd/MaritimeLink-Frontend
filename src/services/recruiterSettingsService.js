import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class RecruiterSettingsService {
    async getSettings() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.SETTINGS);
    }

    async updateProfile(payload) {
        return httpClient.patch(API_ENDPOINTS.RECRUITER.SETTINGS_PROFILE, payload);
    }

    async updateCompany(payload) {
        return httpClient.patch(API_ENDPOINTS.RECRUITER.SETTINGS_COMPANY, payload);
    }

    async updateNotifications(payload) {
        return httpClient.patch(API_ENDPOINTS.RECRUITER.SETTINGS_NOTIFICATIONS, payload);
    }

    async getBilling() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.SETTINGS_BILLING);
    }

    async uploadProfilePhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);
        return httpClient.patch(API_ENDPOINTS.RECRUITER.SETTINGS_PROFILE_PHOTO, formData);
    }

    async removeProfilePhoto() {
        return httpClient.delete(API_ENDPOINTS.RECRUITER.SETTINGS_PROFILE_PHOTO);
    }
}

export default new RecruiterSettingsService();
