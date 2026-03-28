/**
 * Professional KYC API Service
 * Handles KYC-related API calls for professionals
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/** API expects these exact enum strings (see professional KYC submit schema). */
const API_DOCUMENT_TYPES = ['PASSPORT', 'DRIVING_LICENSE', 'NATIONAL_ID', 'RESIDENCE_PERMIT'];

const SLUG_TO_API_DOCUMENT_TYPE = {
    passport: 'PASSPORT',
    'driving-license': 'DRIVING_LICENSE',
    'national-id': 'NATIONAL_ID',
    'residence-permit': 'RESIDENCE_PERMIT',
};

/**
 * Maps UI / OCR document type strings to API enum values.
 * @param {string} [raw]
 * @returns {string}
 */
export function mapKycDocumentTypeToApi(raw) {
    if (raw == null || typeof raw !== 'string') return 'PASSPORT';
    const trimmed = raw.trim();
    if (!trimmed) return 'PASSPORT';
    if (SLUG_TO_API_DOCUMENT_TYPE[trimmed]) return SLUG_TO_API_DOCUMENT_TYPE[trimmed];
    const normalized = trimmed.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_');
    if (API_DOCUMENT_TYPES.includes(normalized)) return normalized;
    return normalized;
}

class KycService {
    /**
     * Step 1a - Upload Identity Document (Front)
     * @param {File} document - Identity document file (front side)
     * @returns {Promise<Object>} Upload response with extraction results
     */
    async uploadFrontDocument(document) {
        try {
            const formData = new FormData();
            formData.append('document', document);

            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.KYC_UPLOAD_FRONT, {
                method: 'POST',
                body: formData,
            });

            return response;
        } catch (error) {
            console.error('KYC Upload Front Document error:', error);
            throw error;
        }
    }

    /**
     * Step 1b - Upload Identity Document (Back)
     * @param {File} document - Identity document file (back side)
     * @returns {Promise<Object>} Upload response with URLs
     */
    async uploadBackDocument(document) {
        try {
            const formData = new FormData();
            formData.append('document', document);

            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.KYC_UPLOAD_BACK, {
                method: 'POST',
                body: formData,
            });

            return response;
        } catch (error) {
            console.error('KYC Upload Back Document error:', error);
            throw error;
        }
    }

    /**
     * Step 2 - Submit Personal Details & Document URL
     * @param {Object} data - KYC details
     * @param {string} data.professionalId
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.dateOfBirth
     * @param {string} data.documentType
     * @param {string} data.documentNumber
     * @param {string} data.expiryDate
     * @param {string} data.issueCountry
     * @param {string} data.documentUrl
     * @returns {Promise<Object>} Verification response
     */
    async submitKycDetails(data) {
        try {
            const payload = {
                ...data,
                documentType: mapKycDocumentTypeToApi(data.documentType),
            };
            // FIX #7: Use httpClient.request consistently with all other methods.
            // The original httpClient.post() call may bypass auth header injection,
            // error normalization, or retry logic that httpClient.request provides,
            // leading to mismatched error shapes and inconsistent token handling.
            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.KYC_SUBMIT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            return response;
        } catch (error) {
            console.error('KYC Submit Details error:', error);
            throw error;
        }
    }

    /**
     * Step 3 - Upload Selfie
     * @param {string} professionalId - Professional ID
     * @param {File} selfie - Selfie image file
     * @returns {Promise<Object>} Response indicating success
     */
    async uploadSelfie(professionalId, selfie) {
        try {
            const formData = new FormData();
            formData.append('professionalId', professionalId);
            formData.append('selfie', selfie);

            const response = await httpClient.request(API_ENDPOINTS.PROFESSIONAL.KYC_UPLOAD_SELFIE, {
                method: 'POST',
                body: formData,
            });

            return response;
        } catch (error) {
            console.error('KYC Upload Selfie error:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const kycService = new KycService();
export default kycService;