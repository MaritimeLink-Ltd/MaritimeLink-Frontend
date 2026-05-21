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

/** Deployed frontend host for copied links (share token path stays unchanged). */
const DEFAULT_PUBLIC_APP_ORIGIN = 'https://maritme-link-web.vercel.app';

/**
 * Origin used in user-facing links (e.g. document share). The API may return
 * `localhost`; the client rewrites to this origin. Set VITE_APP_PUBLIC_URL (or
 * VITE_PUBLIC_APP_URL) to override — e.g. `http://localhost:5173` for local-only links.
 */
export function getPublicAppOrigin() {
  const fromEnv = import.meta.env.VITE_APP_PUBLIC_URL || import.meta.env.VITE_PUBLIC_APP_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/+$/, '');
  }
  return DEFAULT_PUBLIC_APP_ORIGIN;
}

/** Rebuilds a full share URL so the host matches the public app, not the API’s default. */
export function rewriteShareLinkForSharing(secureLink) {
  if (!secureLink || typeof secureLink !== 'string') return secureLink;
  const publicOrigin = getPublicAppOrigin();
  if (!publicOrigin) return secureLink;
  try {
    const u = secureLink.startsWith('http')
      ? new URL(secureLink)
      : new URL(secureLink, publicOrigin);
    return `${publicOrigin}${u.pathname}${u.search}${u.hash}`;
  } catch {
    return secureLink;
  }
}

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
    DASHBOARD_OVERVIEW: '/api/professional/dashboard/overview',
    DASHBOARD_ALERTS: '/api/professional/dashboard/alerts',
    DASHBOARD_ALERT_READ: (alertId) => `/api/professional/dashboard/alerts/${alertId}/read`,
    DASHBOARD_ACTIVITY: '/api/professional/dashboard/activity',
    ME: '/api/professional/me',
    AVAILABILITY: '/api/professional/availability',
    FEEDBACK: '/api/professional/feedback',
    MEMBERSHIP: '/api/professional/membership',
    MEMBERSHIP_CHECKOUT: '/api/professional/membership/checkout',
    MEMBERSHIP_CONFIRM: '/api/professional/membership/confirm',
    PROFILE_PHOTO: '/api/professional/profile-photo',
    DELETE_ACCOUNT: '/api/professional/account',
    UPLOAD_ID: '/api/professional/upload-id',
    UPLOAD_PHOTO: '/api/professional/upload-photo',
    UPLOAD_CV: '/api/professional/upload-cv',
    UPLOAD_COVER_LETTER: '/api/professional/upload-cover-letter',
    COMPLETE_PROFILE: '/api/professional/complete-profile',
    SELECT_PROFESSION: '/api/professional/profession',
    SELECT_ROLE: '/api/professional/role',
    // KYC Endpoints
    KYC_UPLOAD_FRONT: '/api/professional/kyc/upload-document-front',
    KYC_UPLOAD_BACK: '/api/professional/kyc/upload-document-back',
    KYC_SUBMIT: '/api/professional/kyc/submit',
    KYC_UPLOAD_SELFIE: '/api/professional/kyc/upload-selfie',
    UPDATE_PASSWORD: '/api/professional/update-password',
    SUPPORT: {
      CASES: '/api/professional/support/cases',
      CASE_DETAIL: (id) => `/api/professional/support/cases/${id}`,
      REPLY: (id) => `/api/professional/support/cases/${id}/reply`,
    },
  },
  // Document Endpoints
  DOCUMENTS: {
    UPLOAD: '/api/professional/documents/upload',
    LIST: '/api/professional/documents',
    MARK_REPORT_GENERATED: '/api/professional/documents/report-generated',
    CREATE_SHARE_LINK: '/api/professional/documents/share-link',
    SHARED_PACK: (token) =>
      `/api/professional/documents/shared/${encodeURIComponent(token)}`,
    SHARED_FILE: (token, documentId) =>
      `/api/professional/documents/shared/${encodeURIComponent(token)}/file/${documentId}`,
    UPDATE: (id) => `/api/professional/documents/${id}`,
    REPLACE_FILE: (id) => `/api/professional/documents/${id}/file`,
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
    /** Gemini + Google Search grounding preview (registration / optional UI). */
    COMPANY_DETAILS_LOOKUP: '/api/recruiter/company-details/lookup',
    COMPANY_DETAILS: '/api/recruiter/company-details',
    COMPLIANCE: '/api/recruiter/compliance',
    LOGIN: '/api/recruiter/login',
    FORGOT_PASSWORD: '/api/recruiter/forgot-password',
    RESET_PASSWORD: '/api/recruiter/reset-password', // token will be appended
    UPDATE_PASSWORD: '/api/recruiter/update-password',
    SETTINGS: '/api/recruiter/settings',
    SETTINGS_PROFILE: '/api/recruiter/settings/profile',
    SETTINGS_COMPANY: '/api/recruiter/settings/company',
    SETTINGS_NOTIFICATIONS: '/api/recruiter/settings/notifications',
    SETTINGS_PROFILE_PHOTO: '/api/recruiter/settings/profile-photo',
    SUPPORT: {
      CASES: '/api/recruiter/support/cases',
      CASE_DETAIL: (id) => `/api/recruiter/support/cases/${id}`,
      REPLY: (id) => `/api/recruiter/support/cases/${id}/reply`,
    },
    APPLICANT_DETAILS: (id) => `/api/recruiter/applicants/${id}`,
    PROFESSIONAL_DETAIL: (id) => `/api/recruiter/professionals/${id}`,
    UPDATE_APPLICANT_STATUS: (id) => `/api/recruiter/applicants/${id}/status`,
    DASHBOARD_STATS: '/api/recruiter/dashboard/stats',
    DASHBOARD_ACTION_ITEMS: '/api/recruiter/dashboard/action-items',
    DASHBOARD_JOBS: '/api/recruiter/dashboard/jobs',
    DASHBOARD_POPULAR_SEARCHES: '/api/recruiter/dashboard/popular-searches',
    DASHBOARD_NOTIFICATIONS: '/api/recruiter/dashboard/notifications',
    CANDIDATE_SEARCH: '/api/recruiter/candidates/search',
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
  // Training provider (trainer) session / booking management
  TRAINER: {
    DASHBOARD_STATS: '/api/trainer/dashboard/stats',
    DASHBOARD_ACTION_ITEMS: '/api/trainer/dashboard/action-items',
    DASHBOARD_COURSES: '/api/trainer/dashboard/courses',
    DASHBOARD_NOTIFICATIONS: '/api/trainer/dashboard/notifications',
    DEMAND_OVERVIEW: '/api/trainer/dashboard/demand/overview',
    DEMAND_EXPIRIES: '/api/trainer/dashboard/demand/expiries',
    UPDATE_PASSWORD: '/api/trainer/update-password',
    SETTINGS: '/api/trainer/settings',
    SETTINGS_PROFILE: '/api/trainer/settings/profile',
    SETTINGS_COMPANY: '/api/trainer/settings/company',
    SETTINGS_NOTIFICATIONS: '/api/trainer/settings/notifications',
    SETTINGS_BILLING: '/api/trainer/settings/billing',
    SETTINGS_PROFILE_PHOTO: '/api/trainer/settings/profile-photo',
    SUPPORT: {
      CASES: '/api/trainer/support/cases',
      CASE_DETAIL: (id) => `/api/trainer/support/cases/${id}`,
      REPLY: (id) => `/api/trainer/support/cases/${id}/reply`,
    },
    STRIPE_STATUS: '/api/trainer/stripe/status',
    STRIPE_ONBOARDING: '/api/trainer/stripe/onboarding',
    STRIPE_ONBOARDING_REFRESH: '/api/trainer/stripe/onboarding/refresh',
    SESSION_ATTENDEES: (sessionId) => `/api/trainer/sessions/${sessionId}/attendees`,
    APPROVE_ATTENDEE: (sessionId, bookingId) =>
      `/api/trainer/sessions/${sessionId}/attendees/${bookingId}/approve`,
    /** Optional: reject pending attendee (backend must implement this route). */
    REJECT_ATTENDEE: (sessionId, bookingId) =>
      `/api/trainer/sessions/${sessionId}/attendees/${bookingId}/reject`,
    /** Professional profile for a booked trainee (backend must implement if used). */
    PROFESSIONAL_DETAIL: (professionalId) => `/api/trainer/professionals/${professionalId}`,
    /** Trainer course bookings list. */
    BOOKINGS: '/api/trainer/bookings',
    /** Full course booking including documents submitted at checkout. */
    BOOKING_DETAIL: (bookingId) => `/api/trainer/bookings/${bookingId}`,
  },
  // Job Endpoints
  JOBS: {
    CREATE: '/api/jobs',
    LIST: '/api/jobs',
    MY: '/api/jobs/my',
    DETAIL: (id) => `/api/jobs/${id}`,
    RECRUITER_DETAIL: (id) => `/api/recruiter/jobs/${id}`,
    ADMIN_DETAIL: (id) => `/api/admin/jobs/${id}`,
    UPDATE: (id) => `/api/jobs/${id}`,
    UPDATE_STATUS: (id) => `/api/jobs/${id}/status`,
    DELETE: (id) => `/api/jobs/${id}`,
    ADMIN_ALL: '/api/admin/jobs',
    ADMIN_APPLICANTS: (id) => `/api/admin/jobs/${id}/applicants`,
    ADMIN_MATCHES: (id) => `/api/admin/jobs/${id}/matches`,
    ADMIN_INVITE_MATCH: (jobId, professionalId) => `/api/admin/jobs/${jobId}/invite/${professionalId}`,
    /** SUPER_ADMIN: hide job from main feed */
    ADMIN_FLAG: (id) => `/api/admin/jobs/${id}/flag`,
    PROFESSIONAL_ALL: '/api/professional/jobs',
    PROFESSIONAL_DETAIL: (id) => `/api/professional/jobs/${id}`,
    APPLY: (id) => `/api/professional/jobs/${id}/apply`,
    SAVE: (id) => `/api/professional/jobs/${id}/save`,
    SAVED_ALL: '/api/professional/jobs/saved',
    APPLICATIONS: '/api/professional/applications',
    RECRUITER_APPLICANTS: (id) => `/api/recruiter/jobs/${id}/applicants`,
    RECRUITER_MATCHES: (id) => `/api/recruiter/jobs/${id}/matches`,
    RECRUITER_INVITE_MATCH: (jobId, professionalId) => `/api/recruiter/jobs/${jobId}/invite/${professionalId}`,
    ADMIN_BULK_UPLOAD: '/api/admin/jobs/bulk-upload',
  },
  // Admin Endpoints
  ADMIN: {
    LOGIN: '/api/admin/login',
    SETTINGS: '/api/admin/settings',
    SETTINGS_PROFILE: '/api/admin/settings/profile',
    SETTINGS_PASSWORD: '/api/admin/settings/password',
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    DASHBOARD_ACTIVITY: '/api/admin/dashboard/activity',
    DASHBOARD_ACTIVITY_REPORT: '/api/admin/dashboard/activity-report',
    DASHBOARD_REVENUE: '/api/admin/dashboard/revenue',
    DASHBOARD_QUEUES: '/api/admin/dashboard/queues',
    DASHBOARD_TRANSACTIONS: '/api/admin/dashboard/transactions',
    DASHBOARD_NOTIFICATIONS: '/api/admin/dashboard/notifications',
    OPERATIONS_ACTIVITY: '/api/admin/operations/activity',
    OPERATIONS_ACTIVITY_DETAIL: (id) => `/api/admin/operations/activity/${id}`,
    OPERATIONS_STATS: '/api/admin/operations/stats',
    SUPPORT_CASES: '/api/admin/support/cases',
    SUPPORT_CASE_DETAIL: (id) => `/api/admin/support/cases/${id}`,
    /** Aggregated marketplace / training revenue, fees, and payouts */
    REVENUE: '/api/admin/revenue',
    RECRUITERS: '/api/admin/recruiters',
    RECRUITERS_STATS: '/api/admin/recruiters/stats',
    RECRUITER_DETAIL: (id) => `/api/admin/recruiters/${id}`,
    ACCOUNT_DETAIL: (id) => `/api/admin/accounts/${id}`,
    /** Login/account status for both recruiters and training agents (same route). */
    UPDATE_RECRUITER_STATUS: (id) => `/api/admin/recruiters/${id}/status`,
    TRAINERS: '/api/admin/trainers',
    TRAINER_DETAIL: (id) => `/api/admin/trainers/${id}`,
    UPDATE_TRAINER_STATUS: (id) => `/api/admin/trainers/${id}/status`,
    TRAINER_PAYOUT_STATS: '/api/admin/trainers/payout-stats',
    INITIATE_TRAINER_STRIPE: (id) => `/api/admin/trainers/${id}/initiate-stripe`,
    PROFESSIONALS: '/api/admin/professionals',
    PROFESSIONALS_STATS: '/api/admin/professionals/stats',
    KYC_SUBMISSIONS: '/api/admin/kyc-submissions',
    KYC_SUBMISSION_DETAIL: (id) => `/api/admin/kyc-submissions/${id}`,
    KYC_UPDATE_STATUS: (id) => `/api/admin/kyc/${id}/status`,
    KYC_ADD_NOTE: (id) => `/api/admin/kyc-submissions/${id}/notes`,
    KYC_STATS: '/api/admin/kyc/stats',
    KYC_PENDING: '/api/admin/kyc/pending',
    PROFESSIONAL_KYC_PENDING: '/api/admin/professional-kyc/pending',
    PROFESSIONAL_KYC_UPDATE_STATUS: (id) => `/api/admin/professional-kyc/${id}/status`,
    MARKETPLACE_STATS: '/api/admin/marketplace/stats',
    MARKETPLACE_OVERSIGHT: '/api/admin/marketplace/oversight',
    MARKETPLACE_LISTINGS: '/api/admin/marketplace/listings',
    ADMIN_JOBS: '/api/admin/jobs',
    ADMIN_JOB_DETAIL: (id) => `/api/admin/jobs/${id}`,
    ADMIN_COURSES: '/api/admin/courses',
    /** All bookings for a course (attendees / payment summary) — SUPER_ADMIN */
    COURSE_BOOKINGS: (courseId) => `/api/admin/courses/${courseId}/bookings`,
    /** Full course booking (documents, resume snapshot) — align with backend route. */
    BOOKING_DETAIL: (bookingId) => `/api/admin/bookings/${bookingId}`,
    APPLICANT_DETAILS: (id) => `/api/admin/applicants/${id}`,
    PROFESSIONAL_DETAIL: (id) => `/api/admin/professionals/${id}`,
    UPDATE_APPLICANT_STATUS: (id) => `/api/admin/applicants/${id}/status`,
    /** All organizations (recruitment & training agents) — SUPER_ADMIN */
    COMPANIES: '/api/admin/companies',
    COMPANY_DETAIL: (id) => `/api/admin/companies/${id}`,
    COMPANY_MEMBER: (companyId, recruiterId) =>
      `/api/admin/companies/${companyId}/members/${recruiterId}`,
  },
  /** Conversations — recruiter, training agent, super admin start/create thread with a professional */
  CONVERSATIONS: {
    LIST: '/api/conversations',
    CREATE: '/api/conversations',
    SUPPORT_BOOTSTRAP: '/api/conversations/support/bootstrap',
    MESSAGES: (conversationId) => `/api/conversations/${conversationId}/messages`,
    MARK_READ: (conversationId) => `/api/conversations/${conversationId}/read`,
  },
  // Courses Endpoints
  COURSES: {
    CREATE: '/api/courses',
    LIST: '/api/courses',
    PROFESSIONAL_ALL: '/api/professional/courses',
    PROFESSIONAL_SESSIONS: (courseId) => `/api/professional/courses/${courseId}/sessions`,
    PROFESSIONAL_CHECKOUT: '/api/professional/course-bookings/checkout',
    PROFESSIONAL_CONFIRM_BOOKING: (bookingId) =>
      `/api/professional/course-bookings/${bookingId}/confirm`,
    PROFESSIONAL_BOOKING: (bookingId) => `/api/professional/bookings/${bookingId}`,
    PROFESSIONAL_BOOKINGS: '/api/professional/bookings',
    PROFESSIONAL_SAVED_COURSES: '/api/professional/saved-courses',
    PROFESSIONAL_TOGGLE_SAVE: (courseId) => `/api/professional/courses/${courseId}/toggle-save`,
    DRAFTS: '/api/courses/drafts',
    PUBLISH: (courseId) => `/api/courses/${courseId}/publish`,
    UNPUBLISH: (courseId) => `/api/courses/${courseId}/unpublish`,
    CREATE_SESSION: (courseId) => `/api/courses/${courseId}/sessions`,
    GET_SESSIONS: (courseId) => `/api/courses/${courseId}/sessions`,
    GET_SESSION_BY_ID: (sessionId) => `/api/courses/sessions/${sessionId}`,
    UPDATE_SESSION: (sessionId) => `/api/courses/sessions/${sessionId}`,
    DELETE_SESSION: (sessionId) => `/api/courses/sessions/${sessionId}`,
    MY: '/api/courses/my',
    GET_BY_ID: (id) => `/api/courses/${id}`,
    UPDATE: (id) => `/api/courses/${id}`,
    DELETE: (id) => `/api/courses/${id}`,
  },
};

export default API_CONFIG;
