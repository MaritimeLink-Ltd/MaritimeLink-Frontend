import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import recruiterSettingsService from '../services/recruiterSettingsService';
import RecruiterUpgradeModal from '../components/modals/RecruiterUpgradeModal';
import { getRecruiterFeatureAccess, isPremiumRecruiterTier } from '../utils/recruiterTier';

const RecruiterSubscriptionContext = createContext(null);

export function RecruiterSubscriptionProvider({ children }) {
    const [tier, setTier] = useState('FREE');
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, featureLabel: '', jobId: null });

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await recruiterSettingsService.getMembership();
            const membership = response?.data?.membership || response?.membership || null;
            setTier(membership?.tier || 'FREE');
        } catch (error) {
            console.error('Failed to load recruiter membership:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const openUpgradeModal = useCallback((featureLabel, jobId) => {
        setModalState({ isOpen: true, featureLabel, jobId });
    }, []);

    const closeUpgradeModal = useCallback(() => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const value = useMemo(
        () => ({
            tier,
            isPremium: isPremiumRecruiterTier(tier),
            isLoading,
            refresh,
            openUpgradeModal,
        }),
        [tier, isLoading, refresh, openUpgradeModal],
    );

    return (
        <RecruiterSubscriptionContext.Provider value={value}>
            {children}
            <RecruiterUpgradeModal
                isOpen={modalState.isOpen}
                onClose={closeUpgradeModal}
                featureLabel={modalState.featureLabel}
                jobId={modalState.jobId}
            />
        </RecruiterSubscriptionContext.Provider>
    );
}

export function useRecruiterSubscription() {
    return useContext(RecruiterSubscriptionContext);
}

/**
 * Client-side pre-check for a recruiter feature: runs `callback` if allowed,
 * otherwise opens the shared upgrade modal. This is only an optimistic UI
 * check — the backend 403 (with the same feature matrix) is the real gate.
 */
export function useRecruiterSubscriptionGuard() {
    const ctx = useRecruiterSubscription();

    const guardFeature = (featureKey, { job, featureLabel, callback } = {}) => {
        if (!ctx) {
            callback?.();
            return true;
        }

        const access = getRecruiterFeatureAccess({ recruiterTier: ctx.tier, job });
        if (access[featureKey]) {
            callback?.();
            return true;
        }

        ctx.openUpgradeModal(featureLabel, job?.id);
        return false;
    };

    return {
        tier: ctx?.tier || 'FREE',
        isPremium: ctx?.isPremium || false,
        guardFeature,
        openUpgradeModal: ctx?.openUpgradeModal,
    };
}
