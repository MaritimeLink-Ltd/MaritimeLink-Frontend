import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCcw, Wallet } from 'lucide-react';

import trainerDashboardService from '../../../services/trainerDashboardService';

function PayoutOnboardingReturn({ mode = 'success' }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let active = true;
        trainerDashboardService.getStripeStatus()
            .then((response) => {
                if (!active) return;
                setStatus(response?.data || null);
            })
            .catch((error) => {
                if (!active) return;
                setMessage(error.message || 'Could not refresh payout setup status.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const handleResume = async () => {
        setActionLoading(true);
        setMessage('');
        try {
            const response = await trainerDashboardService.refreshStripeOnboarding();
            const onboardingUrl = response?.data?.onboardingUrl;
            if (!onboardingUrl) throw new Error('Stripe onboarding link was not returned.');
            window.location.assign(onboardingUrl);
        } catch (error) {
            setMessage(error.message || 'Could not open Stripe onboarding.');
            setActionLoading(false);
        }
    };

    const complete = Boolean(status?.onboardingComplete);
    const needsResume = mode === 'reauth' || (!loading && !complete);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
                <div className={`mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center ${
                    complete ? 'bg-green-50' : 'bg-[#003971]/10'
                }`}>
                    {complete ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    ) : (
                        <Wallet className="h-8 w-8 text-[#003971]" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {complete ? 'Payouts are ready' : needsResume ? 'Finish payout setup' : 'Checking payout setup'}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    {complete
                        ? 'Your Stripe Connect account is connected and ready for trainer payouts.'
                        : needsResume
                            ? 'Stripe needs a little more information before payouts can be enabled.'
                            : 'We are refreshing your Stripe onboarding status.'}
                </p>
                {message && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                        {message}
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {needsResume && (
                        <button
                            type="button"
                            onClick={handleResume}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#003971] text-white text-sm font-semibold hover:bg-[#002455] disabled:opacity-60 transition-colors"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            {actionLoading ? 'Opening Stripe...' : 'Resume setup'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/trainingprovider-dashboard')}
                        className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Back to dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PayoutOnboardingReturn;
