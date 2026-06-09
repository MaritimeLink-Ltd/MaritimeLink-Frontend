import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAccountPendingReview } from '../utils/accountStatus';
import { readUserProfile } from '../utils/kycStatus';

/**
 * When the account is pending Stage 1 review, keep the user on the dashboard
 * welcome screen and expose a flag for disabling sidebar navigation.
 */
export function useAccountReviewGate(dashboardPath) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAccountPending, setIsAccountPending] = useState(() =>
    isAccountPendingReview(readUserProfile()),
  );

  useEffect(() => {
    const refresh = () => setIsAccountPending(isAccountPendingReview(readUserProfile()));

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('kycProfileUpdated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('kycProfileUpdated', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isAccountPending) return;
    if (location.pathname === dashboardPath) return;

    navigate(dashboardPath, { replace: true });
  }, [isAccountPending, location.pathname, dashboardPath, navigate]);

  return { isAccountPending, dashboardPath };
}
