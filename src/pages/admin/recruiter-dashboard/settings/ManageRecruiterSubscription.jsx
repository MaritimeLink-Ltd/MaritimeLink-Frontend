import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Crown, Loader2, Briefcase } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import recruiterSettingsService from '../../../../services/recruiterSettingsService';
import jobService from '../../../../services/jobService';
import { isFlexJobActive } from '../../../../utils/recruiterTier';

const PLAN_DETAILS = {
    FREE: {
        title: 'Free Recruiter',
        subtitle: 'Explore the platform',
        highlights: [
            '1 active job listing',
            'Up to 5 applications per job',
            'Candidate search with filters',
            'Message applicants',
        ],
    },
    FLEX: {
        title: 'Flex Recruiter',
        subtitle: 'Purchased per job listing',
        highlights: [
            'One 30-day premium job listing',
            'Unlimited applications for that listing',
            'Smart candidate matching & invites',
            'View resume & document wallet for applicants',
        ],
    },
    PREMIUM: {
        title: 'Premium Recruiter',
        subtitle: 'For continuous hiring',
        highlights: [
            'Unlimited active & premium job listings',
            'Unlimited candidate search & applications',
            'Direct messaging before application',
            'CSV export, premium badge & priority support',
        ],
    },
};

const ManageRecruiterSubscription = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const preselectedJobId = location.state?.jobId || null;

    const [membership, setMembership] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [myJobs, setMyJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || '');

    const loadMembership = async () => {
        try {
            const response = await recruiterSettingsService.getMembership();
            const payload = response?.data?.membership || response?.membership || null;
            setMembership(payload);
            return payload;
        } catch (error) {
            toast.error(error.message || 'Failed to load membership details', { position: 'top-right' });
            return null;
        }
    };

    const loadMyJobs = async () => {
        try {
            setIsLoadingJobs(true);
            const response = await jobService.getMyJobs();
            const jobs = response?.data?.jobs || [];
            setMyJobs(jobs);
            return jobs;
        } catch (error) {
            console.error('Failed to load jobs for Flex upgrade:', error);
            return [];
        } finally {
            setIsLoadingJobs(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            setIsLoading(true);
            await loadMembership();
            if (mounted) setIsLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (mounted) await loadMyJobs();
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Client-side fallback confirmation for Stripe redirects — the webhook is the
    // real source of truth, but on local/dev setups without a public webhook URL
    // this is what actually activates the plan after a successful payment.
    useEffect(() => {
        const membershipStatus = searchParams.get('membership');
        const flexStatus = searchParams.get('flex');
        const sessionId = searchParams.get('session_id');
        const jobId = searchParams.get('jobId');

        if (membershipStatus === 'canceled' || flexStatus === 'canceled') {
            toast.error('Checkout was canceled', { position: 'top-right' });
            setSearchParams({}, { replace: true });
            return;
        }

        if (!sessionId) return;

        let cancelled = false;

        (async () => {
            try {
                if (membershipStatus === 'success') {
                    await recruiterSettingsService.confirmMembershipCheckout(sessionId);
                    if (cancelled) return;
                    await loadMembership();
                    toast.success('Payment successful! Premium Recruiter is now active.', { position: 'top-right' });
                } else if (flexStatus === 'success' && jobId) {
                    await recruiterSettingsService.confirmFlexListingCheckout(jobId, sessionId);
                    if (cancelled) return;
                    await loadMyJobs();
                    toast.success('Payment successful! Flex is now active for that job listing.', { position: 'top-right' });
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(error.message || 'Could not confirm payment yet — please refresh in a moment.', { position: 'top-right' });
                }
            } finally {
                if (!cancelled) {
                    setSearchParams({}, { replace: true });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const activeTier = membership?.tier || 'FREE';

    // Jobs that can still receive a Flex upgrade (not removed, and not already
    // covered by an unexpired Flex purchase).
    const flexEligibleJobs = useMemo(
        () => myJobs.filter((job) => job.status !== 'REMOVED' && !isFlexJobActive(job)),
        [myJobs],
    );
    const flexActiveJobs = useMemo(() => myJobs.filter(isFlexJobActive), [myJobs]);

    useEffect(() => {
        if (selectedJobId) return;
        if (preselectedJobId) return;
        if (flexEligibleJobs.length > 0) {
            setSelectedJobId(flexEligibleJobs[0].id);
        }
    }, [flexEligibleJobs, selectedJobId, preselectedJobId]);

    const handleSubscribePremium = async () => {
        try {
            setIsUpdating(true);
            const response = await recruiterSettingsService.createMembershipCheckout();
            const checkoutUrl = response?.data?.checkoutUrl;
            if (!checkoutUrl) throw new Error('Checkout URL was not returned. Please try again.');
            window.location.href = checkoutUrl;
        } catch (error) {
            toast.error(error.message || 'Failed to start checkout', { position: 'top-right' });
            setIsUpdating(false);
        }
    };

    const handleDowngradeToFree = async () => {
        try {
            setIsUpdating(true);
            await recruiterSettingsService.updateMembership('FREE');
            setMembership((prev) => ({ ...(prev || {}), tier: 'FREE' }));
            toast.success('Plan updated to Free', { position: 'top-right' });
        } catch (error) {
            toast.error(error.message || 'Failed to update plan', { position: 'top-right' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFlexCheckout = async () => {
        if (!selectedJobId) {
            navigate('/recruiter/upload-job');
            return;
        }
        try {
            setIsUpdating(true);
            const response = await recruiterSettingsService.createFlexListingCheckout(selectedJobId);
            const checkoutUrl = response?.data?.checkoutUrl;
            if (!checkoutUrl) throw new Error('Checkout URL was not returned. Please try again.');
            window.location.href = checkoutUrl;
        } catch (error) {
            toast.error(error.message || 'Failed to start Flex checkout', { position: 'top-right' });
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center py-20 px-4 sm:px-8 bg-gray-50">
            <Toaster />
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 my-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-lg font-medium">Manage Subscription</span>
                </button>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#003971]" />
                        Loading membership...
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-900 rounded-xl p-6 text-white mb-4">
                            <div className="flex items-center gap-3">
                                <Crown size={24} />
                                <div>
                                    <div className="text-lg font-medium">{PLAN_DETAILS[activeTier]?.title || 'Free Recruiter'}</div>
                                    <div className="text-sm opacity-90">
                                        Your account subscription plan
                                        {activeTier === 'FREE' && ' (Flex upgrades are per-listing and don\'t change this)'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {flexActiveJobs.length > 0 && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-8">
                                <p className="text-sm font-semibold text-green-800 mb-1">Active Flex listings</p>
                                <ul className="space-y-1">
                                    {flexActiveJobs.map((job) => (
                                        <li key={job.id} className="text-sm text-green-700">
                                            {job.title} — upgraded until{' '}
                                            {new Date(job.premiumListingExpiresAt).toLocaleDateString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${flexActiveJobs.length === 0 ? 'mt-4' : ''}`}>
                            {['FREE', 'FLEX', 'PREMIUM'].map((planCode) => {
                                const details = PLAN_DETAILS[planCode];
                                const isCurrent = planCode === activeTier || (planCode === 'FREE' && activeTier === 'FREE');

                                return (
                                    <div
                                        key={planCode}
                                        className={`rounded-2xl border p-5 flex flex-col ${
                                            isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="mb-3">
                                            <h4 className="text-lg font-semibold text-gray-900">{details.title}</h4>
                                            <p className="text-sm text-gray-500">{details.subtitle}</p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-3xl font-bold text-gray-900">
                                                {planCode === 'FREE' ? 'Free' : planCode === 'FLEX' ? '£99.90' : '£199.90'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {planCode === 'FLEX' ? 'per job listing' : planCode === 'PREMIUM' ? 'per month' : ''}
                                            </div>
                                        </div>

                                        <ul className="space-y-2 mb-5 flex-1">
                                            {details.highlights.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {planCode === 'FREE' && (
                                            <button
                                                onClick={handleDowngradeToFree}
                                                disabled={isUpdating || activeTier === 'FREE'}
                                                className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 bg-gray-900 text-white"
                                            >
                                                {activeTier === 'FREE' ? 'Current Plan' : 'Switch to Free'}
                                            </button>
                                        )}

                                        {planCode === 'FLEX' && (
                                            <div className="space-y-2">
                                                {!preselectedJobId && !isLoadingJobs && flexEligibleJobs.length > 0 && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                                            Select job listing to upgrade
                                                        </label>
                                                        <select
                                                            value={selectedJobId}
                                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        >
                                                            {flexEligibleJobs.map((job) => (
                                                                <option key={job.id} value={job.id}>
                                                                    {job.title} — {job.status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={handleFlexCheckout}
                                                    disabled={isUpdating || isLoadingJobs || (myJobs.length > 0 && flexEligibleJobs.length === 0)}
                                                    className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-2"
                                                >
                                                    <Briefcase size={16} />
                                                    {isLoadingJobs
                                                        ? 'Loading your jobs...'
                                                        : selectedJobId
                                                            ? 'Upgrade This Listing'
                                                            : myJobs.length > 0
                                                                ? 'All Jobs Upgraded'
                                                                : 'Post a Job'}
                                                </button>
                                                {!isLoadingJobs && flexEligibleJobs.length === 0 && (
                                                    <p className="text-xs text-gray-500 text-center">
                                                        {myJobs.length > 0
                                                            ? 'All your jobs already have an active Flex or Premium upgrade.'
                                                            : "You don't have any job listings yet — post one first."}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {planCode === 'PREMIUM' && (
                                            <button
                                                onClick={handleSubscribePremium}
                                                disabled={isUpdating || activeTier === 'PREMIUM'}
                                                className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                                                    activeTier === 'PREMIUM'
                                                        ? 'bg-gray-900 text-white cursor-default'
                                                        : 'bg-blue-600 text-white hover:bg-blue-500'
                                                }`}
                                            >
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                                {activeTier === 'PREMIUM' ? 'Current Plan' : 'Subscribe'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageRecruiterSubscription;
