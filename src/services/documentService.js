/**
 * Document API Service
 * Handles all document-related API calls for professional document wallet
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class DocumentService {
    /**
     * Upload a new document
     * POST /api/professional/documents/upload
     * @param {Object} uploadData
     * @param {File} uploadData.file
     * @param {string} uploadData.category
     * @param {string} uploadData.name
     * @param {string} [uploadData.number]
     * @param {string} [uploadData.issuingCountry]
     * @param {string} [uploadData.issueDate]
     * @param {string} [uploadData.expiryDate]
     * @returns {Promise<Object>} Upload response
     */
    async uploadDocument(uploadData) {
        try {
            const formData = new FormData();
            formData.append('document', uploadData.file);
            formData.append('category', uploadData.category || '');
            formData.append('name', uploadData.name || '');
            // Keep all multipart keys present to match backend contract.
            formData.append('number', uploadData.number || '');
            formData.append('issuingCountry', uploadData.issuingCountry || '');
            formData.append('issueDate', uploadData.issueDate || '');
            formData.append('expiryDate', uploadData.expiryDate || '');

            const response = await httpClient.request(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
                method: 'POST',
                body: formData,
            });

            return response;
        } catch (error) {
            console.error('Document upload error:', error);
            throw error;
        }
    }

    /**
     * Get list of documents, optionally filtered by category
     * GET /api/professional/documents
     * @param {string} [category] - Optional category filter
     * @returns {Promise<Object>} List of documents
     */
    async getDocuments(category = '') {
        try {
            const endpoint = category 
                ? `${API_ENDPOINTS.DOCUMENTS.LIST}?category=${encodeURIComponent(category)}`
                : API_ENDPOINTS.DOCUMENTS.LIST;
                
            const response = await httpClient.get(endpoint);
            return response;
        } catch (error) {
            console.error('Fetch documents error:', error);
            throw error;
        }
    }

    /**
     * Update an existing document
     * PATCH /api/professional/documents/{id}
     * @param {string} id - Document ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Update response
     */
    async updateDocument(id, updateData) {
        try {
            if (!id) throw new Error("Document ID is required for update.");
            const response = await httpClient.patch(API_ENDPOINTS.DOCUMENTS.UPDATE(id), updateData);
            return response;
        } catch (error) {
            console.error('Update document error:', error);
            throw error;
        }
    }

    /**
     * Replace the file for an existing document (keeps metadata).
     * PATCH /api/professional/documents/{id}/file
     * @param {string} id
     * @param {File} file
     */
    async replaceDocumentFile(id, file) {
        try {
            if (!id) throw new Error('Document ID is required to replace file.');
            if (!file) throw new Error('A file is required to replace the document.');

            const formData = new FormData();
            formData.append('document', file);

            return await httpClient.patch(API_ENDPOINTS.DOCUMENTS.REPLACE_FILE(id), formData);
        } catch (error) {
            console.error('Replace document file error:', error);
            throw error;
        }
    }

    /**
     * Delete a document
     * DELETE /api/professional/documents/{id}
     * @param {string} id - Document ID
     * @returns {Promise<Object>} Delete response
     */
    async deleteDocument(id) {
        try {
            if (!id) throw new Error("Document ID is required for deletion.");
            const response = await httpClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id));
            return response;
        } catch (error) {
            console.error('Delete document error:', error);
            throw error;
        }
    }

    async markReportGenerated() {
        return httpClient.post(API_ENDPOINTS.DOCUMENTS.MARK_REPORT_GENERATED, {});
    }

    async createShareLink() {
        return httpClient.post(API_ENDPOINTS.DOCUMENTS.CREATE_SHARE_LINK, {});
    }

    /**
     * Public: list documents for a share token (no auth).
     */
    async getSharedDocumentPack(shareToken) {
        if (!shareToken) throw new Error('Share token is required');
        return httpClient.get(API_ENDPOINTS.DOCUMENTS.SHARED_PACK(shareToken), {
            skipAuth: true,
        });
    }
}

// Create and export a singleton instance
const documentService = new DocumentService();
export default documentService;
