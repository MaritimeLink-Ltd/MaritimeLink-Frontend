import { useState, useMemo } from 'react';
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
import resolveKycEntityId from '../../../utils/resolveKycEntityId';
import { AlertTriangle } from 'lucide-react';

const PersonalDashboard = () => {
  const navigate = useNavigate();

  const userProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile')) || {};
    } catch {
      return {};
    }
  }, []);

  const isVerifiedByAdmin = useMemo(() => {
    const profileStatus = userProfile.status?.toUpperCase();
    return profileStatus === 'APPROVED' || profileStatus === 'VERIFIED' || profileStatus === 'ACTIVE';
  }, [userProfile]);

  const [sessionSkipped, setSessionSkipped] = useState(false);
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(!isVerifiedByAdmin);
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
    const professionalId = resolveKycEntityId('professional');

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
    const professionalId = resolveKycEntityId('professional');

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
    // Optionally trigger a profile refresh here if your backend dictates
    setShowVerificationSubmittedModal(false);
  };

  const handleSkipVerification = () => {
    setSessionSkipped(true);
    setShowVerifyIdentityModal(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

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
              Account Under Review
            </h1>
            <p className="text-gray-600">
              Your account is currently being reviewed by our admin team.
            </p>
            <p className="text-gray-500 text-sm">
              Once your KYC verification is approved, you will have full access to Jobs, Training, Chats, and Profile.
              In the meantime, you can update your <strong>Resume</strong> and <strong>Documents</strong>.
            </p>
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
        userType="professional"
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