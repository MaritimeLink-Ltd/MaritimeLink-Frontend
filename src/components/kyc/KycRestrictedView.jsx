import { ShieldCheck, Clock, ArrowLeft } from 'lucide-react';
import { useKyc } from '../../context/KycContext';

/**
 * Full-page prompt when a restricted view is blocked until Stage 2 KYC is approved.
 */
export default function KycRestrictedView({
  actionLabel = 'continue',
  isUnderReview = false,
  onBack,
  title,
}) {
  const kyc = useKyc();

  const handleStartVerification = () => {
    kyc?.actions?.handleKycRequiredStart?.() || kyc?.actions?.handleStartVerification?.();
  };

  const actionText = actionLabel ? ` ${actionLabel}` : ' this action';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6">
      {onBack && (
        <div className="mb-4">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 max-w-lg w-full text-center">
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isUnderReview ? 'bg-amber-50' : 'bg-blue-50'
              }`}
            >
              {isUnderReview ? (
                <Clock className="h-8 w-8 text-amber-600" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-[#003971]" />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title || (isUnderReview ? 'Verification in progress' : 'Identity verification required')}
          </h1>

          <p className="text-gray-600 mb-4">
            {isUnderReview ? (
              <>
                Thanks for submitting your KYC details. Our team is reviewing your identity verification.
                You&apos;ll be able to{actionText} as soon as your verified badge is issued.
              </>
            ) : (
              <>
                To keep MaritimeLink trusted and secure, you need to complete Stage 2 identity verification
                before you can{actionText}.
              </>
            )}
          </p>

          {!isUnderReview && (
            <p className="text-gray-500 text-sm mb-8">
              It only takes a few minutes. Once approved, all restricted features unlock automatically —
              no need to log out.
            </p>
          )}

          <div className="space-y-3">
            {!isUnderReview && (
              <button
                type="button"
                onClick={handleStartVerification}
                className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors"
              >
                Complete KYC verification
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
              >
                {isUnderReview ? 'Go back' : 'Not now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
