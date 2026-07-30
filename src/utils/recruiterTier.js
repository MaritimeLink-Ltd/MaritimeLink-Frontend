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
 * @param {boolean} [params.hasAnyActiveFlexListing] - recruiter has a live Flex listing on ANY job
 */
export function getRecruiterFeatureAccess({ recruiterTier, job, hasAnyActiveFlexListing } = {}) {
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
    // Per the pricing doc, Flex scopes the Document Wallet to "candidates who applied to
    // that vacancy", but View Resume carries no such restriction — so it unlocks off any
    // currently-active Flex listing, not just this job's.
    const anyFlexActive = Boolean(hasAnyActiveFlexListing) || jobFlexActive;

    return {
        unlimitedApplications: jobFlexActive,
        smartMatching: jobFlexActive,
        inviteCandidates: jobFlexActive,
        viewResume: anyFlexActive,
        viewDocumentWallet: jobFlexActive,
        directMessagingBeforeApplication: false,
        csvExport: false,
        premiumBadge: false,
        priorityListing: false,
    };
}
