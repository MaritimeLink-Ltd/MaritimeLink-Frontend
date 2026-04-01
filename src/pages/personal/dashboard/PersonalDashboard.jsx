import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './dashboard-sections/Dashboard';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';
import SelectDocumentModal from '../../../components/modals/SelectDocumentModal';
import UploadDocumentModal from '../../../components/modals/UploadDocumentModal';
import VerifyDetailsModal from '../../../components/modals/VerifyDetailsModal';
import TakeSelfieModal from '../../../components/modals/TakeSelfieModal';
import ProcessingDocumentModal from '../../../components/modals/ProcessingDocumentModal';
import VerificationSubmittedModal from '../../../components/modals/VerificationSubmittedModal';
import kycService from '../../../services/kycService';

// ─── Resolve Professional ID ──────────────────────────────────────────────────
// The payload showed professionalId: null because localStorage.getItem('professionalId')
// returned null — meaning the key used during login/registration is different.
// This helper tries every common key name your backend might use so the ID is
// always found regardless of what the auth service stored it as.
// ✅ To permanently fix: search your login/register response handler and confirm
//    the exact key (e.g. 'id', 'userId', 'professional_id') then keep only that one.
const resolveProfessionalId = () => {
  const candidates = [
    'professionalId',
    'professional_id',
    'userId',
    'user_id',
    'id',
  ];
  for (const key of candidates) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  console.warn('[KYC] Could not resolve professionalId from localStorage. Check your auth login handler.');
  return null;
};

const PersonalDashboard = () => {
  const navigate = useNavigate();

  const kycStatus = localStorage.getItem('kycStatus');
  const [showOldDashboard, setShowOldDashboard] = useState(kycStatus === 'completed');
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(!kycStatus);
  const [showSelectDocumentModal, setShowSelectDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showVerifyDetailsModal, setShowVerifyDetailsModal] = useState(false);
  const [showTakeSelfieModal, setShowTakeSelfieModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showVerificationSubmittedModal, setShowVerificationSubmittedModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [kycData, setKycData] = useState(null);

  // ─── KYC Flow Handlers ────────────────────────────────────────────────────

  const handleStartVerification = () => {
    setShowVerifyIdentityModal(false);
    setShowSelectDocumentModal(true);
  };

  const handleSelectDocument = (docType) => {
    setSelectedDocumentType(docType);
    setShowSelectDocumentModal(false);
    setShowUploadDocumentModal(true);
  };

  const handleDocumentUploaded = (ocrData) => {
    setKycData(ocrData);
    setShowUploadDocumentModal(false);
    setShowVerifyDetailsModal(true);
  };

  const handleDetailsVerified = async (verifiedData) => {
    // Resolve the ID at call-time so it's always fresh
    const professionalId = resolveProfessionalId();

    if (!professionalId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    try {
      // Build the payload matching the API schema:
      // Remap issuingCountry → issueCountry, and include document URLs from upload step
      await kycService.submitKycDetails({
        professionalId,
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
      });
      setShowVerifyDetailsModal(false);
      setShowTakeSelfieModal(true);
    } catch (err) {
      console.error('KYC Submit failed', err);
      alert('Failed to confirm details. Please try again.');
    }
  };

  const handleSelfieTaken = async (selfieFile) => {
    const professionalId = resolveProfessionalId();

    if (!professionalId) {
      alert('Session error: your account ID could not be found. Please log out and log back in.');
      return;
    }

    setShowTakeSelfieModal(false);
    setShowProcessingModal(true);

    try {
      await kycService.uploadSelfie(professionalId, selfieFile);
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
    localStorage.setItem('kycStatus', 'completed');
    setShowVerificationSubmittedModal(false);
    setShowOldDashboard(true);
  };

  const handleSkipVerification = () => {
    localStorage.setItem('kycStatus', 'skipped');
    setShowVerifyIdentityModal(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {!showOldDashboard && <Dashboard />}

      {showOldDashboard && (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-6">
              Welcome to the Maritime Link
            </h1>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>Thank you for completing your profile.</p>
              <p>
                Your information and documents are currently under review by our team.
              </p>
              <p>
                Once the verification process is complete, you will be notified by
                email and granted full access to your dashboard.
              </p>
              <p className="font-medium text-gray-700">
                No further action is required from you at this time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modals */}
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
      />
      <VerifyDetailsModal
        isOpen={showVerifyDetailsModal}
        onClose={() => setShowVerifyDetailsModal(false)}
        onConfirm={handleDetailsVerified}
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