import { readUserProfile, hasSubmittedKyc, hasStage2KycAccess, isKycUnderReview } from './kycStatus';

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
 * @deprecated Prefer shouldShowDashboardWelcome for dashboard home gating.
 */
export function shouldShowProfessionalStage1PendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

/** @deprecated Prefer shouldShowDashboardWelcome */
export function shouldShowRecruiterStage1PendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

/** @deprecated Prefer shouldShowDashboardWelcome */
export function shouldShowTrainingProviderStage1PendingWelcome(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

/**
 * Dashboard home welcome screen — shown until Stage 2 (KYC) is approved.
 * After Stage 1 approval, all nav tabs are enabled; actions remain KYC-guarded.
 */
export function shouldShowDashboardWelcome(profile = readUserProfile()) {
  return !hasStage2KycAccess(profile);
}

const DASHBOARD_WELCOME_STAGE1_HINTS = {
  professional:
    'While your account is under review, you can still update your Resume, Documents, and Profile from the menu.',
  recruiter:
    'While your account is under review, you can still open Profile Settings from the menu.',
  trainer: 'While your account is under review, you can still open Profile from the menu.',
};

/**
 * Copy for AccountPendingWelcome based on Stage 1 vs Stage 2 state.
 * @param {'professional'|'recruiter'|'trainer'} role
 */
export function getDashboardWelcomeMessages(profile = readUserProfile(), role = 'professional') {
  if (isAccountPendingReview(profile)) {
    return {
      reviewMessage: 'Your information and documents are currently under review by our team.',
      setupHint: DASHBOARD_WELCOME_STAGE1_HINTS[role] || DASHBOARD_WELCOME_STAGE1_HINTS.professional,
      showNoActionRequired: true,
    };
  }

  if (isKycUnderReview(profile)) {
    return {
      reviewMessage: 'Your identity verification is currently under review by our team.',
      setupHint:
        'You can browse all sections from the menu. Actions unlock once your verification is approved.',
      showNoActionRequired: true,
    };
  }

  return {
    reviewMessage: 'Complete identity verification to unlock full platform access.',
    setupHint: 'You can browse all sections from the menu while you complete verification.',
    showNoActionRequired: false,
  };
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

export const RECRUITER_LIMITED_ACCESS_PATH_PREFIXES = [
  '/recruiter-dashboard',
  '/recruiter/settings',
  '/admin/settings',
];

export const TRAINING_PROVIDER_LIMITED_ACCESS_PATH_PREFIXES = [
  '/trainingprovider-dashboard',
  '/trainingprovider/profile',
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

function isPathAllowedDuringPrefixes(pathname, prefixes) {
  if (!pathname) return false;
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isPathAllowedDuringRecruiterLimitedAccess(pathname) {
  return isPathAllowedDuringPrefixes(pathname, RECRUITER_LIMITED_ACCESS_PATH_PREFIXES);
}

export function isPathAllowedDuringTrainingProviderLimitedAccess(pathname) {
  return isPathAllowedDuringPrefixes(pathname, TRAINING_PROVIDER_LIMITED_ACCESS_PATH_PREFIXES);
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

export function isRecruiterNavigationRestricted(profile = readUserProfile()) {
  return isAccountPendingReview(profile);
}

export function isTrainingProviderNavigationRestricted(profile = readUserProfile()) {
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
