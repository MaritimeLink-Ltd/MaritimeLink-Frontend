import { useState, useMemo, useEffect, useCallback } from 'react';
import kycService from '../services/kycService';
import resolveKycEntityId from '../utils/resolveKycEntityId';
import {
  readUserProfile,
  hasSubmittedKyc,
  isAdminVerifiedProfile,
  getEffectiveKycStatus,
  persistKycSubmittedToProfile,
  shouldPromptVerifyIdentity,
} from '../utils/kycStatus';

const COMPANY_VERIFICATION_STORAGE_KEY = 'companyVerificationDecision';

function getStoredCompanyVerificationDecision() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(COMPANY_VERIFICATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useKycWizard({ userType, storagePrefix }) {
  const [userProfile, setUserProfile] = useState(() => readUserProfile());
  const [profileHydrated, setProfileHydrated] = useState(false);

  const refreshUserProfile = useCallback(() => {
    setUserProfile(readUserProfile());
    setProfileHydrated(true);
  }, []);

  useEffect(() => {
    refreshUserProfile();

    const onStorage = () => refreshUserProfile();
    window.addEventListener('storage', onStorage);
    window.addEventListener('kycProfileUpdated', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('kycProfileUpdated', onStorage);
    };
  }, [refreshUserProfile]);

  const isAdminVerified = useMemo(() => isAdminVerifiedProfile(userProfile), [userProfile]);

  const backendKycStatus = userProfile.kycStatus || userProfile.kyc_status;
  const initialKycStatus = getEffectiveKycStatus(userProfile, backendKycStatus || 'pending');

  const [sessionSkipped, setSessionSkipped] = useState(false);
  const [kycStatus, setKycStatus] = useState(initialKycStatus);

  useEffect(() => {
    setKycStatus(getEffectiveKycStatus(userProfile, backendKycStatus || undefined));
  }, [userProfile, backendKycStatus]);

  const hasKycSubmitted = useMemo(
    () => hasSubmittedKyc(userProfile) || kycStatus === 'completed',
    [userProfile, kycStatus]
  );

  const isKycUnderReview = hasKycSubmitted && !isAdminVerified;
  const hasFullAccess = isAdminVerified;

  const shouldShowKycWizard = !isAdminVerified && !hasKycSubmitted && !sessionSkipped;

  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(false);

  useEffect(() => {
    if (!profileHydrated) return;

    const shouldShow = shouldPromptVerifyIdentity({
      isAdminVerified,
      sessionSkipped,
      profile: userProfile,
      localKycStatus: kycStatus,
    });

    setShowVerifyIdentityModal(shouldShow);
  }, [profileHydrated, isAdminVerified, sessionSkipped, userProfile, kycStatus]);

  const [showSelectDocumentModal, setShowSelectDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showVerifyDetailsModal, setShowVerifyDetailsModal] = useState(false);
  const [showTakeSelfieModal, setShowTakeSelfieModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showVerificationSubmittedModal, setShowVerificationSubmittedModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [kycData, setKycData] = useState(null);

  const resolveEntityId = () => resolveKycEntityId(userType);

  const handleStartVerification = () => {
    setShowVerifyIdentityModal(false);
    setShowSelectDocumentModal(true);
  };

  const handleSelectDocument = (docType) => {
    setSelectedDocumentType(docType);
    setShowSelectDocumentModal(false);
    setShowUploadDocumentModal(true);
  };

  const handleDocumentUploaded = (ocrPayload) => {
    setKycData(ocrPayload || null);
    setShowUploadDocumentModal(false);
    setShowVerifyDetailsModal(true);
  };

  const handleDetailsVerified = async (verifiedData) => {
    const entityId = resolveEntityId();

    if (!entityId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    try {
      const basePayload = {
        firstName: verifiedData.firstName,
        lastName: verifiedData.lastName,
        dateOfBirth: verifiedData.dateOfBirth,
        documentType: verifiedData.documentType,
        documentNumber: verifiedData.documentNumber,
        expiryDate: verifiedData.expiryDate,
        issueCountry: verifiedData.issuingCountry || verifiedData.issueCountry,
        documentUrl: kycData?.documentFrontUrl || '',
        documentFrontUrl: kycData?.documentFrontUrl || '',
        documentBackUrl: kycData?.documentBackUrl || '',
      };
      const companyVerificationDecision = getStoredCompanyVerificationDecision();
      const organizationVerificationPayload =
        userType === 'recruiter' || userType === 'training-provider'
          ? {
              organizationVerified:
                typeof companyVerificationDecision?.organizationVerified === 'boolean'
                  ? companyVerificationDecision.organizationVerified
                  : undefined,
              organizationRiskLevel: companyVerificationDecision?.riskLevel,
              organizationVerificationSource: companyVerificationDecision?.source,
            }
          : {};

      if (userType === 'recruiter') {
        await kycService.submitRecruiterKycDetails({
          ...basePayload,
          ...organizationVerificationPayload,
          recruiterId: entityId,
        });
      } else if (userType === 'training-provider') {
        await kycService.submitTrainingProviderKycDetails({
          ...basePayload,
          ...organizationVerificationPayload,
          recruiterId: entityId,
        });
      } else {
        await kycService.submitKycDetails({
          ...basePayload,
          professionalId: entityId,
        });
      }

      setShowVerifyDetailsModal(false);
      setShowTakeSelfieModal(true);
    } catch (err) {
      console.error('KYC Submit failed', err);
      alert('Failed to confirm details. Please try again.');
    }
  };

  const handleSelfieTaken = async (selfieFile) => {
    const entityId = resolveEntityId();

    if (!entityId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    setShowTakeSelfieModal(false);
    setShowProcessingModal(true);

    try {
      if (userType === 'recruiter') {
        await kycService.uploadRecruiterSelfie(entityId, selfieFile);
      } else if (userType === 'training-provider') {
        await kycService.uploadTrainingProviderSelfie(entityId, selfieFile);
      } else {
        await kycService.uploadSelfie(entityId, selfieFile);
      }
    } catch (err) {
      console.error('KYC Selfie upload failed', err);
      alert('Failed to upload selfie. Please try again.');
      setShowProcessingModal(false);
      return;
    }

    persistKycSubmittedToProfile();
    setKycStatus('completed');
    refreshUserProfile();

    setTimeout(() => {
      setShowProcessingModal(false);
      setShowVerificationSubmittedModal(true);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    persistKycSubmittedToProfile();
    setKycStatus('completed');
    refreshUserProfile();
    setShowVerificationSubmittedModal(false);
    setShowVerifyIdentityModal(false);
  };

  const handleSkipVerification = () => {
    setSessionSkipped(true);
    setShowVerifyIdentityModal(false);
  };

  return {
    kycStatus,
    hasKycSubmitted,
    shouldShowKycWizard,
    isKycUnderReview,
    hasFullAccess,
    ui: {
      showVerifyIdentityModal,
      showSelectDocumentModal,
      showUploadDocumentModal,
      showVerifyDetailsModal,
      showTakeSelfieModal,
      showProcessingModal,
      showVerificationSubmittedModal,
      selectedDocumentType,
      kycData,
    },
    actions: {
      handleStartVerification,
      handleSelectDocument,
      handleDocumentUploaded,
      handleDetailsVerified,
      handleSelfieTaken,
      handleVerificationComplete,
      handleSkipVerification,
      setShowVerifyIdentityModal,
      setShowSelectDocumentModal,
      setShowUploadDocumentModal,
      setShowVerifyDetailsModal,
      setShowTakeSelfieModal,
      setShowProcessingModal,
      setShowVerificationSubmittedModal,
    },
  };
}
