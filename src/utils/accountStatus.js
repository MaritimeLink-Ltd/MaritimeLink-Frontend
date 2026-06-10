import { readUserProfile, hasSubmittedKyc, isKycUnderReview } from './kycStatus';

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
 * identity verification (KYC) has not been submitted yet.
 */
export function shouldShowAccountPendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile) && !hasSubmittedKyc(profile);
}

/**
 * Routes reachable while navigation is limited (Stage 1 pending or KYC under review).
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
 * Restrict sidebar/routes for professionals during Stage 1 review or while KYC is pending approval.
 */
export function isProfessionalNavigationRestricted(profile = readUserProfile()) {
  if (isAccountPendingReview(profile)) return true;
  if (isAccountStage1Approved(profile) && isKycUnderReview(profile)) return true;
  return false;
}

/**
 * Stage 1 account approved — user may browse the full dashboard UI.
 */
export function isAccountStage1Approved(profile = readUserProfile()) {
  const status = normalizeAccountStatus(profile?.status);
  if (!status) return true;
  return APPROVED_ACCOUNT_STATUSES.has(status);
}
