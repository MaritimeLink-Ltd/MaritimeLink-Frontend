import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import {
    getLoginRouteFromStorage,
    isAuthTokenExpired,
    isPlatformAdminSession,
} from '../../utils/sessionManager';
import { isAccountStage1Approved } from '../../utils/accountStatus';
import { readUserProfile } from '../../utils/kycStatus';
import { loginRouteForLegalPath } from '../../constants/legalRoutes';
import { withReturnTo } from '../../utils/postLoginRedirect';

/**
 * Gates the legal policy pages (T&Cs, Privacy, Cookie, Acceptable Use, role terms,
 * Data Retention, Security Disclosure) so only registered members with an approved
 * account can read them. The landing-page footer still links to all of them.
 *
 * Signed-out visitors go to the login screen that matches the policy they asked for,
 * carrying a `returnTo` so signing in lands them on that policy rather than a
 * dashboard. Members still under Stage 1 review get an explanatory panel instead of a
 * login bounce, since bouncing an already-authenticated user to login reads as a loop.
 *
 * Terms shown *during* signup are unaffected — those render inline through
 * TermsAgreementField's modal, not these routes.
 */
export default function LegalRouteGuard({ children }) {
    const location = useLocation();
    const token = typeof window === 'undefined' ? null : localStorage.getItem('authToken');

    if (!token || isAuthTokenExpired(token)) {
        const loginRoute =
            loginRouteForLegalPath(location.pathname) || getLoginRouteFromStorage(location.pathname);
        return <Navigate to={withReturnTo(loginRoute, location.pathname)} replace />;
    }

    // Platform admins carry no `userProfile` status; they are always allowed through.
    if (!isPlatformAdminSession() && !isAccountStage1Approved(readUserProfile())) {
        return <AccountUnderReviewNotice />;
    }

    return children;
}

/** Dashboard home for the signed-in role, so the notice below is never a dead end. */
function dashboardRouteForSession() {
    switch (localStorage.getItem('adminUserType') || localStorage.getItem('userType')) {
        case 'recruiter':
            return '/recruiter-dashboard';
        case 'training-provider':
            return '/trainingprovider-dashboard';
        default:
            return '/personal/dashboard';
    }
}

function AccountUnderReviewNotice() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
            <div className="max-w-md w-full text-center">
                <img src="/images/logo.png" alt="MaritimeLink Logo" className="w-24 h-auto mx-auto mb-8" />
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                    <ShieldAlert size={22} className="text-amber-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Your account is still under review
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Our legal policies are available to approved members. You will be able to open them
                    as soon as your account review is complete.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        to={dashboardRouteForSession()}
                        className="inline-flex items-center justify-center rounded-md bg-[#003971] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#002855]"
                    >
                        Go to dashboard
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
