import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import TermsContent from '../../components/auth/TermsContent';
import authService from '../../services/authService';
import { resolveActiveUserType } from '../../utils/termsAcceptance';

const DEFAULT_RETURN_ROUTES = {
    professional: '/select-profession',
    recruiter: '/upload-profile-photo',
    'training-provider': '/upload-profile-photo',
};

function AcceptTerms() {
    const navigate = useNavigate();
    const location = useLocation();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userType = location.state?.userType || resolveActiveUserType();
    const returnTo =
        location.state?.returnTo ||
        DEFAULT_RETURN_ROUTES[userType] ||
        DEFAULT_RETURN_ROUTES.professional;

    const handleAccept = async () => {
        if (!agreed) {
            setError('You must agree to the Terms & Conditions to continue.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.acceptTerms(userType);
            navigate(returnTo, { replace: true, state: { userType } });
        } catch (err) {
            console.error('Accept terms error:', err);
            setError(err?.data?.message || err?.message || 'Could not save your acceptance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
            <div className="w-full lg:w-2/5 flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 py-8 overflow-hidden">
                <div className="max-w-md w-full mx-auto lg:mx-0 flex flex-col min-h-0 flex-1">
                    <div className="mb-4 -ml-2 shrink-0">
                        <img src="/images/logo.png" alt="MaritimeLink Logo" className="w-24 sm:w-28 h-auto" />
                    </div>

                    <p className="text-sm text-[#003971] mb-1 shrink-0">Welcome to MaritimeLink</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 shrink-0">
                        Terms & Conditions
                    </h1>
                    <p className="text-sm text-gray-600 mb-4 shrink-0">
                        Please read and accept our terms before you continue. You must agree to use the platform.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md shrink-0">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 mb-4">
                        <TermsContent />
                    </div>

                    <div className="shrink-0 space-y-4 pt-2 border-t border-gray-100">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => {
                                    setAgreed(e.target.checked);
                                    if (error) setError('');
                                }}
                                className="h-5 w-5 mt-0.5 text-[#003971] focus:ring-[#003971] border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-800">
                                I have read and agree to the MaritimeLink Terms & Conditions and understand
                                that acceptance is required to use the system.
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={loading || !agreed}
                            className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'I Agree — Continue'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime professionals"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default AcceptTerms;
