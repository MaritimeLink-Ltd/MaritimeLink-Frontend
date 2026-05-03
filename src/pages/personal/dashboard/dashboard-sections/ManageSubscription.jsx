import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Crown, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authService from '../../../../services/authService';

const PLAN_DETAILS = {
    FREE: {
        title: 'Free',
        subtitle: 'Good for getting started',
        description: 'Basic profile visibility and standard support.',
        highlights: [
            'Apply to standard job opportunities',
            'Basic profile visibility',
            'Email support',
        ],
    },
    PRO: {
        title: 'Maritime Premium',
        subtitle: 'Best for active professionals',
        description: 'Boosted visibility, priority support, and premium badge.',
        highlights: [
            'Unlimited job applications',
            'Priority profile visibility',
            'Featured in searches',
            'Priority support',
        ],
    },
};

const formatPrice = (plan) => {
    const price = Number(plan?.price || 0);
    if (price <= 0) return 'Free';
    return `${plan?.currency || ''}${plan?.currency ? ' ' : ''}${price.toFixed(2)}`;
};

const ManageSubscription = () => {
    const navigate = useNavigate();
    const [membership, setMembership] = useState(null);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadMembership = async () => {
            try {
                setIsLoading(true);
                const response = await authService.getMembership();
                const payload = response?.data?.membership || response?.membership || null;

                if (!mounted) return;

                setMembership(payload);
                setPlans(Array.isArray(payload?.plans) ? payload.plans : []);
            } catch (error) {
                if (!mounted) return;
                toast.error(error.message || 'Failed to load membership details', {
                    position: 'top-right',
                });
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadMembership();

        return () => {
            mounted = false;
        };
    }, []);

    const activeTier = membership?.tier || 'FREE';
    const activePlan = useMemo(() => {
        if (plans.length === 0) return null;
        return plans.find((plan) => plan.id === activeTier) || plans[0];
    }, [plans, activeTier]);

    const handleUpdatePlan = async (tier) => {
        if (!tier || tier === activeTier) {
            navigate('/personal/profile');
            return;
        }

        try {
            setIsUpdating(true);
            const response = await authService.updateMembership(tier);
            const nextMembership = response?.data?.membership || response?.membership || null;
            setMembership((prev) => ({
                ...(prev || {}),
                ...(nextMembership || { tier }),
                tier,
            }));
            toast.success('Subscription updated successfully', { position: 'top-right' });
            navigate('/personal/profile');
        } catch (error) {
            toast.error(error.message || 'Failed to update membership', { position: 'top-right' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate('/personal/profile');
    };

    const benefits = PLAN_DETAILS[activeTier]?.highlights || PLAN_DETAILS.FREE.highlights;

    return (
        <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center py-20 px-4 sm:px-8 bg-gray-50">
            <Toaster />
            <div className="absolute top-6 left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 my-auto">
                <button
                    onClick={() => navigate('/personal/profile')}
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
                        <div className="bg-blue-900 rounded-xl p-6 text-white mb-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Crown size={24} />
                                    <div>
                                        <div className="text-lg font-medium">{activePlan?.name || PLAN_DETAILS[activeTier]?.title || 'Free'}</div>
                                        <div className="text-sm opacity-90">
                                            {PLAN_DETAILS[activeTier]?.subtitle || 'Your current membership plan'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">
                                        {activePlan ? formatPrice(activePlan) : 'Free'}
                                    </div>
                                    <div className="text-sm opacity-90">
                                        / {activePlan?.interval || 'month'}
                                    </div>
                                </div>
                            </div>
                            {membership?.membershipUpdatedAt && (
                                <div className="mt-4 text-xs opacity-80">
                                    Updated {new Date(membership.membershipUpdatedAt).toLocaleString()}
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm text-gray-500 mb-4">What this plan gives you</h3>
                            <div className="space-y-3">
                                {benefits.map((benefit) => (
                                    <div key={benefit} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-1">{benefit}</h4>
                                        <p className="text-sm text-gray-500">
                                            {activeTier === 'PRO'
                                                ? 'Premium professionals receive higher visibility and faster responses.'
                                                : 'Upgrade to unlock premium visibility and priority support.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {plans.map((plan) => {
                                const isCurrent = plan.id === activeTier;
                                const details = PLAN_DETAILS[plan.id] || PLAN_DETAILS.FREE;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-2xl border p-5 ${isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                                                <p className="text-sm text-gray-500">{details.description}</p>
                                            </div>
                                            {isCurrent && (
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                                    Current Plan
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-3xl font-bold text-gray-900">{formatPrice(plan)}</div>
                                            <div className="text-sm text-gray-500">per {plan.interval || 'month'}</div>
                                        </div>

                                        <ul className="space-y-2 mb-5">
                                            {details.highlights.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpdatePlan(plan.id)}
                                            disabled={isUpdating}
                                            className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${isCurrent
                                                    ? 'bg-gray-900 text-white cursor-default'
                                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                                                }`}
                                        >
                                            {isUpdating && !isCurrent ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : isCurrent ? (
                                                'Current Plan'
                                            ) : (
                                                'Select Plan'
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageSubscription;
