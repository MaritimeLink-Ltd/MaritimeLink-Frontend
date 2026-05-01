/**
 * HTTP Client Utility
 * A lightweight fetch wrapper for making API calls
 */

import { API_CONFIG } from '../config/api.config';
import { expireSessionAndRedirect, isAuthTokenExpired } from './sessionManager';

class HttpClient {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    /**
     * Create request headers
     */
    createHeaders(customHeaders = {}, includeAuth = true) {
        const headers = {
            ...API_CONFIG.HEADERS,
            ...customHeaders,
        };

        // Add authorization token if available and the request allows it
        const token = localStorage.getItem('authToken');
        if (includeAuth && token) {
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

        if (response.status === 401) {
            const token = localStorage.getItem('authToken');
            // Only tear down the session when the client can tell the token is gone or expired.
            // Some APIs return 401 for "forbidden for this role" while the JWT is still valid; treating
            // that as a global logout was logging admins out when using chat and similar endpoints.
            const shouldInvalidateSession = !token || isAuthTokenExpired(token);

            if (shouldInvalidateSession) {
                const message = expireSessionAndRedirect();
                const error = new Error(message);
                error.status = 401;
                error.data = data;
                throw error;
            }

            const apiMessage =
                (typeof data === 'object' && data !== null
                    ? data.message || data.error || data.msg
                    : null) ||
                (typeof data === 'string' ? data : null) ||
                'You are not authorized to perform this action.';
            const error = new Error(apiMessage);
            error.status = 401;
            error.data = data;
            throw error;
        }

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
        const includeAuth = options.skipAuth !== true;

        const token = localStorage.getItem('authToken');
        if (includeAuth && token && isAuthTokenExpired(token)) {
            const message = expireSessionAndRedirect();
            throw new Error(message);
        }

        // Check if body is FormData - if so, don't set Content-Type header
        const isFormData = options.body instanceof FormData;

        let headers;
        if (isFormData) {
            // For FormData, only add authorization, let browser set Content-Type with boundary
            const token = localStorage.getItem('authToken');
            headers = includeAuth && token ? { 'Authorization': `Bearer ${token}` } : {};
        } else {
            headers = this.createHeaders(options.headers, includeAuth);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                skipAuth: undefined,
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
