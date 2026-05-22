/**
 * Admin/marketplace job status for lists and detail headers.
 * Flagged is moderation state (isFlagged), separate from lifecycle status (ACTIVE, DRAFT, …).
 */
export function resolveAdminJobDisplay(job) {
    const isFlagged = job?.isFlagged === true || job?.isFlagged === 'true';
    const raw = String(job?.status || '').toUpperCase();

    if (isFlagged) {
        let lifecycleLabel = 'Active';
        if (raw === 'DRAFT') lifecycleLabel = 'Draft';
        else if (raw === 'EXPIRED' || raw === 'REMOVED' || raw === 'FILLED') {
            lifecycleLabel = raw === 'FILLED' ? 'Filled' : 'Closed';
        } else if (raw && raw !== 'ACTIVE') {
            lifecycleLabel = raw.replace(/_/g, ' ');
        }

        return {
            label: 'Flagged',
            className: 'text-red-600 font-semibold',
            badgeClassName: 'bg-red-100 text-red-700',
            isFlagged: true,
            isPublished: raw === 'ACTIVE',
            isClosed: ['EXPIRED', 'FILLED', 'REMOVED'].includes(raw),
            lifecycleLabel,
        };
    }

    if (raw === 'ACTIVE') {
        return {
            label: 'Active',
            className: 'text-green-600',
            badgeClassName: 'bg-green-100 text-green-700',
            isFlagged: false,
            isPublished: true,
            isClosed: false,
            lifecycleLabel: 'Active',
        };
    }
    if (raw === 'DRAFT') {
        return {
            label: 'Draft',
            className: 'text-orange-600',
            badgeClassName: 'bg-gray-100 text-gray-700',
            isFlagged: false,
            isPublished: false,
            isClosed: false,
            lifecycleLabel: 'Draft',
        };
    }
    if (raw === 'EXPIRED' || raw === 'REMOVED' || raw === 'FILLED') {
        const label = raw === 'FILLED' ? 'Filled' : 'Closed';
        return {
            label,
            className: 'text-gray-600',
            badgeClassName: 'bg-red-100 text-red-700',
            isFlagged: false,
            isPublished: false,
            isClosed: true,
            lifecycleLabel: label,
        };
    }

    const fallback = raw ? raw.replace(/_/g, ' ') : '—';
    return {
        label: fallback,
        className: 'text-gray-600',
        badgeClassName: 'bg-gray-100 text-gray-700',
        isFlagged: false,
        isPublished: false,
        isClosed: false,
        lifecycleLabel: fallback,
    };
}

/** @deprecated Use resolveAdminJobDisplay — kept for short label-only call sites */
export function getAdminJobDisplayLabel(job) {
    return resolveAdminJobDisplay(job).label;
}
