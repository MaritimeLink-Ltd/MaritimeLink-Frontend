import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronDown, Crown, Loader2, Briefcase } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import recruiterSettingsService from '../../../../services/recruiterSettingsService';
import jobService from '../../../../services/jobService';
import { isFlexJobActive } from '../../../../utils/recruiterTier';

/**
 * Plan cards, transcribed from the MaritimeLink Pricing & Subscription Conditions
 * document. Every included feature is listed in full and in document order — these
 * cards are what the recruiter is buying against, so nothing is summarised away.
 *
 * `inherits` renders as a lead-in line above the ticked list ("Everything in X, plus:").
 * The enforced matrix lives in `utils/recruiterTier.js` (client) and
 * `recruiterCapabilities.ts` (server); keep all three in step.
 */
const PLAN_DETAILS = {
    FREE: {
        title: 'Free Recruiter',
        subtitle: 'For recruiters who are new to MaritimeLink and want to explore the platform.',
        highlights: [
            'Create 1 Active Job Listing',
            'Receive up to 5 applications for that job',
            'Manage applications for that job',
            'Recruiter Dashboard',
            'Search candidates using all available filters',
            'View candidate summary profiles',
            'Message candidates who have applied to your vacancy',
        ],
    },
    FLEX: {
        title: 'Flex Recruiter',
        subtitle:
            "For companies that recruit occasionally but require access to MaritimeLink's premium recruitment tools.",
        meta: 'Listing duration: 30 days',
        inherits: 'Everything in Free Recruiter, plus:',
        highlights: [
            'Unlimited job listings — pay per listing, each live for 30 days',
            'Unlimited applications for each paid listing',
            'Smart Candidate Matching',
            'Invite Candidates',
            'Manage applications',
            'Recruiter Dashboard',
            'Search candidates using all available filters',
            'View candidate summary profiles',
            'View Resume for candidates matched or applied to your paid listing',
            'View Document Wallet for candidates who applied to that vacancy only',
            'Message candidates who have applied to your vacancy',
        ],
    },
    PREMIUM: {
        title: 'Premium Recruiter',
        subtitle:
            'For recruiters, shipowners, crewing companies and manning agencies recruiting continuously.',
        inherits: 'Everything in Flex Recruiter, plus:',
        highlights: [
            'Unlimited Active & Premium Job Listings',
            'Unlimited Applications',
            'Unlimited Candidate Search',
            'Smart Candidate Matching',
            'View Resume',
            'View Document Wallet for all professionals',
            'Invite Candidates',
            'Direct Messaging before application',
            'CSV Export',
            'Premium Recruiter Badge',
            'Priority Company Listing',
            'Priority Customer Support',
        ],
    },
};

/**
 * Features shown before the "show more" toggle. The full lists run to 11-13
 * items, which pushed the Subscribe buttons well below the fold; this keeps all
 * three cards to one screen while leaving every feature one click away.
 */
const FEATURES_PREVIEW_COUNT = 6;

/** Plan prices come from the API (`membership.plans`); always render 2 decimals. */
const formatPlanPrice = (plan, planCode) => {
    if (planCode === 'FREE') return 'Free';
    const amount = Number(plan?.price);
    if (!Number.isFinite(amount)) return '—';
    return `£${amount.toFixed(2)}`;
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
    /** Plan codes whose full feature list the user has opened. */
    const [expandedPlans, setExpandedPlans] = useState([]);

    const togglePlanFeatures = (planCode) => {
        setExpandedPlans((prev) =>
            prev.includes(planCode) ? prev.filter((code) => code !== planCode) : [...prev, planCode],
        );
    };

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
    const hasActiveFlex = flexActiveJobs.length > 0;

    /** API-provided plan pricing, keyed by plan code. */
    const planPricing = useMemo(() => {
        const plans = Array.isArray(membership?.plans) ? membership.plans : [];
        return Object.fromEntries(plans.map((plan) => [plan.planCode || plan.id, plan]));
    }, [membership]);

    /**
     * The plan to present as active.
     *
     * Flex is bought per job listing rather than stored on `recruiter.tier`, so an
     * account with live Flex listings still reads as FREE on the API. Showing that
     * verbatim was the bug: a Flex purchase left "Free Recruiter" highlighted while the
     * app behaved as if upgraded. Premium outranks Flex; Flex outranks Free.
     */
    const displayPlan = activeTier === 'PREMIUM' ? 'PREMIUM' : hasActiveFlex ? 'FLEX' : 'FREE';

    /** Soonest Flex expiry — Flex stays active until then and can't be dropped. */
    const flexExpiresAt = useMemo(() => {
        if (!hasActiveFlex) return null;
        return flexActiveJobs
            .map((job) => new Date(job.premiumListingExpiresAt))
            .sort((a, b) => a - b)[0];
    }, [flexActiveJobs, hasActiveFlex]);

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
        // Flex is unlimited-but-paid, so with every listing already upgraded the
        // next step is posting another job, not a dead end.
        const canUpgradeSelected = flexEligibleJobs.some((job) => job.id === selectedJobId);
        if (!selectedJobId || !canUpgradeSelected) {
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
                        {/* Current plan, with the live Flex listings folded in so the
                            page opens with one status block instead of two stacked ones. */}
                        <div className="bg-blue-900 rounded-xl p-6 text-white mb-6">
                            <div className="flex items-start gap-3">
                                <Crown size={24} className="mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-lg font-medium">{PLAN_DETAILS[displayPlan]?.title || 'Free Recruiter'}</div>
                                    <div className="text-sm opacity-90">
                                        {displayPlan === 'FLEX'
                                            ? `Active until ${flexExpiresAt?.toLocaleDateString()} — upgrade to Premium at any time`
                                            : 'Your account subscription plan'}
                                    </div>
                                </div>
                            </div>

                            {flexActiveJobs.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-2">
                                        Active Flex listings
                                    </p>
                                    <ul className="flex flex-wrap gap-2">
                                        {flexActiveJobs.map((job) => (
                                            <li
                                                key={job.id}
                                                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm"
                                            >
                                                <Briefcase size={14} className="opacity-80 flex-shrink-0" />
                                                <span className="font-medium">{job.title}</span>
                                                <span className="opacity-75">
                                                    until {new Date(job.premiumListingExpiresAt).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['FREE', 'FLEX', 'PREMIUM'].map((planCode) => {
                                const details = PLAN_DETAILS[planCode];
                                const isCurrent = planCode === displayPlan;
                                const isExpanded = expandedPlans.includes(planCode);
                                const visibleHighlights = isExpanded
                                    ? details.highlights
                                    : details.highlights.slice(0, FEATURES_PREVIEW_COUNT);
                                const hiddenCount = details.highlights.length - visibleHighlights.length;

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
                                                {formatPlanPrice(planPricing[planCode], planCode)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {planCode === 'FLEX' ? 'per job listing' : planCode === 'PREMIUM' ? 'per month' : ''}
                                            </div>
                                        </div>

                                        {details.meta && (
                                            <p className="text-xs font-medium text-gray-500 -mt-3 mb-4">{details.meta}</p>
                                        )}

                                        {details.inherits && (
                                            <p className="text-sm font-semibold text-gray-800 mb-2">{details.inherits}</p>
                                        )}

                                        <div className="flex-1 mb-5">
                                            <ul className="space-y-2">
                                                {visibleHighlights.map((item) => (
                                                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {(hiddenCount > 0 || isExpanded) && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePlanFeatures(planCode)}
                                                    className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                                >
                                                    {isExpanded
                                                        ? 'Show less'
                                                        : `Show ${hiddenCount} more feature${hiddenCount === 1 ? '' : 's'}`}
                                                    <ChevronDown
                                                        size={16}
                                                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        {planCode === 'FREE' && (
                                            <div className="space-y-2">
                                                <button
                                                    onClick={handleDowngradeToFree}
                                                    disabled={isUpdating || displayPlan === 'FREE' || hasActiveFlex}
                                                    className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 bg-gray-900 text-white"
                                                >
                                                    {displayPlan === 'FREE' ? 'Current Plan' : 'Switch to Free'}
                                                </button>
                                                {hasActiveFlex && (
                                                    <p className="text-xs text-gray-500 text-center">
                                                        Your Flex listing runs until{' '}
                                                        {flexExpiresAt?.toLocaleDateString()}. You can upgrade to
                                                        Premium, but not drop to Free before then.
                                                    </p>
                                                )}
                                            </div>
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
                                                    disabled={isUpdating || isLoadingJobs}
                                                    className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-2"
                                                >
                                                    <Briefcase size={16} />
                                                    {isLoadingJobs
                                                        ? 'Loading your jobs...'
                                                        : flexEligibleJobs.length > 0 && selectedJobId
                                                            ? 'Upgrade This Listing'
                                                            : myJobs.length > 0
                                                                ? 'Post Another Job'
                                                                : 'Post a Job'}
                                                </button>
                                                {!isLoadingJobs && flexEligibleJobs.length === 0 && (
                                                    <p className="text-xs text-gray-500 text-center">
                                                        {myJobs.length > 0
                                                            ? 'All your jobs already have an active Flex or Premium upgrade. Post another listing to buy a new one — Flex has no listing limit.'
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
