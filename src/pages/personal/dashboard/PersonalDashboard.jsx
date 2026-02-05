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

const PersonalDashboard = () => {
  const navigate = useNavigate();
  const [showOldDashboard, setShowOldDashboard] = useState(false);

  // KYC Modal States
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(true); // Show on initial load
  const [showSelectDocumentModal, setShowSelectDocumentModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showVerifyDetailsModal, setShowVerifyDetailsModal] = useState(false);
  const [showTakeSelfieModal, setShowTakeSelfieModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showVerificationSubmittedModal, setShowVerificationSubmittedModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);

  // KYC Flow Handlers
  const handleStartVerification = () => {
    setShowVerifyIdentityModal(false);
    setShowSelectDocumentModal(true);
  };

  const handleSelectDocument = (docType) => {
    setSelectedDocumentType(docType);
    setShowSelectDocumentModal(false);
    setShowUploadDocumentModal(true);
  };

  const handleDocumentUploaded = () => {
    setShowUploadDocumentModal(false);
    setShowVerifyDetailsModal(true);
  };

  const handleDetailsVerified = () => {
    setShowVerifyDetailsModal(false);
    setShowTakeSelfieModal(true);
  };

  const handleSelfieTaken = () => {
    setShowTakeSelfieModal(false);
    setShowProcessingModal(true);
    
    // Simulate processing time
    setTimeout(() => {
      setShowProcessingModal(false);
      setShowVerificationSubmittedModal(true);
    }, 3000);
  };

  const handleVerificationComplete = () => {
    setShowVerificationSubmittedModal(false);
    // User can now access dashboard
  };

  const handleSkipVerification = () => {
    setShowVerifyIdentityModal(false);
    // Allow user to continue without verification
  };

  return (
    <div className="h-full bg-white">
      {!showOldDashboard && (
        <Dashboard />
      )}

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
                Once the verification process is complete, you will be notified by email and
                granted full access to your dashboard.
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
      />
      <TakeSelfieModal 
        isOpen={showTakeSelfieModal} 
        onClose={() => setShowTakeSelfieModal(false)}
        onSelfieTaken={handleSelfieTaken}
      />
      <ProcessingDocumentModal 
        isOpen={showProcessingModal} 
      />
      <VerificationSubmittedModal 
        isOpen={showVerificationSubmittedModal} 
        onClose={handleVerificationComplete}
      />
    </div>
  );
};

export default PersonalDashboard;
