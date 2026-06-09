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
 * Locked welcome screen: account still under Stage 1 review and KYC not yet submitted.
 * Once KYC is submitted, the user can browse the full UI while awaiting approval.
 */
export function shouldShowAccountPendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile) && !hasSubmittedKyc(profile);
}

/**
 * Stage 1 account approved — user may browse the full dashboard UI.
 */
export function isAccountStage1Approved(profile = readUserProfile()) {
  const status = normalizeAccountStatus(profile?.status);
  if (!status) return true;
  return APPROVED_ACCOUNT_STATUSES.has(status);
}
