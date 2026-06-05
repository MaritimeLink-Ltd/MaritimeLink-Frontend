import authService from '../services/authService';
import recruiterSettingsService from '../services/recruiterSettingsService';
import trainerSettingsService from '../services/trainerSettingsService';
import {
  mergeAuthUserProfile,
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
    return data.professional || data.user || data;
  }

  if (userType === 'recruiter') {
    return data.recruiter || data.profile || data;
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
