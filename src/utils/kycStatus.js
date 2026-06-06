/**
 * KYC submission detection for dashboard identity-verification prompts.
 */

const PRE_KYC_STATUSES = new Set(['rejected', 'skipped', 'not_started', '']);

/** Statuses that mean the user finished the submission flow (may still await admin review). */
const POST_SUBMIT_KYC_STATUSES = new Set([
  'pending',
  'submitted',
  'completed',
  'approved',
  'verified',
  'active',
  'under_review',
]);

export function readUserProfile() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('userProfile')) || {};
  } catch {
    return {};
  }
}

export function hasKycDocuments(kyc) {
  if (!kyc || typeof kyc !== 'object') return false;
  return Boolean(
    kyc.documentFrontUrl ||
      kyc.documentUrl ||
      kyc.documentBackUrl ||
      kyc.selfieUrl ||
      (kyc.documentNumber && String(kyc.documentNumber).trim())
  );
}

export function normalizeKycStatus(status) {
  if (status == null || status === '') return '';
  return String(status).trim().toLowerCase().replace(/\s+/g, '_');
}

function hasPersistedKycRecord(kyc) {
  if (!kyc || typeof kyc !== 'object') return false;
  if (hasKycDocuments(kyc)) return true;

  const status = normalizeKycStatus(kyc.status);
  if (status && POST_SUBMIT_KYC_STATUSES.has(status)) {
    return Boolean(kyc.documentNumber || kyc.selfieUrl || kyc.id);
  }

  return false;
}

/**
 * True when the user has already completed the KYC submission flow (awaiting or past admin review).
 * @param {Object} [profile]
 * @returns {boolean}
 */
export function hasSubmittedKyc(profile = readUserProfile()) {
  if (!profile || typeof profile !== 'object') {
    return typeof window !== 'undefined' && localStorage.getItem('kycSubmitted') === 'true';
  }

  if (profile.kycSubmitted === true || profile.hasSubmittedKyc === true) {
    return true;
  }

  if (hasPersistedKycRecord(profile.kyc)) {
    return true;
  }

  if (hasKycDocuments(profile.kyc)) {
    return true;
  }

  const status = normalizeKycStatus(profile.kycStatus ?? profile.kyc_status);
  const nestedStatus = normalizeKycStatus(profile.kyc?.status);

  if (status === 'completed' || status === 'submitted') {
    return true;
  }

  if (nestedStatus && POST_SUBMIT_KYC_STATUSES.has(nestedStatus)) {
    return true;
  }

  if (nestedStatus && !PRE_KYC_STATUSES.has(nestedStatus)) {
    return true;
  }

  if (typeof window !== 'undefined' && localStorage.getItem('kycSubmitted') === 'true') {
    return true;
  }

  return false;
}

/**
 * Stage 2 KYC complete: identity verified and admin has issued the verified badge.
 * @param {Object} [profile]
 * @returns {boolean}
 */
export function hasStage2KycAccess(profile = readUserProfile()) {
  if (!profile || typeof profile !== 'object') return false;

  const kycStatus = normalizeKycStatus(
    profile.kyc?.status ?? profile.kycStatus ?? profile.kyc_status,
  );

  if (kycStatus === 'rejected') return false;

  if (kycStatus === 'approved' || kycStatus === 'verified') {
    return true;
  }

  if (profile.isVerified === true) {
    return true;
  }

  return false;
}

/** @deprecated Use hasStage2KycAccess — kept for existing imports. */
export function isAdminVerifiedProfile(profile = readUserProfile()) {
  return hasStage2KycAccess(profile);
}

/**
 * Persist Stage 2 verification flags used by legacy layout checks.
 * Stage 1 account-approval flags (recruiterAdminVerified, etc.) are unchanged.
 * @param {Object} [profile]
 */
export function syncStage2KycFlags(profile = readUserProfile()) {
  if (typeof window === 'undefined') return;

  const hasAccess = hasStage2KycAccess(profile);
  const userType = localStorage.getItem('userType') || localStorage.getItem('adminUserType') || '';

  if (userType === 'professional') {
    localStorage.setItem('adminVerified', hasAccess ? 'true' : 'false');
    if (hasAccess) {
      localStorage.setItem('professionalVerificationStatus', 'VERIFIED');
    }
  }

  notifyKycProfileUpdated();
}

/**
 * @param {Object} [profile]
 * @param {string} [localStatus]
 * @returns {string}
 */
export function getEffectiveKycStatus(profile = readUserProfile(), localStatus) {
  if (localStatus === 'completed') return 'completed';
  if (hasSubmittedKyc(profile)) return 'completed';

  const fromProfile = normalizeKycStatus(profile?.kycStatus ?? profile?.kyc_status);
  if (fromProfile && !PRE_KYC_STATUSES.has(fromProfile)) return fromProfile;

  const nested = normalizeKycStatus(profile?.kyc?.status);
  if (nested && !PRE_KYC_STATUSES.has(nested)) return nested;

  return localStatus || 'pending';
}

export function notifyKycProfileUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('kycProfileUpdated'));
}

/**
 * Merge login/API profile with stored KYC so re-login does not wipe submission state.
 * @param {Object} incoming
 * @returns {Object}
 */
export function mergeAuthUserProfile(incoming = {}) {
  const existing = readUserProfile();
  const merged = {
    ...existing,
    ...incoming,
    kyc: incoming?.kyc ?? existing?.kyc,
    kycStatus: incoming?.kyc?.status ?? incoming?.kycStatus ?? existing?.kycStatus,
    kyc_status: incoming?.kyc?.status ?? incoming?.kyc_status ?? existing?.kyc_status,
  };

  if (incoming?.kycSubmitted === true || hasSubmittedKyc(merged)) {
    merged.kycSubmitted = true;
    merged.hasSubmittedKyc = true;
  }

  return merged;
}

export function syncKycSubmittedFlag(profile = readUserProfile(), { clearIfMissing = false } = {}) {
  if (typeof window === 'undefined') return;

  if (hasSubmittedKyc(profile)) {
    localStorage.setItem('kycSubmitted', 'true');
    notifyKycProfileUpdated();
  } else if (clearIfMissing) {
    localStorage.removeItem('kycSubmitted');
    notifyKycProfileUpdated();
  }
}

export function persistKycSubmittedToProfile() {
  if (typeof window === 'undefined') return;

  localStorage.setItem('kycSubmitted', 'true');

  try {
    const profile = readUserProfile();
    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        ...profile,
        kycSubmitted: true,
        hasSubmittedKyc: true,
        kycStatus: 'completed',
        kyc_status: 'completed',
        kyc: {
          ...(profile.kyc && typeof profile.kyc === 'object' ? profile.kyc : {}),
          status: profile.kyc?.status || 'PENDING',
        },
      })
    );
    notifyKycProfileUpdated();
  } catch {
    // ignore storage errors
  }
}

/**
 * @param {{ isAdminVerified?: boolean, sessionSkipped?: boolean, profile?: Object, localKycStatus?: string }} options
 * @returns {boolean}
 */
export function shouldPromptVerifyIdentity({
  isAdminVerified = false,
  sessionSkipped = false,
  profile = readUserProfile(),
  localKycStatus,
} = {}) {
  if (isAdminVerified || sessionSkipped) return false;
  if (localKycStatus === 'completed') return false;
  return !hasSubmittedKyc(profile);
}
