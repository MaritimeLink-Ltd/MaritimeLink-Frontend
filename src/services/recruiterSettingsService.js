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

    async uploadProfilePhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);
        return httpClient.patch(API_ENDPOINTS.RECRUITER.SETTINGS_PROFILE_PHOTO, formData);
    }

    async removeProfilePhoto() {
        return httpClient.delete(API_ENDPOINTS.RECRUITER.SETTINGS_PROFILE_PHOTO);
    }

    async getBilling() {
        return httpClient.get(API_ENDPOINTS.RECRUITER.SETTINGS_BILLING);
    }

    async getMembership() {
        try {
            return await httpClient.get(API_ENDPOINTS.RECRUITER.MEMBERSHIP);
        } catch (error) {
            console.error('Recruiter membership fetch error:', error);
            throw error;
        }
    }

    async updateMembership(tier) {
        try {
            return await httpClient.patch(API_ENDPOINTS.RECRUITER.MEMBERSHIP, { tier });
        } catch (error) {
            console.error('Recruiter membership update error:', error);
            throw error;
        }
    }

    async createMembershipCheckout() {
        try {
            return await httpClient.post(API_ENDPOINTS.RECRUITER.MEMBERSHIP_CHECKOUT);
        } catch (error) {
            console.error('Recruiter membership checkout error:', error);
            throw error;
        }
    }

    async confirmMembershipCheckout(sessionId) {
        try {
            return await httpClient.post(
                `${API_ENDPOINTS.RECRUITER.MEMBERSHIP_CONFIRM}?session_id=${encodeURIComponent(sessionId)}`,
            );
        } catch (error) {
            console.error('Recruiter membership confirm error:', error);
            throw error;
        }
    }

    async createFlexListingCheckout(jobId) {
        try {
            return await httpClient.post(API_ENDPOINTS.RECRUITER.FLEX_CHECKOUT(jobId));
        } catch (error) {
            console.error('Flex listing checkout error:', error);
            throw error;
        }
    }

    async confirmFlexListingCheckout(jobId, sessionId) {
        try {
            return await httpClient.post(
                `${API_ENDPOINTS.RECRUITER.FLEX_CONFIRM(jobId)}?session_id=${encodeURIComponent(sessionId)}`,
            );
        } catch (error) {
            console.error('Flex listing confirm error:', error);
            throw error;
        }
    }
}

export default new RecruiterSettingsService();
