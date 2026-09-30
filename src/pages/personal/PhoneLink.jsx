import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import { syncTermsAcceptedFromProfile } from '../../utils/termsAcceptance';
import { isAuthTokenExpired } from '../../utils/sessionManager';

const WALLET_PATH = '/personal/documents';

/** The one-time token rides in the fragment (#t=…), so it never reaches server or proxy logs. */
const readToken = (hash) => new URLSearchParams((hash || '').replace(/^#/, '')).get('t');

const hasProfessionalSession = () => {
    const token = localStorage.getItem('authToken');
    return Boolean(token) && !isAuthTokenExpired(token) && localStorage.getItem('userType') === 'professional';
};

/**
 * Landing page for the QR code / link on the desktop Document Wallet upload
 * screen. Exchanges the one-time token for a session and opens the wallet,
 * so the professional can photograph documents without signing in.
 */
function PhoneLink() {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    // StrictMode runs effects twice in development; the token is single use.
    const redeemStarted = useRef(false);

    useEffect(() => {
        if (redeemStarted.current) return;
        redeemStarted.current = true;

        const token = readToken(location.hash);
        if (!token) {
            if (hasProfessionalSession()) navigate(WALLET_PATH, { replace: true });
            else setError('This link is incomplete. Scan the QR code again from your computer, or sign in.');
            return;
        }

        authService
            .redeemPhoneLink(token)
            .then((response) => {
                syncTermsAcceptedFromProfile(response?.data?.user);
                navigate(WALLET_PATH, { replace: true });
            })
            .catch((err) => {
                // Scanned twice: the first scan already signed this phone in.
                if (hasProfessionalSession()) {
                    navigate(WALLET_PATH, { replace: true });
                    return;
                }
                setError(
                    err?.data?.message ||
                        'This phone link has expired or was already used. Scan the QR code again from your computer, or sign in.'
                );
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
                <img src="/images/logo.png" alt="MaritimeLink Logo" className="w-20 h-auto mx-auto mb-4" />
                {!error ? (
                    <>
                        <Loader2 className="w-8 h-8 animate-spin text-[#003366] mx-auto mb-3" />
                        <p className="text-sm text-slate-600">Opening your Document Wallet…</p>
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                        <p className="text-sm text-slate-700 mb-5">{error}</p>
                        <Link
                            to="/signin"
                            className="inline-block w-full rounded-lg bg-[#003366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#002855] transition-colors"
                        >
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default PhoneLink;
