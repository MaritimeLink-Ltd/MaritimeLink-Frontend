import authService from '../services/authService';
import recruiterSettingsService from '../services/recruiterSettingsService';
import trainerSettingsService from '../services/trainerSettingsService';
import {
  mergeAuthUserProfile,
  notifyKycProfileUpdated,
  readUserProfile,
  syncKycSubmittedFlag,
  syncStage2KycFlags,
} from './kycStatus';

function persistProfile(incoming) {
  if (typeof window === 'undefined' || !incoming) return false;

  const merged = mergeAuthUserProfile({ ...readUserProfile(), ...incoming });
  localStorage.setItem('userProfile', JSON.stringify(merged));
  syncKycSubmittedFlag(merged);
  syncStage2KycFlags(merged);
  return true;
}

function extractProfileFromResponse(response, userType) {
  const data = response?.data ?? response ?? {};

  if (userType === 'professional') {
    const profile = data.professional || data.user || data;
    if (profile && (data.kyc || data.kycSubmitted != null)) {
      return {
        ...profile,
        kyc: data.kyc ?? profile.kyc,
        kycSubmitted: data.kycSubmitted ?? profile.kycSubmitted,
      };
    }
    return profile;
  }

  if (userType === 'recruiter' || userType === 'training-provider') {
    const recruiter = data.recruiter || data.trainingProvider || data.trainer;
    const kyc = data.kyc ?? recruiter?.kyc;
    const kycSubmitted = data.kycSubmitted ?? recruiter?.kycSubmitted;

    if (recruiter) {
      return { ...recruiter, kyc, kycSubmitted };
    }

    if (kyc || data.kycSubmitted != null) {
      return {
        ...(data.profile && typeof data.profile === 'object' ? data.profile : {}),
        kyc,
        kycSubmitted,
      };
    }

    return data.profile || data;
  }

  return data.trainingProvider || data.trainer || data.profile || data;
}

/**
 * Fetch the latest account profile and merge it into local storage.
 * @param {'professional'|'recruiter'|'training-provider'} userType
 * @returns {Promise<boolean>} true when profile was updated
 */
export async function refreshKycProfileFromApi(userType) {
  if (typeof window === 'undefined') return false;

  try {
    let response;

    if (userType === 'professional') {
      response = await authService.getMyAccount();
    } else if (userType === 'recruiter') {
      response = await recruiterSettingsService.getSettings();
    } else if (userType === 'training-provider') {
      response = await trainerSettingsService.getSettings();
    } else {
      return false;
    }

    const incoming = extractProfileFromResponse(response, userType);
    if (!incoming || typeof incoming !== 'object') return false;

    return persistProfile(incoming);
  } catch {
    return false;
  }
}

export function dispatchKycProfileRefresh() {
  notifyKycProfileUpdated();
}
