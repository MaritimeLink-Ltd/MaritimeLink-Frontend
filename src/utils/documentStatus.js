const normalize = (value) => String(value || '').trim().toUpperCase();

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Support camelCase / snake_case and occasional enum wrappers from APIs */
const readVerificationStatus = (doc = {}) =>
    doc.verificationStatus ?? doc.verification_status ?? '';

const readOcrStatus = (doc = {}) => doc.ocrStatus ?? doc.ocr_status ?? '';

const readExpiryDate = (doc = {}) => doc.expiryDate ?? doc.expiry_date ?? null;

/** Days from today (inclusive) within which a document counts as "Expiring Soon" for wallet filters and badges */
export const EXPIRING_SOON_DAYS = 7;

export const getDocumentStatusMeta = (doc = {}) => {
    const verificationStatus = normalize(readVerificationStatus(doc));
    const ocrStatus = normalize(readOcrStatus(doc));
    const expiryDate = toDate(readExpiryDate(doc));

    if (verificationStatus === 'MISMATCH') {
        return {
            key: 'mismatch',
            label: 'Needs Review',
            color: 'bg-red-500',
        };
    }

    if (verificationStatus === 'REJECTED') {
        return {
            key: 'rejected',
            label: 'Rejected',
            color: 'bg-red-600',
        };
    }

    // Expiry before "verified" so Expired / Expiring Soon filters work for approved docs
    if (expiryDate) {
        const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilExpiry < 0) {
            return {
                key: 'expired',
                label: 'Expired',
                color: 'bg-pink-500',
            };
        }

        if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
            return {
                key: 'expiring',
                label: 'Expiring Soon',
                color: 'bg-orange-500',
            };
        }
    }

    if (
        verificationStatus === 'APPROVED' ||
        verificationStatus === 'VERIFIED' ||
        verificationStatus === 'COMPLETED'
    ) {
        return {
            key: 'ready',
            label: 'Compliance Ready',
            color: 'bg-emerald-600',
        };
    }

    // OCR still queued / running — not the same as "waiting for admin approval"
    const ocrStillInFlight =
        !ocrStatus || ocrStatus === 'PENDING' || ocrStatus === 'PROCESSING';

    if (ocrStillInFlight) {
        return {
            key: 'processing',
            label: 'Processing',
            color: 'bg-slate-500',
        };
    }

    if (ocrStatus === 'FAILED') {
        return {
            key: 'ocr-failed',
            label: 'OCR Failed',
            color: 'bg-red-500',
        };
    }

    if (ocrStatus === 'COMPLETED') {
        return {
            key: 'pending',
            label: 'Pending Approval',
            color: 'bg-yellow-500',
        };
    }

    return {
        key: 'pending',
        label: 'Pending Approval',
        color: 'bg-yellow-500',
    };
};

/** Wallet filter tab ids used on Documents Wallet */
export const WALLET_STATUS_FILTER_IDS = ['all', 'ready', 'expiring', 'expired', 'rejected'];

/**
 * @param {string} filterId - 'all' | 'ready' | 'expiring' | 'expired' | 'rejected'
 */
export const documentMatchesWalletFilter = (doc, filterId) => {
    if (!filterId || filterId === 'all') return true;
    const meta = getDocumentStatusMeta(doc);
    return meta.key === filterId;
};
