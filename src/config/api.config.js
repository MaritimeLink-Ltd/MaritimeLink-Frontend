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
    // COMPLETE_PROFILE: '/api/professional/complete-profile',
  },
};

export default API_CONFIG;
