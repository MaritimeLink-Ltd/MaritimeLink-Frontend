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
     * Get applicants for a job (Admin)
     * GET /api/admin/jobs/:id/applicants
     * @param {string} id - Job ID
     * @returns {Promise<Object>} e.g. `{ status, results, data: { applicants: [...] } }` (root JSON from httpClient)
     */
    async getAdminJobApplicants(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.ADMIN_APPLICANTS(id));
            return response;
        } catch (error) {
            console.error('Get Admin Job Applicants error:', error);
            throw error;
        }
    }

    /**
     * Get matches for a job (Admin)
     * GET /api/admin/jobs/:id/matches
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response with list of matched candidates
     */
    async getAdminJobMatches(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.ADMIN_MATCHES(id));
            return response;
        } catch (error) {
            console.error('Get Admin Job Matches error:', error);
            throw error;
        }
    }

    /**
     * Send an invitation to a matching professional (Admin)
     * POST /api/admin/jobs/:jobId/invite/:professionalId
     * @param {string} jobId - Job ID
     * @param {string} professionalId - Professional ID
     * @returns {Promise<Object>} Response confirming invitation sent
     */
    async inviteAdminMatch(jobId, professionalId) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.JOBS.ADMIN_INVITE_MATCH(jobId, professionalId), {});
            return response;
        } catch (error) {
            console.error('Invite Admin Match error:', error);
            throw error;
        }
    }

    /**
     * Get all jobs for Professional
     * GET /api/professional/jobs
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Response with paginated list of professional jobs
     */
    async getProfessionalJobs(page = 1, limit = 100) {
        try {
            const params = new URLSearchParams();
            if (page !== null && page !== undefined) params.set('page', String(page));
            if (limit !== null && limit !== undefined) params.set('limit', String(limit));

            const query = params.toString();
            const url = query
                ? `${API_ENDPOINTS.JOBS.PROFESSIONAL_ALL}?${query}`
                : API_ENDPOINTS.JOBS.PROFESSIONAL_ALL;

            const response = await httpClient.get(url);
            return response;
        } catch (error) {
            console.error('Get Professional Jobs error:', error);
            throw error;
        }
    }

    /**
     * Get a single job by ID for Professional
     * GET /api/professional/jobs/:id
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response with professional job detail
     */
    async getProfessionalJobById(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.PROFESSIONAL_DETAIL(id));
            return response;
        } catch (error) {
            console.error('Get Professional Job Detail error:', error);
            throw error;
        }
    }

    /**
     * Upload custom CV for applying to a job
     * POST /api/professional/upload-cv
     * @param {File} file - CV document file
     * @returns {Promise<Object>} Response containing url and documentId
     */
    async uploadCV(file) {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', file.type || 'application/pdf');

            const response = await httpClient.post(API_ENDPOINTS.PROFESSIONAL.UPLOAD_CV, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            console.error('Upload CV error:', error);
            throw error;
        }
    }

    /**
     * Upload custom cover letter for applying to a job
     * POST /api/professional/upload-cover-letter
     * @param {File} file - Cover letter document file
     * @returns {Promise<Object>} Response containing url and documentId
     */
    async uploadCoverLetter(file) {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', file.type || 'application/pdf');

            const response = await httpClient.post(API_ENDPOINTS.PROFESSIONAL.UPLOAD_COVER_LETTER, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            console.error('Upload Cover Letter error:', error);
            throw error;
        }
    }

    /**
     * Apply to a job
     * POST /api/professional/jobs/:id/apply
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application payload containing coverLetter, coverLetterUrl, cvUrl, documentIds
     * @returns {Promise<Object>} Response with application details
     */
    async applyToJob(jobId, applicationData) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.JOBS.APPLY(jobId), applicationData);
            return response;
        } catch (error) {
            console.error('Apply to Job error:', error);
            throw error;
        }
    }

    /**
     * Save a job
     * POST /api/professional/jobs/:id/save
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Response
     */
    async saveJob(jobId) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.JOBS.SAVE(jobId));
            return response;
        } catch (error) {
            console.error('Save Job error:', error);
            throw error;
        }
    }

    /**
     * Get all saved jobs for Professional
     * GET /api/professional/jobs/saved
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Response with paginated list of saved jobs
     */
    async getSavedJobs(page = 1, limit = 10) {
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.JOBS.SAVED_ALL}?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Get Saved Jobs error:', error);
            throw error;
        }
    }

    /**
     * Get all applications for Professional
     * GET /api/professional/applications
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Response with paginated list of applications
     */
    async getApplications(page = 1, limit = 20) {
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.JOBS.APPLICATIONS}?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Get Applications error:', error);
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
     * Get applicants for a job (Recruiter)
     * GET /api/recruiter/jobs/:id/applicants
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response with list of applicants
     */
    async getJobApplicants(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.RECRUITER_APPLICANTS(id));
            return response;
        } catch (error) {
            console.error('Get Job Applicants error:', error);
            throw error;
        }
    }

    /**
     * Get matches for a job (Recruiter)
     * GET /api/recruiter/jobs/:id/matches
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Response with list of matched candidates
     */
    async getJobMatches(id) {
        try {
            const response = await httpClient.get(API_ENDPOINTS.JOBS.RECRUITER_MATCHES(id));
            return response;
        } catch (error) {
            console.error('Get Job Matches error:', error);
            throw error;
        }
    }

    /**
     * Send an invitation to a matching professional
     * POST /api/recruiter/jobs/:jobId/invite/:professionalId
     * @param {string} jobId - Job ID
     * @param {string} professionalId - Professional ID
     * @returns {Promise<Object>} Response confirming invitation sent
     */
    async inviteMatch(jobId, professionalId) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.JOBS.RECRUITER_INVITE_MATCH(jobId, professionalId), {});
            return response;
        } catch (error) {
            console.error('Invite Match error:', error);
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

    /**
     * Update job application status (recruiter owns job, or admin).
     * PATCH /api/recruiter/applicants/:id/status or PATCH /api/admin/applicants/:id/status
     * @param {string} applicationId - Job application row id (not professional id)
     * @param {string} status - ApplicationStatus: APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN
     * @param {{ asAdmin?: boolean }} [options]
     */
    async updateApplicantStatus(applicationId, status, options = {}) {
        try {
            const path = options.asAdmin
                ? API_ENDPOINTS.ADMIN.UPDATE_APPLICANT_STATUS(applicationId)
                : API_ENDPOINTS.RECRUITER.UPDATE_APPLICANT_STATUS(applicationId);
            const response = await httpClient.patch(path, { status });
            return response;
        } catch (error) {
            console.error('Update applicant status error:', error);
            throw error;
        }
    }

    /**
     * Full job-application bundle (CV, cover letter, attached wallet docs, professional, snapshot).
     * GET /api/admin/applicants/:id or GET /api/recruiter/applicants/:id
     * @param {string} applicationId - Job application row id
     * @param {{ asAdmin?: boolean }} [options]
     */
    async getApplicantDetails(applicationId, options = {}) {
        try {
            const path = options.asAdmin
                ? API_ENDPOINTS.ADMIN.APPLICANT_DETAILS(applicationId)
                : API_ENDPOINTS.RECRUITER.APPLICANT_DETAILS(applicationId);
            const response = await httpClient.get(path);
            return response;
        } catch (error) {
            console.error('Get applicant details error:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const jobService = new JobService();
export default jobService;
