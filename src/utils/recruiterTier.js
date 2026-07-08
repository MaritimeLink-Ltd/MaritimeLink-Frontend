export function isPremiumRecruiterTier(value) {
    return String(value || '').trim().toUpperCase() === 'PREMIUM';
}

export function isFlexJobActive(job) {
    if (!job?.isPremiumListing || !job?.premiumListingExpiresAt) return false;
    return new Date(job.premiumListingExpiresAt).getTime() > Date.now();
}

/** Mirrors the backend's getRecruiterFeatureAccess matrix for optimistic UI gating. */
export function getRecruiterFeatureAccess({ recruiterTier, job } = {}) {
    const isPremium = isPremiumRecruiterTier(recruiterTier);

    if (isPremium) {
        return {
            unlimitedApplications: true,
            smartMatching: true,
            inviteCandidates: true,
            viewResume: true,
            viewDocumentWallet: true,
            directMessagingBeforeApplication: true,
            csvExport: true,
            premiumBadge: true,
            priorityListing: true,
        };
    }

    const flexActive = isFlexJobActive(job);

    return {
        unlimitedApplications: flexActive,
        smartMatching: flexActive,
        inviteCandidates: flexActive,
        viewResume: flexActive,
        viewDocumentWallet: flexActive,
        directMessagingBeforeApplication: false,
        csvExport: false,
        premiumBadge: false,
        priorityListing: false,
    };
}
