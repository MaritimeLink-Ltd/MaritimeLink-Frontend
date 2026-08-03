export function isPremiumRecruiterTier(value) {
    return String(value || '').trim().toUpperCase() === 'PREMIUM';
}

export function isFlexJobActive(job) {
    if (!job?.isPremiumListing || !job?.premiumListingExpiresAt) return false;
    return new Date(job.premiumListingExpiresAt).getTime() > Date.now();
}

/**
 * Mirrors the backend's getRecruiterFeatureAccess matrix for optimistic UI gating.
 * Keep in step with `src/utils/recruiterCapabilities.ts` — the backend is the real gate.
 *
 * @param {object}  params
 * @param {string}  params.recruiterTier
 * @param {object}  [params.job] - the job in context, for per-listing Flex perks
 * @param {boolean} [params.candidateMatchedToActiveFlexListing] - the platform matched this
 *        candidate to one of the recruiter's paid Flex listings (server-computed)
 */
export function getRecruiterFeatureAccess({ recruiterTier, job, candidateMatchedToActiveFlexListing } = {}) {
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

    const jobFlexActive = isFlexJobActive(job);

    return {
        unlimitedApplications: jobFlexActive,
        smartMatching: jobFlexActive,
        inviteCandidates: jobFlexActive,
        // Flex reaches a candidate only through a paid listing: they applied to it, or
        // the platform matched them to it. Browsing the whole pool stays Premium-only.
        viewResume: jobFlexActive || Boolean(candidateMatchedToActiveFlexListing),
        viewDocumentWallet: jobFlexActive,
        directMessagingBeforeApplication: false,
        csvExport: false,
        premiumBadge: false,
        priorityListing: false,
    };
}
