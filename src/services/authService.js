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
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                firstName: userData.firstName,
                middleName: userData.middleName || '',
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
            });

            // Response shape: { status, message, data: { professionalId } }
            const professionalId = response?.data?.professionalId;
            if (professionalId) {
                localStorage.setItem('professionalId', professionalId);
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Register Recruiter / Training Agent (Step 1)
     * @param {Object} recruiterData 
     * @param {string} recruiterData.email
     * @param {string} recruiterData.password
     * @param {string} recruiterData.confirmPassword
     * @param {string} recruiterData.role - e.g. "TRAINING_AGENT" or "RECRUITMENT_AGENT"
     * @returns {Promise<Object>} Response shape: { status, message, data: { recruiterId } }
     */
    async registerRecruiter(recruiterData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.REGISTER, {
                email: recruiterData.email,
                password: recruiterData.password,
                confirmPassword: recruiterData.confirmPassword,
                role: recruiterData.role,
            });

            // Store temporary recruiterId
            const recruiterId = response?.data?.recruiterId;
            if (recruiterId) {
                localStorage.setItem('recruiterId', recruiterId);
            }

            return response;
        } catch (error) {
            console.error('Recruiter Registration error:', error);
            throw error;
        }
    }

    /**
     * Verify OTP
     * @param {Object} otpData - OTP verification data
     * @param {string} otpData.professionalId - Professional ID
     * @param {string} otpData.code - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyOTP(otpData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
                professionalId: otpData.professionalId,
                code: otpData.code,
            });

            // Response shape: { status, message, data: { registrationStep } }
            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }

    /**
     * Verify Recruiter OTP (Step 2)
     * @param {Object} otpData
     * @param {string} otpData.recruiterId - Recruiter ID
     * @param {string} otpData.code - 6-digit OTP code
     * @returns {Promise<Object>} Response shape: { status, data: { registrationStep } }
     */
    async verifyRecruiterOTP(otpData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.VERIFY_OTP, {
                recruiterId: otpData.recruiterId,
                code: otpData.code,
            });

            // Expected response shape: { status, data: { registrationStep } }
            return response;
        } catch (error) {
            console.error('Recruiter OTP Verification error:', error);
            throw error;
        }
    }

    /**
     * Resend Recruiter OTP
     * @param {string} email - Recruiter's email address
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async resendRecruiterOTP(email) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.RESEND_OTP, {
                email,
            });
            return response;
        } catch (error) {
            console.error('Recruiter Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Set Recruiter Personal Info (Step 3)
     * @param {Object} infoData
     * @param {string} infoData.recruiterId
     * @param {string} infoData.firstName
     * @param {string} infoData.middleName
     * @param {string} infoData.lastName
     * @param {string} infoData.phoneCode
     * @param {string} infoData.phoneNumber
     * @param {string} infoData.personalRole
     * @param {string} [infoData.otherRole]
     * @returns {Promise<Object>} Response shape: { status, data: { registrationStep } }
     */
    async setRecruiterPersonalInfo(infoData) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.RECRUITER.PERSONAL_INFO, infoData);
            return response;
        } catch (error) {
            console.error('Recruiter Personal Info error:', error);
            throw error;
        }
    }

    /**
     * Verify Recruiter Phone OTP (Step 4)
     * @param {Object} otpData
     * @param {string} otpData.recruiterId
     * @param {string} otpData.code - 6-digit OTP code
     * @returns {Promise<Object>} Response shape: { status, data: { registrationStep } }
     */
    async verifyRecruiterPhoneOTP(otpData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.VERIFY_PHONE, {
                recruiterId: otpData.recruiterId,
                code: otpData.code,
            });
            return response;
        } catch (error) {
            console.error('Recruiter Phone Verification error:', error);
            throw error;
        }
    }

    /**
     * Get Company Preview (Step 5a)
     * @param {string} url - The company website URL
     * @returns {Promise<Object>} Response shape: { status, data: { name, logo } }
     */
    async getCompanyPreview(url) {
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.RECRUITER.COMPANY_PREVIEW}?url=${encodeURIComponent(url)}`);
            return response;
        } catch (error) {
            console.error('Get Company Preview error:', error);
            throw error;
        }
    }

    /**
     * Set Recruiter Company Details (Step 5)
     * @param {Object} detailsData
     * @param {string} detailsData.recruiterId
     * @param {string} detailsData.organizationName
     * @param {string} detailsData.address
     * @param {string} detailsData.companyCity
     * @param {string} detailsData.companyState
     * @param {string} detailsData.companyZip
     * @param {string} detailsData.companyCountry
     * @param {string} detailsData.website
     * @param {string} detailsData.companyLinkedIn
     * @returns {Promise<Object>} Response shape: { status, data: { registrationStep } }
     */
    async setRecruiterCompanyDetails(detailsData) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.RECRUITER.COMPANY_DETAILS, detailsData);
            return response;
        } catch (error) {
            console.error('Recruiter Company Details error:', error);
            throw error;
        }
    }

    /**
     * Submit Recruiter Compliance & Trust Declaration (Step 6 - Final)
     * @param {Object} complianceData
     * @param {string} complianceData.recruiterId
     * @param {boolean} complianceData.isAuthorized
     * @param {boolean} complianceData.agreedToTerms
     * @param {string} complianceData.howDidYouHear
     * @returns {Promise<Object>} Response shape: { status, token, data: { registrationStep } }
     */
    async setRecruiterCompliance(complianceData) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.RECRUITER.COMPLIANCE, complianceData);
            
            // On successful final step, backend optionally returns a token
            const token = response?.token || response?.data?.token;
            if (token) {
                localStorage.setItem('authToken', token);
                const userProfile = response?.data?.userProfile || response?.data;
                if (userProfile) {
                    localStorage.setItem('userProfile', JSON.stringify(userProfile));
                }
                // Cleanup temp registration id
                localStorage.removeItem('recruiterId');
            }

            return response;
        } catch (error) {
            console.error('Recruiter Compliance error:', error);
            throw error;
        }
    }

    /**
     * Login Recruiter
     * @param {Object} credentials
     * @param {string} credentials.email
     * @param {string} credentials.password
     * @returns {Promise<Object>} Response shape: { status, token, data: { recruiter: {...} } }
     */
    async loginRecruiter(credentials) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.LOGIN, credentials);

            if (response.token || response.data?.token) {
                const token = response.token || response.data.token;
                localStorage.setItem('authToken', token);
                
                // Store user profile info for frontend use
                const profile = response.data?.recruiter || response.data;
                if (profile) {
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                    localStorage.setItem('userRole', profile.role);
                    // Save recruiterId so KYC and other flows can resolve it
                    const id = profile.id || profile.recruiterId || profile._id;
                    if (id) {
                        localStorage.setItem('recruiterId', id);
                    }
                    // Persist approval/account status for routing decisions
                    if (profile.status) {
                        localStorage.setItem('recruiterStatus', profile.status);
                    }
                    if (profile.isApproved !== undefined) {
                        localStorage.setItem('recruiterIsApproved', String(profile.isApproved));
                    }

                    // Sync KYC wizard localStorage keys so the dashboard renders correctly.
                    // The useKycWizard hook reads `{prefix}KycStatus` and `{prefix}AdminVerified`
                    // to decide whether to show the KYC popup or the actual dashboard.
                    const isApproved =
                        profile.isApproved === true ||
                        profile.status === 'APPROVED' ||
                        profile.status === 'ACTIVE' ||
                        profile.status === 'active' ||
                        profile.status === 'approved';

                    // Determine the storage prefix based on role
                    const isTrainingProvider =
                        profile.role === 'TRAINING_AGENT' ||
                        profile.role === 'training-provider';
                    const prefix = isTrainingProvider ? 'trainingProvider' : 'recruiter';

                    if (isApproved) {
                        localStorage.setItem(`${prefix}KycStatus`, 'completed');
                        localStorage.setItem(`${prefix}AdminVerified`, 'true');
                    } else {
                        // If the profile has kycStatus from backend, persist it
                        const backendKycStatus = profile.kycStatus || profile.kyc_status;
                        if (backendKycStatus) {
                            localStorage.setItem(`${prefix}KycStatus`, backendKycStatus);
                        }
                    }
                }
            }

            return response;
        } catch (error) {
            console.error('Recruiter Login error:', error);
            throw error;
        }
    }

    /**
     * Request Password Reset for Recruiter
     * @param {string} email
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async forgotRecruiterPassword(email) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RECRUITER.FORGOT_PASSWORD, { email });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset Recruiter Password using token
     * @param {string} token 
     * @param {string} password - New password
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async resetRecruiterPassword(token, password) {
        try {
            // Token is passed in URL path for this endpoint
            const response = await httpClient.patch(`${API_ENDPOINTS.RECRUITER.RESET_PASSWORD}/${token}`, { password });
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Update Recruiter Password (Authenticated)
     * @param {Object} data 
     * @param {string} data.currentPassword
     * @param {string} data.newPassword
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async updateRecruiterPassword(currentPassword, newPassword) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.RECRUITER.UPDATE_PASSWORD, { 
                currentPassword, 
                newPassword 
            });
            return response;
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }

    /**
     * Select Profession - Step 3
     * @param {Object} data - Profession selection data
     * @param {string} data.professionalId - Professional ID
     * @param {string} data.profession - e.g. "OFFICER", "RATINGS_AND_CREW", etc.
     * @returns {Promise<Object>} Response with registrationStep: 3
     */
    async selectProfession(data) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.PROFESSIONAL.SELECT_PROFESSION, {
                professionalId: data.professionalId,
                profession: data.profession,
            });

            // Response shape: { status, data: { registrationStep } }
            return response;
        } catch (error) {
            console.error('Select profession error:', error);
            throw error;
        }
    }

    /**
     * Select Role (Subcategory) - Step 5 (Final Registration Step)
     * @param {Object} data - Role selection data
     * @param {string} data.professionalId - Professional ID
     * @param {string} data.subcategory - e.g. "Deck Officer"
     * @returns {Promise<Object>} Response with JWT token and full user profile
     *   Shape: { status, token, data: { user: { id, fullname, email, profession, ... }, registrationStep: 5 } }
     */
    async selectRole(data) {
        try {
            const response = await httpClient.patch(API_ENDPOINTS.PROFESSIONAL.SELECT_ROLE, {
                professionalId: data.professionalId,
                subcategory: data.subcategory,
            });

            // Registration complete — store JWT and clear temp professionalId
            if (response?.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.removeItem('professionalId');
            }

            // Response shape: { status, token, data: { user, registrationStep: 5 } }
            return response;
        } catch (error) {
            console.error('Select role error:', error);
            throw error;
        }
    }


    /**
     * Upload ID/Passport document
     * @param {File} file - ID or Passport image file
     * @returns {Promise<Object>} Upload response with URL
     */
    async uploadID(file) {
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
    }

    /**
     * Upload profile photo - Step 4
     * @param {string} professionalId - Professional ID
     * @param {File} file - Profile photo image file (binary)
     * @returns {Promise<Object>} Response with { status, data: { url, registrationStep: 4 } }
     */
    async uploadProfilePhoto(professionalId, file) {
        try {
            const formData = new FormData();
            formData.append('professionalId', professionalId);
            formData.append('photo', file);

            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.UPLOAD_PHOTO, {
                method: 'POST',
                body: formData,
            });

            // Response shape: { status, data: { url, registrationStep } }
            return response;
        } catch (error) {
            console.error('Profile photo upload error:', error);
            throw error;
        }
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
    }

    /**
     * Resend OTP
     * @param {string} email - Professional's email address
     * @returns {Promise<Object>} Response shape: { status, message }
     *   Errors: 400 = Validation failed, 404 = Professional not found
     */
    async resendOTP(email) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
                email,
            });
            return response;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Login - Professional Login
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @returns {Promise<Object>} Response shape: { status, token, data: { user } }
     *   Errors: 401 = Invalid credentials or unverified account
     */
    async login(credentials) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
                email: credentials.email,
                password: credentials.password,
            });

            // Response shape: { status, token, data: { user } }
            if (response?.token) {
                localStorage.setItem('authToken', response.token);
            }

            // Persist user profile for use across the app
            if (response?.data?.user) {
                localStorage.setItem('userProfile', JSON.stringify(response.data.user));
                // Save professionalId so KYC and other flows can resolve it
                const id = response.data.user.id || response.data.user.professionalId || response.data.user._id;
                if (id) {
                    localStorage.setItem('professionalId', id);
                }
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Admin Login
     * @param {Object} credentials
     * @param {string} credentials.email
     * @param {string} credentials.password
     * @returns {Promise<Object>} Response shape: { status, token }
     */
    async loginAdmin(credentials) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.ADMIN.LOGIN, {
                email: credentials.email,
                password: credentials.password,
            });

            if (response?.token || response?.data?.token) {
                const token = response.token || response.data.token;
                localStorage.setItem('authToken', token);
                localStorage.setItem('adminUserType', 'admin');
            }

            return response;
        } catch (error) {
            console.error('Admin Login error:', error);
            throw error;
        }
    }

    /**
     * Forgot Password - Request a password reset link
     * @param {string} email - User's email
     * @returns {Promise<Object>} Response shape: { status, message }
     *   200: "Password reset link sent to your email."
     *   404: Professional not found
     */
    async forgotPassword(email) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
                email,
            });
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset Password - Reset password using token (path param)
     * PATCH /api/professional/reset-password/{token}
     * @param {string} token - Reset token received via email (path param)
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response shape: { status, message }
     *   200: "Your password has been reset successfully."
     *   400: Validation failed
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await httpClient.patch(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
                password: newPassword,
            });
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
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
