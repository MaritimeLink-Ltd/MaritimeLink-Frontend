/**
 * Job API Service
 * Handles all job-related API calls (create, list, update, delete)
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Maps UI category labels to API enum values.
 * The API expects: OFFICER, RATINGS_AND_CREW, CATERING_AND_MEDICAL
 */
const CATEGORY_TO_API = {
    'Officer': 'OFFICER',
    'Ratings & Crew': 'RATINGS_AND_CREW',
    'Catering & Medical': 'CATERING_AND_MEDICAL',
};

/**
 * Maps UI contract type labels to API enum values.
 * The API expects: TEMPORARY, CONTRACT, PERMANENT
 */
const CONTRACT_TYPE_TO_API = {
    'Temporary': 'TEMPORARY',
    'Contract': 'CONTRACT',
    'Permanent': 'PERMANENT',
};

class JobService {
    /**
     * Create a new job listing
     * POST /api/jobs
     * @param {Object} jobData - Job creation data
     * @param {string} jobData.title - Job title
     * @param {string} jobData.location - Job location / region
     * @param {string} jobData.category - Category (Officer, Ratings & Crew, Catering & Medical)
     * @param {string} jobData.contractType - Contract type (Temporary, Contract, Permanent)
     * @param {string} jobData.salary - Salary amount
     * @param {string} jobData.description - Job description
     * @param {string} [jobData.closingDate] - Optional closing date (YYYY-MM-DD)
     * @returns {Promise<Object>} Response shape: { status, data: { job: {...} } }
     */
    async createJob(jobData) {
        try {
            const payload = {
                title: jobData.title,
                location: jobData.location,
                category: CATEGORY_TO_API[jobData.category] || jobData.category,
                contractType: CONTRACT_TYPE_TO_API[jobData.contractType] || jobData.contractType,
                salary: jobData.salary,
                description: jobData.description,
            };

            // Only include closingDate if it has a value
            if (jobData.closingDate) {
                payload.closingDate = jobData.closingDate;
            }

            const response = await httpClient.post(API_ENDPOINTS.JOBS.CREATE, payload);
            return response;
        } catch (error) {
            console.error('Create Job error:', error);
            throw error;
        }
    }

    /**
     * Get list of jobs
     * GET /api/jobs
     * @returns {Promise<Object>} Response with list of jobs
     */
    async getJobs() {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.LIST);
            return response;
        } catch (error) {
            console.error('Get Jobs error:', error);
            throw error;
        }
    }

    /**
     * Get list of jobs for the current user
     * GET /api/jobs/my
     * @returns {Promise<Object>} Response with list of my jobs
     */
    async getMyJobs() {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.MY);
            return response;
        } catch (error) {
            console.error('Get My Jobs error:', error);
            throw error;
        }
    }

    /**
     * Get all jobs for Admin
     * GET /api/admin/jobs
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Response with paginated list of all jobs
     */
    async getAllAdminJobs(page = 1, limit = 10) {
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.JOBS.ADMIN_ALL}?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Get All Admin Jobs error:', error);
            throw error;
        }
    }

    /**
     * Get a single job by ID
     * GET /api/jobs/:id
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response with job detail
     */
    async getJobById(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.DETAIL(id));
            return response;
        } catch (error) {
            console.error('Get Job Detail error:', error);
            throw error;
        }
    }

    /**
     * Update an existing job
     * PUT /api/jobs/:id
     * @param {string} id - Job ID
     * @param {Object} jobData - Updated job data
     * @returns {Promise<Object>} Response with updated job
     */
    async updateJob(id, jobData) {
        try {
            const payload = {
                title: jobData.title,
                location: jobData.location,
                category: CATEGORY_TO_API[jobData.category] || jobData.category,
                contractType: CONTRACT_TYPE_TO_API[jobData.contractType] || jobData.contractType,
                salary: jobData.salary,
                description: jobData.description,
            };

            if (jobData.closingDate) {
                payload.closingDate = jobData.closingDate;
            }

            const response = await httpClient.patch(API_ENDPOINTS.JOBS.UPDATE(id), payload);
            return response;
        } catch (error) {
            console.error('Update Job error:', error);
            throw error;
        }
    }

    /**
     * Delete a job
     * DELETE /api/jobs/:id
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response confirming deletion
     */
    async deleteJob(id) {
        try {
            const response = await httpClient.delete(API_ENDPOINTS.JOBS.DELETE(id));
            return response;
        } catch (error) {
            console.error('Delete Job error:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const jobService = new JobService();
export default jobService;
