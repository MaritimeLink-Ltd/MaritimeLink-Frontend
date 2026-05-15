const normalize = (value) => String(value || '').trim().toUpperCase();

/** Values that refer to admin/OCR verification — not UI expiry labels like "valid" */
const VERIFICATION_STATUS_VALUES = new Set([
    'PENDING',
    'APPROVED',
    'VERIFIED',
    'REJECTED',
    'MISMATCH',
    'SUBMITTED',
    'COMPLETED',
    'PROCESSING',
    'FAILED',
    'DECLINED',
    'DENIED',
    'UNDER_REVIEW',
    'IN_REVIEW',
]);

const toDate = (value) => {
    if (value == null || value === '') return null;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnly) {
            const date = new Date(
                Number(dateOnly[1]),
                Number(dateOnly[2]) - 1,
                Number(dateOnly[3]),
            );
            return Number.isNaN(date.getTime()) ? null : date;
        }
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Support camelCase / snake_case and alternate API field names */
export const readVerificationStatus = (doc = {}) => {
    const direct =
        doc.verificationStatus ??
        doc.verification_status ??
        doc.adminVerificationStatus ??
        doc.admin_verification_status ??
        doc.reviewStatus ??
        doc.review_status ??
        '';

    if (direct) return direct;

    const status = doc.status ?? doc.documentStatus ?? doc.document_status;
    if (status && VERIFICATION_STATUS_VALUES.has(normalize(status))) {
        return status;
    }

    return '';
};

export const readOcrStatus = (doc = {}) =>
    doc.ocrStatus ?? doc.ocr_status ?? doc.ocr?.status ?? '';

export const readExpiryDate = (doc = {}) =>
    doc.expiryDate ??
    doc.expiry_date ??
    doc.validTill ??
    doc.valid_till ??
    doc.expires ??
    doc.expiresAt ??
    doc.expires_at ??
    doc.expirationDate ??
    doc.expiration_date ??
    doc.expireDate ??
    doc.expire_date ??
    null;

/** Days from today (inclusive) within which a document counts as "Expiring Soon" for wallet filters and badges */
export const EXPIRING_SOON_DAYS = 7;

const getExpiryMeta = (expiryDate) => {
    if (!expiryDate) return null;

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

    return null;
};

export const getDocumentStatusMeta = (doc = {}) => {
    let verificationStatus = normalize(readVerificationStatus(doc));
    const ocrStatus = normalize(readOcrStatus(doc));
    const expiryDate = toDate(readExpiryDate(doc));

    if (verificationStatus === 'DECLINED' || verificationStatus === 'DENIED') {
        verificationStatus = 'REJECTED';
    }

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
    const expiryMeta = getExpiryMeta(expiryDate);
    if (expiryMeta) return expiryMeta;

    if (doc.isExpired === true || doc.expired === true) {
        return {
            key: 'expired',
            label: 'Expired',
            color: 'bg-pink-500',
        };
    }

    if (doc.isExpiringSoon === true || doc.expiringSoon === true) {
        return {
            key: 'expiring',
            label: 'Expiring Soon',
            color: 'bg-orange-500',
        };
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

    if (ocrStatus === 'COMPLETED' || verificationStatus === 'SUBMITTED' || verificationStatus === 'PENDING') {
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
