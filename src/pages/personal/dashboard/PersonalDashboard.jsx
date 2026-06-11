import Dashboard from './dashboard-sections/Dashboard';
import { useKyc } from '../../../context/KycContext';
import { AlertTriangle } from 'lucide-react';
import AccountPendingWelcome from '../../../components/account/AccountPendingWelcome';
import { shouldShowProfessionalStage1PendingWelcome } from '../../../utils/accountStatus';
import { readUserProfile } from '../../../utils/kycStatus';

const PersonalDashboard = () => {
  const kyc = useKyc();
  const {
    hasStage2Access,
    isKycUnderReview,
    hasKycSubmitted,
    actions: { handleStartVerification },
  } = kyc || {};

  if (shouldShowProfessionalStage1PendingWelcome(readUserProfile())) {
    return (
      <div className="min-h-screen bg-white">
        <AccountPendingWelcome />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {!hasStage2Access && (
        <div className="border-b border-amber-100 bg-amber-50/80 px-6 py-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#003971]">
                  {isKycUnderReview || hasKycSubmitted
                    ? 'Identity verification under review'
                    : 'Complete identity verification'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isKycUnderReview || hasKycSubmitted
                    ? 'You can browse all sections. Applying to jobs, booking courses, and other actions unlock once your identity verification is approved.'
                    : 'Complete Stage 2 identity verification to unlock applying for jobs, booking courses, and sharing documents.'}
                </p>
              </div>
            </div>
            {!hasKycSubmitted && !isKycUnderReview && handleStartVerification ? (
              <button
                type="button"
                onClick={handleStartVerification}
                className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002855] transition-colors"
              >
                Start verification
              </button>
            ) : null}
          </div>
        </div>
      )}

      <Dashboard />
    </div>
  );
};

export default PersonalDashboard;
