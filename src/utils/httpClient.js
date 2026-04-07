/**
 * HTTP Client Utility
 * A lightweight fetch wrapper for making API calls
 */

import { API_CONFIG } from '../config/api.config';

class HttpClient {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    /**
     * Create request headers
     */
    createHeaders(customHeaders = {}) {
        const headers = {
            ...API_CONFIG.HEADERS,
            ...customHeaders,
        };

        // Add authorization token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const error = new Error(data.message || 'An error occurred');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * Make HTTP request with timeout
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Check if body is FormData - if so, don't set Content-Type header
        const isFormData = options.body instanceof FormData;

        let headers;
        if (isFormData) {
            // For FormData, only add authorization, let browser set Content-Type with boundary
            const token = localStorage.getItem('authToken');
            headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        } else {
            headers = this.createHeaders(options.headers);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return await this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data, options = {}) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }
}

// Create and export a singleton instance
const httpClient = new HttpClient();
export default httpClient;
