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
 * identity verification (KYC) has not been submitted yet.
 */
export function shouldShowAccountPendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile) && !hasSubmittedKyc(profile);
}

/**
 * Routes reachable while Stage 1 account review is pending (`status` !== VERIFIED).
 * Lets professionals prepare resume, documents, and profile settings during review.
 */
export const STAGE1_PENDING_ALLOWED_PATH_PREFIXES = [
  '/personal/dashboard',
  '/personal/resume',
  '/personal/documents',
  '/personal/profile',
];

export function isPathAllowedDuringStage1Pending(pathname) {
  if (!pathname) return false;
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  return STAGE1_PENDING_ALLOWED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Stage 1 account approved — user may browse the full dashboard UI.
 */
export function isAccountStage1Approved(profile = readUserProfile()) {
  const status = normalizeAccountStatus(profile?.status);
  if (!status) return true;
  return APPROVED_ACCOUNT_STATUSES.has(status);
}
