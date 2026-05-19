import Dashboard from './dashboard-sections/Dashboard';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import { useKycWizard } from '../../../hooks/useKycWizard';
import { AlertTriangle } from 'lucide-react';

const PersonalDashboard = () => {
  const {
    hasFullAccess: isVerifiedByAdmin,
    isKycUnderReview,
    hasKycSubmitted,
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
      isSubmittingDetails,
    },
    actions: {
      handleStartVerification,
      handleSelectDocument,
      handleDocumentUploaded,
      handleDetailsVerified,
      handleSelfieTaken,
      handleVerificationComplete,
      handleSkipVerification,
      setShowSelectDocumentModal,
      setShowUploadDocumentModal,
      setShowVerifyDetailsModal,
      setShowTakeSelfieModal,
    },
  } = useKycWizard({ userType: 'professional', storagePrefix: 'professional' });

  return (
    <div className="min-h-screen bg-white">
      {isVerifiedByAdmin ? (
        <Dashboard />
      ) : (
        <div className="h-full flex items-center justify-center p-6 min-h-[calc(100vh-100px)]">
          <div className="max-w-lg text-center space-y-4">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} className="text-amber-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#003971]">
              {isKycUnderReview || hasKycSubmitted
                ? 'Account Under Review'
                : 'Verify Your Identity'}
            </h1>
            <p className="text-gray-600">
              {isKycUnderReview || hasKycSubmitted
                ? 'Your account is currently being reviewed by our admin team.'
                : 'Complete identity verification to unlock full access to MaritimeLink.'}
            </p>
            <p className="text-gray-500 text-sm">
              {isKycUnderReview || hasKycSubmitted ? (
                <>
                  Once your KYC verification is approved, you will have full access to Jobs, Training, Chats,
                  and Profile. In the meantime, you can update your <strong>Resume</strong> and{' '}
                  <strong>Documents</strong>.
                </>
              ) : (
                <>
                  To protect professionals from scams and keep MaritimeLink trusted, we need to verify your
                  identity before you continue.
                </>
              )}
            </p>
            {!hasKycSubmitted && !isKycUnderReview ? (
              <button
                type="button"
                onClick={handleStartVerification}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002855] transition-colors"
              >
                Start verification
              </button>
            ) : null}
          </div>
        </div>
      )}

      <VerifyIdentityModal
        isOpen={showVerifyIdentityModal}
        onClose={handleSkipVerification}
        onStartVerification={handleStartVerification}
      />
      <SelectDocumentModal
        isOpen={showSelectDocumentModal}
        onClose={() => setShowSelectDocumentModal(false)}
        onSelectDocument={handleSelectDocument}
      />
      <UploadDocumentModal
        isOpen={showUploadDocumentModal}
        onClose={() => setShowUploadDocumentModal(false)}
        onUploadComplete={handleDocumentUploaded}
        documentType={selectedDocumentType}
        userType="professional"
      />
      <VerifyDetailsModal
        isOpen={showVerifyDetailsModal}
        onClose={() => setShowVerifyDetailsModal(false)}
        onConfirm={handleDetailsVerified}
        isSubmitting={isSubmittingDetails}
        initialData={kycData}
        documentType={selectedDocumentType}
      />
      <TakeSelfieModal
        isOpen={showTakeSelfieModal}
        onClose={() => setShowTakeSelfieModal(false)}
        onSelfieTaken={handleSelfieTaken}
      />
      <ProcessingDocumentModal isOpen={showProcessingModal} />
      <VerificationSubmittedModal
        isOpen={showVerificationSubmittedModal}
        onClose={handleVerificationComplete}
      />
    </div>
  );
};

export default PersonalDashboard;
