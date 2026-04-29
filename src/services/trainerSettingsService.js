import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class TrainerSettingsService {
    async getSettings() {
        return httpClient.get(API_ENDPOINTS.TRAINER.SETTINGS);
    }

    async updateProfile(payload) {
        return httpClient.patch(API_ENDPOINTS.TRAINER.SETTINGS_PROFILE, payload);
    }

    async updateCompany(payload) {
        return httpClient.patch(API_ENDPOINTS.TRAINER.SETTINGS_COMPANY, payload);
    }

    async updateNotifications(payload) {
        return httpClient.patch(API_ENDPOINTS.TRAINER.SETTINGS_NOTIFICATIONS, payload);
    }

    async getBilling() {
        return httpClient.get(API_ENDPOINTS.TRAINER.SETTINGS_BILLING);
    }

    async uploadProfilePhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);
        return httpClient.patch(API_ENDPOINTS.TRAINER.SETTINGS_PROFILE_PHOTO, formData);
    }

    async removeProfilePhoto() {
        return httpClient.delete(API_ENDPOINTS.TRAINER.SETTINGS_PROFILE_PHOTO);
    }

    async updatePassword(currentPassword, newPassword) {
        return httpClient.patch(API_ENDPOINTS.TRAINER.UPDATE_PASSWORD, {
            oldPassword: currentPassword,
            newPassword,
        });
    }
}

export default new TrainerSettingsService();
