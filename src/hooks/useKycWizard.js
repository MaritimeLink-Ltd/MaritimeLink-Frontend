import { useState, useMemo } from 'react';
import kycService from '../services/kycService';

const DEFAULT_PROFESSIONAL_ID_KEYS = [
  'professionalId',
  'professional_id',
  'userId',
  'user_id',
  'id',
];

const DEFAULT_RECRUITER_ID_KEYS = [
  'recruiterId',
  'recruiter_id',
  'userId',
  'user_id',
  'id',
];

const DEFAULT_TRAINING_PROVIDER_ID_KEYS = [
  'trainingProviderId',
  'training_provider_id',
  'userId',
  'user_id',
  'id',
];

function resolveIdFromLocalStorage(candidateKeys) {
  for (const key of candidateKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export function useKycWizard({ userType, storagePrefix }) {
  const statusKey = `${storagePrefix}KycStatus`;
  const adminVerifiedKey = `${storagePrefix}AdminVerified`;

  const initialStatus = typeof window !== 'undefined' ? localStorage.getItem(statusKey) : null;
  const [kycStatus, setKycStatus] = useState(initialStatus);

  const isAdminVerified = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(adminVerifiedKey) === 'true';
  }, [adminVerifiedKey]);

  const shouldShowKycWizard = !kycStatus || kycStatus === 'pending' || kycStatus === 'rejected';
  const isKycUnderReview = kycStatus === 'completed' && !isAdminVerified;
  const hasFullAccess = isAdminVerified;

  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(shouldShowKycWizard);
  const [showSelectDocumentModal, setShowSelectDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showVerifyDetailsModal, setShowVerifyDetailsModal] = useState(false);
  const [showTakeSelfieModal, setShowTakeSelfieModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showVerificationSubmittedModal, setShowVerificationSubmittedModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [kycData, setKycData] = useState(null);

  const resolveEntityId = () => {
    switch (userType) {
      case 'recruiter':
        return resolveIdFromLocalStorage(DEFAULT_RECRUITER_ID_KEYS);
      case 'training-provider':
        return resolveIdFromLocalStorage(DEFAULT_TRAINING_PROVIDER_ID_KEYS);
      case 'professional':
      default:
        return resolveIdFromLocalStorage(DEFAULT_PROFESSIONAL_ID_KEYS);
    }
  };

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

      if (userType === 'recruiter') {
        await kycService.submitRecruiterKycDetails({
          ...basePayload,
          recruiterId: entityId,
        });
      } else if (userType === 'training-provider') {
        await kycService.submitTrainingProviderKycDetails({
          ...basePayload,
          trainingProviderId: entityId,
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

    setTimeout(() => {
      setShowProcessingModal(false);
      setShowVerificationSubmittedModal(true);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(statusKey, 'completed');
    }
    setKycStatus('completed');
    setShowVerificationSubmittedModal(false);
  };

  const handleSkipVerification = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(statusKey, 'skipped');
    }
    setKycStatus('skipped');
    setShowVerifyIdentityModal(false);
  };

  return {
    kycStatus,
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
      setShowVerificationSubmittedModal,
    },
  };
}

