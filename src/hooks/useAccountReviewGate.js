import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldShowAccountPendingWelcome } from '../utils/accountStatus';
import { readUserProfile } from '../utils/kycStatus';

function isPathAllowed(pathname, dashboardPath, allowedPathPrefixes) {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  if (path === dashboardPath) return true;
  return allowedPathPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Restrict navigation while account review is pending. Pass `isPendingCheck` to customize
 * the pending condition (Stage 1 `status` === PENDING until admin approves the account).
 */
export function useAccountReviewGate(dashboardPath, options = {}) {
  const {
    allowedPathPrefixes = [],
    isPendingCheck = shouldShowAccountPendingWelcome,
  } = options;
  const location = useLocation();
  const navigate = useNavigate();
  const [isAccountPending, setIsAccountPending] = useState(() =>
    isPendingCheck(readUserProfile()),
  );

  useEffect(() => {
    const refresh = () => setIsAccountPending(isPendingCheck(readUserProfile()));

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('kycProfileUpdated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('kycProfileUpdated', refresh);
    };
  }, [isPendingCheck]);

  useEffect(() => {
    if (!isAccountPending) return;
    if (isPathAllowed(location.pathname, dashboardPath, allowedPathPrefixes)) return;

    navigate(dashboardPath, { replace: true });
  }, [isAccountPending, location.pathname, dashboardPath, navigate, allowedPathPrefixes]);

  return { isAccountPending, dashboardPath };
}
