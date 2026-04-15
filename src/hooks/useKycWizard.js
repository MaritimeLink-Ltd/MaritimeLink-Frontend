import { useState, useMemo } from 'react';
import kycService from '../services/kycService';
import resolveKycEntityId from '../utils/resolveKycEntityId';

export function useKycWizard({ userType, storagePrefix }) {
  const userProfile = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('userProfile')) || {};
    } catch {
      return {};
    }
  }, []);

  const isAdminVerified = useMemo(() => {
    const profileStatus = userProfile.status?.toUpperCase();
    return profileStatus === 'APPROVED' || profileStatus === 'VERIFIED' || profileStatus === 'ACTIVE';
  }, [userProfile]);

  const backendKycStatus = userProfile.kycStatus || userProfile.kyc_status;

  const [sessionSkipped, setSessionSkipped] = useState(false);
  const [kycStatus, setKycStatus] = useState(backendKycStatus || 'pending');

  const isKycUnderReview = kycStatus === 'completed' && !isAdminVerified;
  const hasFullAccess = isAdminVerified;

  const shouldShowKycWizard = !isAdminVerified && !sessionSkipped;

  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(!isAdminVerified);
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

      if (userType === 'recruiter') {
        await kycService.submitRecruiterKycDetails({
          ...basePayload,
          recruiterId: entityId,
        });
      } else if (userType === 'training-provider') {
        await kycService.submitTrainingProviderKycDetails({
          ...basePayload,
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

    setTimeout(() => {
      setShowProcessingModal(false);
      setShowVerificationSubmittedModal(true);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    setKycStatus('completed');
    setShowVerificationSubmittedModal(false);
  };

  const handleSkipVerification = () => {
    setSessionSkipped(true);
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
      setShowSelectDocumentModal,
      setShowUploadDocumentModal,
      setShowVerifyDetailsModal,
      setShowTakeSelfieModal,
      setShowProcessingModal,
      setShowVerificationSubmittedModal,
    },
  };
}

