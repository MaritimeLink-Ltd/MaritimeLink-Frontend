/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class AuthService {
    /**
     * Register a new professional
     * @param {Object} userData - User registration data
     * @param {string} userData.fullName - User's full name
     * @param {string} userData.email - User's email
     * @param {string} userData.password - User's password
     * @returns {Promise<Object>} Registration response with professionalId
     */
    async register(userData) {
        console.log('MOCK API: register called', userData);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                fullname: userData.fullName,  // Backend expects lowercase 'fullname'
                email: userData.email,
                password: userData.password,
            });

            // Store professionalId for OTP verification
            if (response.data && response.data.professionalId) {
                localStorage.setItem('professionalId', response.data.professionalId);
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
        */

        // MOCK RESPONSE
        const mockProfessionalId = 'mock-prof-id-' + Date.now();
        localStorage.setItem('professionalId', mockProfessionalId);

        return {
            status: 200,
            data: {
                professionalId: mockProfessionalId,
                message: 'Registration successful (MOCKED)'
            }
        };
    }

    /**
     * Verify OTP
     * @param {Object} otpData - OTP verification data
     * @param {string} otpData.professionalId - Professional ID
     * @param {string} otpData.code - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyOTP(otpData) {
        console.log('MOCK API: verifyOTP called', otpData);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
                professionalId: otpData.professionalId,
                code: otpData.code,
            });

            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
        */

        // MOCK RESPONSE
        return {
            status: 200,
            data: {
                message: 'OTP Verified (MOCKED)'
            }
        };
    }

    /**
     * Upload ID/Passport document
     * @param {File} file - ID or Passport image file
     * @returns {Promise<Object>} Upload response with URL
     */
    async uploadID(file) {
        console.log('MOCK API: uploadID called', file);
        /*
        try {
            const formData = new FormData();
            formData.append('id_passport', file);

            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.UPLOAD_ID, {
                method: 'POST',
                body: formData,
            });

            return response;
        } catch (error) {
            console.error('ID upload error:', error);
            throw error;
        }
        */

        // MOCK RESPONSE
        return {
            status: 200,
            data: {
                url: 'https://via.placeholder.com/150',
                message: 'ID Uploaded (MOCKED)'
            }
        };
    }

    /**
     * Upload profile picture/photo
     * @param {File} file - Profile photo image file
     * @returns {Promise<Object>} Upload response with URL
     */
    async uploadProfilePhoto(file) {
        console.log('MOCK API: uploadProfilePhoto called', file);
        /*
        try {
            const formData = new FormData();
            formData.append('profile_photo', file);
            const response = await httpClient.request('/api/professional/upload-profile-photo', {
                method: 'POST',
                body: formData,
            });
            return response;
        } catch (error) {
            console.error('Profile photo upload error:', error);
            throw error;
        }
        */
        return {
            status: 200,
            data: {
                url: URL.createObjectURL ? URL.createObjectURL(file) : 'https://via.placeholder.com/150',
                message: 'Profile photo uploaded (MOCKED)'
            }
        };
    }

    /**
     * Complete professional profile
     * @param {Object} profileData - Profile completion data
     * @param {string} profileData.professionalId - Professional ID
     * @param {string} profileData.jobExpertise - Job expertise
     * @param {string} profileData.bio - Professional bio
     * @returns {Promise<Object>} Profile completion response with JWT token
     */
    async completeProfile(profileData) {
        console.log('MOCK API: completeProfile called', profileData);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.PROFESSIONAL.COMPLETE_PROFILE, {
                professionalId: profileData.professionalId,
                jobExpertise: profileData.jobExpertise,
                bio: profileData.bio,
            });

            // Store auth token from profile completion
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.removeItem('professionalId'); // Clear temp ID
            }

            return response;
        } catch (error) {
            console.error('Complete profile error:', error);
            throw error;
        }
        */

        // MOCK RESPONSE
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        localStorage.removeItem('professionalId');

        return {
            status: 200,
            token: mockToken,
            data: {
                message: 'Profile completed (MOCKED)'
            }
        };
    }

    /**
     * Resend OTP
     * @param {string} professionalId - Professional ID
     * @returns {Promise<Object>} Resend OTP response
     */
    async resendOTP(professionalId) {
        console.log('MOCK API: resendOTP called', professionalId);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
                professionalId,
            });
            return response;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
        */
        return {
            status: 200,
            data: { message: 'OTP Resent (MOCKED)' }
        };
    }

    /**
     * Login
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @returns {Promise<Object>} Login response with token
     */
    async login(credentials) {
        console.log('MOCK API: login called', credentials);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
                email: credentials.email,
                password: credentials.password,
            });

            // Store auth token
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
        */

        // MOCK RESPONSE
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);

        return {
            status: 200,
            token: mockToken,
            data: {
                message: 'Login successful (MOCKED)',
                user: {
                    email: credentials.email,
                    fullName: 'Mock User'
                }
            }
        };
    }

    /**
     * Forgot Password - Request password reset link
     * @param {string} email - User's email
     * @returns {Promise<Object>} Response confirming reset link sent
     */
    async forgotPassword(email) {
        console.log('MOCK API: forgotPassword called', email);
        /*
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
                email,
            });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
        */
        return {
            status: 200,
            data: { message: 'Reset link sent (MOCKED)' }
        };
    }

    /**
     * Reset Password - Reset password using token
     * @param {string} token - Reset token from email
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response confirming password reset
     */
    async resetPassword(token, newPassword) {
        console.log('MOCK API: resetPassword called', token);
        /*
        try {
            const response = await httpClient.patch(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
                password: newPassword,
            });
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
        */
        return {
            status: 200,
            data: { message: 'Password reset successful (MOCKED)' }
        };
    }

    /**
     * Logout
     * Clears all authentication data
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('professionalId');
        localStorage.removeItem('userProfile');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Get stored professional ID
     * @returns {string|null} Professional ID
     */
    getProfessionalId() {
        return localStorage.getItem('professionalId');
    }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
