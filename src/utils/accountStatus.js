import { readUserProfile, hasSubmittedKyc } from './kycStatus';

const APPROVED_ACCOUNT_STATUSES = new Set(['VERIFIED', 'APPROVED', 'ACTIVE']);

export function normalizeAccountStatus(status) {
  if (status == null || status === '') return '';
  return String(status).trim().toUpperCase();
}

/**
 * Stage 1 account review is still pending (profile/documents under admin review).
 */
export function isAccountPendingReview(profile = readUserProfile()) {
  const status = normalizeAccountStatus(profile?.status);
  if (!status) return false;
  return status === 'PENDING';
}

/**
 * Locked welcome screen on the dashboard home while Stage 1 review is pending and
 * identity verification (KYC) has not been submitted yet. Used for recruiter/trainer flows.
 */
export function shouldShowAccountPendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile) && !hasSubmittedKyc(profile);
}

/**
 * Professional dashboard home — blocked until Stage 1 account `status` is VERIFIED,
 * even when KYC has already been submitted.
 */
export function shouldShowProfessionalStage1PendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

/**
 * Routes reachable while Stage 1 account review is pending (`status` === PENDING).
 */
export const PROFESSIONAL_LIMITED_ACCESS_PATH_PREFIXES = [
  '/personal/dashboard',
  '/personal/resume',
  '/personal/documents',
  '/personal/profile',
];

/** @deprecated Use PROFESSIONAL_LIMITED_ACCESS_PATH_PREFIXES */
export const STAGE1_PENDING_ALLOWED_PATH_PREFIXES = PROFESSIONAL_LIMITED_ACCESS_PATH_PREFIXES;

export function isPathAllowedDuringLimitedAccess(pathname) {
  if (!pathname) return false;
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  return PROFESSIONAL_LIMITED_ACCESS_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** @deprecated Use isPathAllowedDuringLimitedAccess */
export function isPathAllowedDuringStage1Pending(pathname) {
  return isPathAllowedDuringLimitedAccess(pathname);
}

/**
 * Restrict sidebar/routes for professionals during Stage 1 review only.
 * After Stage 1 approval, all tabs are enabled; individual actions use KYC guards.
 */
export function isProfessionalNavigationRestricted(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

/**
 * Stage 1 account approved — user may browse the full dashboard UI.
 */
export function isAccountStage1Approved(profile = readUserProfile()) {
  const status = normalizeAccountStatus(profile?.status);
  if (!status) return true;
  return APPROVED_ACCOUNT_STATUSES.has(status);
}
