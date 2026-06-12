import { Clock, ShieldCheck } from 'lucide-react';
import { useKyc } from '../../context/KycContext';
import { shouldShowKycStage2Banner } from '../../utils/accountStatus';
import { isKycUnderReview, readUserProfile } from '../../utils/kycStatus';

/**
 * Persistent dashboard banner shown once Stage 1 account review is approved but
 * Stage 2 identity verification (KYC) is not yet approved.
 */
export default function KycStage2Banner({ className = '' }) {
  const kyc = useKyc();
  const profile = readUserProfile();

  if (!shouldShowKycStage2Banner(profile)) return null;

  const underReview = kyc?.isKycUnderReview ?? isKycUnderReview(profile);

  if (underReview) {
    return (
      <div className={`rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3 ${className}`}>
        <Clock className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">KYC Stage 2 is pending. </span>
          Your identity verification has been submitted and is awaiting admin approval. Full access unlocks once it&apos;s approved.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-[#003971] shrink-0" />
        <p className="text-sm text-gray-800">
          <span className="font-semibold">KYC Stage 2 verification required. </span>
          Submit your identity verification to unlock full platform access.
        </p>
      </div>
      <button
        type="button"
        onClick={() => kyc?.actions?.handleKycRequiredStart?.()}
        className="shrink-0 bg-[#003971] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#002855] transition-colors"
      >
        Complete KYC verification
      </button>
    </div>
  );
}
