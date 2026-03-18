/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    REGISTER: '/api/professional/register',
    VERIFY_OTP: '/api/professional/verify-otp',
    RESEND_OTP: '/api/professional/resend-otp',
    LOGIN: '/api/professional/login',
    FORGOT_PASSWORD: '/api/professional/forgot-password',
    RESET_PASSWORD: '/api/professional/reset-password', // token will be appended
  },
  // Professional Endpoints
  PROFESSIONAL: {
    UPLOAD_ID: '/api/professional/upload-id',
    UPLOAD_PHOTO: '/api/professional/upload-photo',
    COMPLETE_PROFILE: '/api/professional/complete-profile',
    SELECT_PROFESSION: '/api/professional/profession',
    SELECT_ROLE: '/api/professional/role',
  },
  // Recruiter/Enterprise Endpoints
  RECRUITER: {
    REGISTER: '/api/recruiter/register',
    VERIFY_OTP: '/api/recruiter/verify-otp',
    RESEND_OTP: '/api/recruiter/resend-otp',
    PERSONAL_INFO: '/api/recruiter/personal-info',
    VERIFY_PHONE: '/api/recruiter/verify-phone',
    COMPANY_PREVIEW: '/api/recruiter/company-preview',
    COMPANY_DETAILS: '/api/recruiter/company-details',
    COMPLIANCE: '/api/recruiter/compliance',
    LOGIN: '/api/recruiter/login',
    FORGOT_PASSWORD: '/api/recruiter/forgot-password',
    RESET_PASSWORD: '/api/recruiter/reset-password', // token will be appended
    UPDATE_PASSWORD: '/api/recruiter/update-password',
  }
};

export default API_CONFIG;
