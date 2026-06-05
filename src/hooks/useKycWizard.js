import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import kycService from '../services/kycService';
import resolveKycEntityId from '../utils/resolveKycEntityId';
import {
  readUserProfile,
  hasSubmittedKyc,
  hasStage2KycAccess,
  getEffectiveKycStatus,
  persistKycSubmittedToProfile,
  shouldPromptVerifyIdentity,
  syncStage2KycFlags,
} from '../utils/kycStatus';
import { refreshKycProfileFromApi } from '../utils/kycProfileRefresh';

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

  const hasStage2Access = useMemo(() => hasStage2KycAccess(userProfile), [userProfile]);

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

  const isKycUnderReview = hasKycSubmitted && !hasStage2Access;
  const hasFullAccess = hasStage2Access;

  const shouldShowKycWizard = !hasStage2Access && !hasKycSubmitted && !sessionSkipped;

  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [kycRequiredActionLabel, setKycRequiredActionLabel] = useState('');

  useEffect(() => {
    if (!profileHydrated) return;

    const shouldShow = shouldPromptVerifyIdentity({
      isAdminVerified: hasStage2Access,
      sessionSkipped,
      profile: userProfile,
      localKycStatus: kycStatus,
    });

    setShowVerifyIdentityModal(shouldShow);
  }, [profileHydrated, hasStage2Access, sessionSkipped, userProfile, kycStatus]);

  useEffect(() => {
    syncStage2KycFlags(userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (!profileHydrated || hasStage2Access) return undefined;

    const pollMs = hasKycSubmitted ? 30000 : 60000;
    const tick = async () => {
      const updated = await refreshKycProfileFromApi(userType);
      if (updated) refreshUserProfile();
    };

    const interval = setInterval(tick, pollMs);
    return () => clearInterval(interval);
  }, [profileHydrated, hasStage2Access, hasKycSubmitted, userType, refreshUserProfile]);

  const [showSelectDocumentModal, setShowSelectDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showVerifyDetailsModal, setShowVerifyDetailsModal] = useState(false);
  const [showTakeSelfieModal, setShowTakeSelfieModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showVerificationSubmittedModal, setShowVerificationSubmittedModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [isSubmittingSelfie, setIsSubmittingSelfie] = useState(false);
  const detailsSubmitInFlightRef = useRef(false);
  const selfieSubmitInFlightRef = useRef(false);

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
    if (detailsSubmitInFlightRef.current) return;

    const entityId = resolveEntityId();

    if (!entityId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    detailsSubmitInFlightRef.current = true;
    setIsSubmittingDetails(true);

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
      const message =
        err?.message ||
        err?.data?.message ||
        'Failed to confirm details. Please try again.';
      alert(message);
    } finally {
      detailsSubmitInFlightRef.current = false;
      setIsSubmittingDetails(false);
    }
  };

  const handleSelfieTaken = async (selfieFile) => {
    if (selfieSubmitInFlightRef.current) return;

    const entityId = resolveEntityId();

    if (!entityId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    selfieSubmitInFlightRef.current = true;
    setIsSubmittingSelfie(true);

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
      const message =
        err?.message ||
        err?.data?.message ||
        'Failed to upload selfie. Please try again.';
      alert(message);
      setShowProcessingModal(false);
      setShowTakeSelfieModal(true);
      return;
    } finally {
      selfieSubmitInFlightRef.current = false;
      setIsSubmittingSelfie(false);
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

  const guardRestrictedAction = useCallback(
    (actionLabel, callback) => {
      if (hasStage2Access) {
        callback?.();
        return true;
      }

      setKycRequiredActionLabel(actionLabel || '');
      setShowKycRequiredModal(true);
      return false;
    },
    [hasStage2Access]
  );

  const handleKycRequiredStart = () => {
    setShowKycRequiredModal(false);
    handleStartVerification();
  };

  return {
    userType,
    kycStatus,
    hasKycSubmitted,
    shouldShowKycWizard,
    isKycUnderReview,
    hasFullAccess,
    hasStage2Access,
    guardRestrictedAction,
    ui: {
      showVerifyIdentityModal,
      showSelectDocumentModal,
      showUploadDocumentModal,
      showVerifyDetailsModal,
      showTakeSelfieModal,
      showProcessingModal,
      showVerificationSubmittedModal,
      showKycRequiredModal,
      kycRequiredActionLabel,
      selectedDocumentType,
      kycData,
      isSubmittingDetails,
      isSubmittingSelfie,
    },
    actions: {
      handleStartVerification,
      handleSelectDocument,
      handleDocumentUploaded,
      handleDetailsVerified,
      handleSelfieTaken,
      handleVerificationComplete,
      handleSkipVerification,
      handleKycRequiredStart,
      setShowVerifyIdentityModal,
      setShowSelectDocumentModal,
      setShowUploadDocumentModal,
      setShowVerifyDetailsModal,
      setShowTakeSelfieModal,
      setShowProcessingModal,
      setShowVerificationSubmittedModal,
      setShowKycRequiredModal,
    },
  };
}
