import VerifyIdentityModal from '../modals/VerifyIdentityModal';
import SelectDocumentModal from '../modals/SelectDocumentModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import VerifyDetailsModal from '../modals/VerifyDetailsModal';
import TakeSelfieModal from '../modals/TakeSelfieModal';
import ProcessingDocumentModal from '../modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../modals/VerificationSubmittedModal';
import KycRequiredModal from '../modals/KycRequiredModal';

export default function KycWizardModals({ wizard }) {
  const {
    ui: {
      showVerifyIdentityModal,
      showSelectDocumentModal,
      showUploadDocumentModal,
      showVerifyDetailsModal,
      showTakeSelfieModal,
      showProcessingModal,
      showVerificationSubmittedModal,
      showKycRequiredModal,
      selectedDocumentType,
      kycData,
      isSubmittingDetails,
      kycRequiredActionLabel,
    },
    isKycUnderReview,
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
      setShowKycRequiredModal,
      handleKycRequiredStart,
    },
    userType,
  } = wizard;

  const isLaterWizardStepOpen =
    showSelectDocumentModal ||
    showUploadDocumentModal ||
    showVerifyDetailsModal ||
    showTakeSelfieModal ||
    showProcessingModal ||
    showVerificationSubmittedModal;

  return (
    <>
      <VerifyIdentityModal
        isOpen={showVerifyIdentityModal && !isLaterWizardStepOpen}
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
        userType={userType}
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
      <KycRequiredModal
        isOpen={showKycRequiredModal}
        onClose={() => setShowKycRequiredModal(false)}
        actionLabel={kycRequiredActionLabel}
        isUnderReview={isKycUnderReview}
        onStartVerification={handleKycRequiredStart}
      />
    </>
  );
}
