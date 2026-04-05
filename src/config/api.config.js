/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://maritime-apis.onrender.com';

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
    UPLOAD_CV: '/api/professional/upload-cv',
    UPLOAD_COVER_LETTER: '/api/professional/upload-cover-letter',
    COMPLETE_PROFILE: '/api/professional/complete-profile',
    SELECT_PROFESSION: '/api/professional/profession',
    SELECT_ROLE: '/api/professional/role',
    // KYC Endpoints
    KYC_UPLOAD_FRONT: '/api/professional/kyc/upload-front',
    KYC_UPLOAD_BACK: '/api/professional/kyc/upload-back',
    KYC_SUBMIT: '/api/professional/kyc/submit',
    KYC_UPLOAD_SELFIE: '/api/professional/kyc/upload-selfie',
  },
  // Document Endpoints
  DOCUMENTS: {
    UPLOAD: '/api/professional/documents/upload',
    LIST: '/api/professional/documents',
    UPDATE: (id) => `/api/professional/documents/${id}`,
    DELETE: (id) => `/api/professional/documents/${id}`,
  },
  // Resume Endpoints
  RESUME: {
    GET_RESUME: '/api/professional/resume',
    BULK: '/api/professional/resume', // Supports POST and PUT
    PERSONAL_INFO: '/api/professional/resume/personal-info',
    SUMMARY: '/api/professional/resume/summary',
    SKILLS: '/api/professional/resume/skills',
    LICENSES: '/api/professional/resume/licenses',
    SEA_SERVICE: '/api/professional/resume/sea-service',
    EDUCATION: '/api/professional/resume/education',
    STCW: '/api/professional/resume/stcw-certificates',
    MEDICAL_TRAVEL_DOCS: '/api/professional/resume/medical-travel-documents',
    BIOMETRICS: '/api/professional/resume/biometrics',
    NEXT_OF_KIN: '/api/professional/resume/next-of-kin',
    REFEREES: '/api/professional/resume/referees',
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
  },
  // Recruiter KYC Endpoints
  RECRUITER_KYC: {
    UPLOAD_DOCUMENT_FRONT: '/api/recruiter/kyc/upload-document-front',
    UPLOAD_DOCUMENT_BACK: '/api/recruiter/kyc/upload-document-back',
    SUBMIT: '/api/recruiter/kyc/submit',
    UPLOAD_SELFIE: '/api/recruiter/kyc/upload-selfie',
  },
  // Training Provider KYC Endpoints
  TRAINING_PROVIDER_KYC: {
    UPLOAD_DOCUMENT_FRONT: '/api/trainer/kyc/upload-document-front',
    UPLOAD_DOCUMENT_BACK: '/api/trainer/kyc/upload-document-back',
    SUBMIT: '/api/trainer/kyc/submit',
    UPLOAD_SELFIE: '/api/trainer/kyc/upload-selfie',
  },
  // Job Endpoints
  JOBS: {
    CREATE: '/api/jobs',
    LIST: '/api/jobs',
    MY: '/api/jobs/my',
    DETAIL: (id) => `/api/jobs/${id}`,
    UPDATE: (id) => `/api/jobs/${id}`,
    DELETE: (id) => `/api/jobs/${id}`,
    ADMIN_ALL: '/api/admin/jobs',
    PROFESSIONAL_ALL: '/api/professional/jobs',
    PROFESSIONAL_DETAIL: (id) => `/api/professional/jobs/${id}`,
    APPLY: (id) => `/api/professional/jobs/${id}/apply`,
    SAVE: (id) => `/api/professional/jobs/${id}/save`,
    SAVED_ALL: '/api/professional/jobs/saved',
  },
  // Admin Endpoints
  ADMIN: {
    LOGIN: '/api/admin/login',
    KYC_SUBMISSIONS: '/api/admin/kyc-submissions',
    KYC_SUBMISSION_DETAIL: (id) => `/api/admin/kyc-submissions/${id}`,
    KYC_UPDATE_STATUS: (id) => `/api/admin/kyc-submissions/${id}/status`,
    KYC_ADD_NOTE: (id) => `/api/admin/kyc-submissions/${id}/notes`,
    KYC_STATS: '/api/admin/kyc/stats',
  },
};

export default API_CONFIG;
