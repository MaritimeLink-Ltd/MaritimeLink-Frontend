import { createContext, useContext } from 'react';
import { useKycWizard } from '../hooks/useKycWizard';
import KycWizardModals from '../components/kyc/KycWizardModals';
import { hasStage2KycAccess, readUserProfile } from '../utils/kycStatus';

const KycContext = createContext(null);

export function KycProvider({ userType, storagePrefix, children }) {
  const wizard = useKycWizard({ userType, storagePrefix });

  return (
    <KycContext.Provider value={wizard}>
      {children}
      <KycWizardModals wizard={wizard} />
    </KycContext.Provider>
  );
}

export function useKyc() {
  return useContext(KycContext);
}

/**
 * Guard restricted actions; bypasses for platform admins and when no KYC provider is mounted.
 */
export function useKycGuard() {
  const kyc = useKyc();
  const isPlatformAdmin =
    typeof window !== 'undefined' &&
    (localStorage.getItem('adminUserType') === 'admin' ||
      localStorage.getItem('userType') === 'admin');

  const guardRestrictedAction = (actionLabel, callback) => {
    if (isPlatformAdmin) {
      callback?.();
      return true;
    }

    if (!kyc) {
      if (hasStage2KycAccess(readUserProfile())) {
        callback?.();
        return true;
      }
      return false;
    }

    return kyc.guardRestrictedAction(actionLabel, callback);
  };

  return {
    guardRestrictedAction,
    hasStage2Access:
      isPlatformAdmin ||
      kyc?.hasStage2Access ||
      hasStage2KycAccess(readUserProfile()),
    isKycUnderReview: kyc?.isKycUnderReview || false,
  };
}
