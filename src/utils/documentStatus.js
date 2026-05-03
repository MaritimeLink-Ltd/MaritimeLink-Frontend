const normalize = (value) => String(value || '').trim().toUpperCase();

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const getDocumentStatusMeta = (doc = {}) => {
    const verificationStatus = normalize(doc.verificationStatus);
    const ocrStatus = normalize(doc.ocrStatus);
    const expiryDate = toDate(doc.expiryDate);

    if (verificationStatus === 'MISMATCH') {
        return {
            key: 'mismatch',
            label: 'Needs Review',
            color: 'bg-red-500',
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

    if (ocrStatus === 'FAILED') {
        return {
            key: 'ocr-failed',
            label: 'OCR Failed',
            color: 'bg-red-500',
        };
    }

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

        if (daysUntilExpiry <= 60) {
            return {
                key: 'expiring',
                label: 'Expiring Soon',
                color: 'bg-orange-500',
            };
        }
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
        label: 'Pending',
        color: 'bg-yellow-500',
    };
};
