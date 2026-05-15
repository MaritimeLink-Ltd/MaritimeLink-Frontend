/**
 * KYC submission detection for dashboard identity-verification prompts.
 */

const PRE_KYC_STATUSES = new Set(['pending', 'rejected', 'skipped', 'not_started', '']);

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

  if (hasKycDocuments(profile.kyc)) {
    return true;
  }

  const status = normalizeKycStatus(profile.kycStatus ?? profile.kyc_status);
  const nestedStatus = normalizeKycStatus(profile.kyc?.status);

  if (status === 'completed' || status === 'submitted') {
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

export function isAdminVerifiedProfile(profile = readUserProfile()) {
  const profileStatus = profile?.status?.toUpperCase();
  return profileStatus === 'APPROVED' || profileStatus === 'VERIFIED' || profileStatus === 'ACTIVE';
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

export function syncKycSubmittedFlag(profile = readUserProfile()) {
  if (typeof window === 'undefined') return;
  if (hasSubmittedKyc(profile)) {
    localStorage.setItem('kycSubmitted', 'true');
  } else {
    localStorage.removeItem('kycSubmitted');
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
        kycStatus: 'completed',
        kyc_status: 'completed',
      })
    );
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
