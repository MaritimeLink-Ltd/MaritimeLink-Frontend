import { ShieldCheck, Clock, X } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';

function KycRequiredModal({
  isOpen,
  onClose,
  actionLabel,
  isUnderReview = false,
  onStartVerification,
}) {
  const actionText = actionLabel ? ` ${actionLabel}` : ' this action';

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full relative my-4 max-h-[95vh] overflow-y-auto shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

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

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          {isUnderReview ? 'Verification in progress' : 'Identity verification required'}
        </h2>

        <p className="text-center text-gray-600 mb-4">
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
          <p className="text-center text-gray-500 text-sm mb-8">
            It only takes a few minutes. Once approved, all restricted features unlock automatically —
            no need to log out.
          </p>
        )}

        <div className="space-y-3">
          {!isUnderReview && (
            <button
              type="button"
              onClick={onStartVerification}
              className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors"
            >
              Complete KYC verification
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
          >
            {isUnderReview ? 'OK, got it' : 'Not now'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

export default KycRequiredModal;
