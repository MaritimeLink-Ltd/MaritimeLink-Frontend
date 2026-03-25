/**
 * Resume API Service
 * Handles all resume-related API calls for professional resume creation
 * Shared across all profession types: Officer, Rating/Crew, Catering & Medical
 */

import httpClient from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api.config';

class ResumeService {
    /**
     * Get Current Professional's Full Resume
     * GET /api/professional/resume
     * @returns {Promise<Object>}
     */
    async getResume() {
        try {
            const response = await httpClient.get(API_ENDPOINTS.RESUME.GET_RESUME);
            // Handle various response wrappers: { resume: {...} }, { data: {...} }, or direct object
            return response.resume || response.data || response;
        } catch (error) {
            console.error('Fetch Resume error:', error);
            throw error;
        }
    }

    /**
     * Submit or Update the Entire Resume Structure via Bulk API
     * POST/PUT /api/professional/resume
     * @param {Object} allData - The full aggregated state from the dashboard
     * @param {string} method - 'POST' or 'PUT'
     * @returns {Promise<Object>}
     */
    async submitBulkResume(allData, method = 'PUT') {
        try {
            const pi = allData.personalInfo || {};
            const ps = allData.professionalSummary || {};
            const sk = allData.skills || {};
            const lic = allData.licensesEndorsements || {};
            const profLic = allData.professionalLicensesCertificates || {}; // Catering
            const sea = allData.seaServiceLog || {};
            const aca = allData.academicQualifications || {};
            const med = allData.medicalTravelDocs || {};
            const bio = allData.biometricsNextOfKin || {}; 

            const getArray = (arr1, arr2) => {
                if (Array.isArray(arr1) && arr1.length > 0) return arr1;
                if (Array.isArray(arr2) && arr2.length > 0) return arr2;
                return [];
            };

            const payload = {
                personalInfo: {
                    firstName: pi.firstName || '',
                    middleName: pi.middleName || '',
                    lastName: pi.lastName || '',
                    dateOfBirth: pi.dateOfBirth || null,
                    address: pi.streetAddress || '',
                    city: pi.city || '',
                    state: pi.state || '',
                    postcode: pi.zipCode || '',
                    country: pi.country || '',
                    phoneCode: pi.countryCode || '',
                    phoneNumber: pi.contactNumber || '',
                    emailAddress: pi.email || ''
                },
                summary: ps.professionalSummary || ps.summary || '',
                skills: getArray(sk.skills).map(s => ({
                    skillName: s.name || s.skillName,
                    rating: parseInt(s.rating || s.level, 10) || 0
                })),
                licenses: [
                    ...getArray(lic.licenses, profLic.licenses).map(l => ({
                        name: l.licenseName || l.license,
                        number: l.licenseNumber || l.number,
                        country: l.issuingCountry || l.country,
                        issueDate: l.dateOfIssue || l.issueDate || null,
                        expiryDate: l.validTill || l.expiryDate || null,
                        isEndorsement: false,
                        isCertificate: false,
                        capacity: l.capacityRanking || l.capacity || l.rank || ""
                    })),
                    ...getArray(lic.endorsements).map(e => ({
                        name: e.certificateName || e.endorsement || e.licenseName,
                        number: e.certificateNumber || e.number || "N/A",
                        country: e.issuingCountry || e.country,
                        issueDate: e.dateOfIssue || e.issueDate || null,
                        expiryDate: e.validTill || e.expiryDate || null,
                        isEndorsement: true,
                        isCertificate: false
                    })),
                    ...getArray(profLic.certificates).map(c => ({
                        name: c.certificateName || c.licenseName,
                        number: c.certificateNumber || c.number || "N/A",
                        country: c.issuingCountry || c.country,
                        issueDate: c.dateOfIssue || c.issueDate || null,
                        expiryDate: c.validTill || c.expiryDate || null,
                        isEndorsement: false,
                        isCertificate: true
                    }))
                ],
                seaService: getArray(sea.seaServiceLog, sea.seaServiceEntries).map(s => ({
                    companyName: s.companyName || s.company,
                    role: s.role,
                    vesselName: s.vesselName,
                    imoNumber: s.imoNo || s.imoNumber,
                    flag: s.flag,
                    vesselType: s.type || s.vesselType,
                    dwt: s.dwt,
                    meType: s.meType,
                    kwType: s.kwt || s.kw,
                    joiningDate: s.joiningDate || s.signOn || null,
                    tillDate: s.till || s.signOff || s.tillDate || null
                })),
                education: getArray(aca.academic, aca.academicQualifications).map(a => ({
                    qualificationName: a.qualificationName,
                    institution: a.institution,
                    city: a.city || "Unknown",
                    country: a.institutionCountry || a.country,
                    grade: a.grade,
                    startDate: a.startDate || null,
                    endDate: a.endDate || null
                })),
                stcwCertificates: getArray(aca.stcw, aca.stcwCertificates).map(c => ({
                    qualification: c.qualificationName || c.stcwQualification || c.qualification,
                    certificateNumber: c.certificateNumber,
                    issuingCountry: c.issuingCountry,
                    issueDate: c.dateOfIssue || c.issueDate || null,
                    expiryDate: c.validTill || c.expiryDate || null
                })),
                medicalTravelDocuments: [
                    ...getArray(med.medical, med.medicalDocuments).map(m => ({
                        name: m.certificateName || m.name,
                        documentNumber: m.certificateNumber || m.documentNumber,
                        issuingCountry: m.issuingCountry,
                        city: m.city || null,
                        institutionCountry: m.institutionCountry || null,
                        issueDate: m.dateOfIssue || m.issueDate || null,
                        expiryDate: m.validTill || m.expiryDate || null,
                        type: "MEDICAL"
                    })),
                    ...getArray(med.travel, med.travelDocuments).map(t => ({
                        name: t.documentName || t.name,
                        documentNumber: t.documentNumber,
                        issuingCountry: t.issuingCountry,
                        city: t.city || null,
                        institutionCountry: t.institutionCountry || null,
                        issueDate: t.dateOfIssue || t.issueDate || null,
                        expiryDate: t.validTill || t.expiryDate || null,
                        type: "TRAVEL"
                    }))
                ],
                biometrics: {
                    gender: bio.biometricData?.gender ? bio.biometricData.gender.toUpperCase() : null,
                    height: bio.biometricData?.height ? Number(bio.biometricData.height) : null,
                    weight: bio.biometricData?.weight ? Number(bio.biometricData.weight) : null,
                    bmi: bio.biometricData?.bmi ? Number(bio.biometricData.bmi) : null,
                    eyeColor: bio.biometricData?.eyeColor || null,
                    overallSize: bio.biometricData?.overallSize || null,
                    shoeSize: bio.biometricData?.shoeSize || null
                },
                nextOfKin: getArray(bio.nextOfKinList).map(kin => ({
                    name: kin.name,
                    relationship: kin.relationship,
                    countryCode: kin.countryCode,
                    phoneNumber: kin.phone || kin.phoneNumber,
                    email: kin.email || null
                })),
                referees: getArray(bio.refereesList).map(ref => ({
                    name: ref.name,
                    position: ref.position || null,
                    companyName: ref.company || ref.companyName || null,
                    countryCode: ref.countryCode,
                    phoneNumber: ref.phone || ref.phoneNumber,
                    email: ref.email || null
                }))
            };

            const response = method === 'PUT' 
                ? await httpClient.put(API_ENDPOINTS.RESUME.BULK, payload)
                : await httpClient.post(API_ENDPOINTS.RESUME.BULK, payload);
                
            return response;
        } catch (error) {
            console.error(`Bulk Resume ${method} error:`, error);
            throw error;
        }
    }

    /**
     * Step 1 - Update Personal Info
     * PATCH /api/professional/resume/personal-info
     * @param {Object} data - Personal info form data
     * @param {string} data.firstName
     * @param {string} [data.middleName]
     * @param {string} data.lastName
     * @param {string} data.dateOfBirth - Format: YYYY-MM-DD
     * @param {string} data.streetAddress - Mapped to `address`
     * @param {string} data.city
     * @param {string} data.state
     * @param {string} data.zipCode - Mapped to `postcode`
     * @param {string} data.country
     * @param {string} data.countryCode - Mapped to `phoneCode`
     * @param {string} data.contactNumber - Mapped to `phoneNumber`
     * @param {string} data.email - Mapped to `emailAddress`
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async updatePersonalInfo(data) {
        try {
            const payload = {
                firstName: data.firstName,
                middleName: data.middleName || '',
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                address: data.streetAddress || data.address || '',
                city: data.city,
                state: data.state,
                postcode: data.zipCode || data.postcode || '',
                country: data.country,
                phoneCode: data.countryCode || data.phoneCode || '',
                phoneNumber: data.contactNumber || data.phoneNumber || '',
                emailAddress: data.email || data.emailAddress || '',
            };

            const response = await httpClient.patch(API_ENDPOINTS.RESUME.PERSONAL_INFO, payload);
            return response;
        } catch (error) {
            console.error('Resume Personal Info update error:', error);
            throw error;
        }
    }

    /**
     * Step 7 - Update Professional Summary in Resume
     * PATCH /api/professional/resume/summary
     * @param {Object} data - Professional summary form data
     * @param {string} data.professionalSummary - Mapped to `summary`
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async updateSummary(data) {
        try {
            const payload = {
                summary: data.professionalSummary || data.summary || '',
            };

            const response = await httpClient.patch(API_ENDPOINTS.RESUME.SUMMARY, payload);
            return response;
        } catch (error) {
            console.error('Resume Summary update error:', error);
            throw error;
        }
    }

    /**
     * Step 8 - Add a Key Skill
     * POST /api/professional/resume/skills
     * @param {Object} data - Skill data
     * @param {string} data.skillName
     * @param {number} data.rating
     * @returns {Promise<Object>} Response shape: { status, message }
     */
    async addSkill(data) {
        try {
            const response = await httpClient.post(API_ENDPOINTS.RESUME.SKILLS, {
                skillName: data.skillName,
                rating: parseInt(data.rating, 10)
            });
            return response;
        } catch (error) {
            console.error('Resume Skills add error:', error);
            throw error;
        }
    }

    /**
     * Step 9 - Add License or Endorsement
     * POST /api/professional/resume/licenses
     * @param {Object} data
     * @param {string} data.licenseName - Mapped to `name`
     * @param {string} data.licenseNumber - Mapped to `number`
     * @param {string} data.issuingCountry - Mapped to `country`
     * @param {string} data.dateOfIssue - Mapped to `issueDate`
     * @param {string} data.validTill - Mapped to `expiryDate`
     * @param {boolean} data.isEndorsement
     * @returns {Promise<Object>}
     */
    async addLicense(data) {
        try {
            const payload = {
                name: data.licenseName || data.name || data.certificateName,
                number: data.licenseNumber || data.number || data.certificateNumber,
                country: data.issuingCountry || data.country,
                issueDate: data.dateOfIssue || data.issueDate || null,
                expiryDate: data.validTill || data.expiryDate || null,
                isEndorsement: data.isEndorsement || false,
                isCertificate: data.isCertificate || false
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.LICENSES, payload);
            return response;
        } catch (error) {
            console.error('Resume License add error:', error);
            throw error;
        }
    }

    /**
     * Step 10 - Add Sea Service Entry
     * POST /api/professional/resume/sea-service
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    async addSeaServiceEntry(data) {
        try {
            const payload = {
                companyName: data.companyName,
                role: data.role,
                vesselName: data.vesselName,
                imoNumber: data.imoNo,
                flag: data.flag,
                vesselType: data.type,
                dwt: data.dwt,
                meType: data.meType,
                kwType: data.kwt,
                joiningDate: data.joiningDate || null,
                tillDate: data.till || null
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.SEA_SERVICE, payload);
            return response;
        } catch (error) {
            console.error('Resume Sea Service add error:', error);
            throw error;
        }
    }

    /**
     * Step 11a - Add Education Entry (Academic Qualifications)
     * POST /api/professional/resume/education
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async addEducation(data) {
        try {
            const payload = {
                qualificationName: data.qualificationName,
                institution: data.institution,
                city: data.city,
                country: data.institutionCountry,
                grade: data.grade,
                startDate: data.startDate || null,
                endDate: data.endDate || null
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.EDUCATION, payload);
            return response;
        } catch (error) {
            console.error('Resume Education add error:', error);
            throw error;
        }
    }

    /**
     * Step 11b - Add STCW Certificate
     * POST /api/professional/resume/stcw-certificates
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async addStcwCertificate(data) {
        try {
            const payload = {
                qualification: data.qualificationName,
                certificateNumber: data.certificateNumber,
                issuingCountry: data.issuingCountry,
                issueDate: data.dateOfIssue || null,
                expiryDate: data.validTill || null
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.STCW, payload);
            return response;
        } catch (error) {
            console.error('Resume STCW add error:', error);
            throw error;
        }
    }

    /**
     * Step 12 - Add Medical or Travel Document
     * POST /api/professional/resume/medical-travel-documents
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async addMedicalTravelDocument(data) {
        try {
            const payload = {
                name: data.certificateName || data.documentName,
                documentNumber: data.certificateNumber || data.documentNumber,
                issuingCountry: data.issuingCountry || '',
                city: data.city || '',
                institutionCountry: data.institutionCountry || '',
                issueDate: data.dateOfIssue || '',
                expiryDate: data.validTill || '',
                type: data.type // 'MEDICAL' or 'TRAVEL'
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.MEDICAL_TRAVEL_DOCS, payload);
            return response;
        } catch (error) {
            console.error('Resume Medical/Travel Document add error:', error);
            throw error;
        }
    }

    /**
     * Step 13 - Update Biometrics
     * PATCH /api/professional/resume/biometrics
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async updateBiometrics(data) {
        try {
            const payload = {
                gender: data.gender ? data.gender.toUpperCase() : null,
                height: data.height ? Number(data.height) : null,
                weight: data.weight ? Number(data.weight) : null,
                bmi: data.bmi ? Number(data.bmi) : null,
                eyeColor: data.eyeColor || null,
                overallSize: data.overallSize || null,
                shoeSize: data.shoeSize || null
            };

            const response = await httpClient.patch(API_ENDPOINTS.RESUME.BIOMETRICS, payload);
            return response;
        } catch (error) {
            console.error('Resume Biometrics update error:', error);
            throw error;
        }
    }

    /**
     * Step 14 - Add Next of Kin
     * POST /api/professional/resume/next-of-kin
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async addNextOfKin(data) {
        try {
            const payload = {
                name: data.name,
                relationship: data.relationship,
                countryCode: data.countryCode,
                phoneNumber: data.phone,
                email: data.email || null
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.NEXT_OF_KIN, payload);
            return response;
        } catch (error) {
            console.error('Resume Next of Kin add error:', error);
            throw error;
        }
    }

    /**
     * Step 15 - Add Referee
     * POST /api/professional/resume/referees
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async addReferee(data) {
        try {
            const payload = {
                name: data.name,
                position: data.position || null,
                companyName: data.company || null,
                countryCode: data.countryCode,
                phoneNumber: data.phone,
                email: data.email || null
            };

            const response = await httpClient.post(API_ENDPOINTS.RESUME.REFEREES, payload);
            return response;
        } catch (error) {
            console.error('Resume Referee add error:', error);
            throw error;
        }
    }
    /**
     * Map API GET response → Officer Dashboard allData shape
     */
    mapApiToOfficerData(api) {
        const pi = api.personalInfo || {};
        const licenses = (api.licenses || []).filter(l => !l.isEndorsement && !l.isCertificate);
        const endorsements = (api.licenses || []).filter(l => l.isEndorsement);
        const medDocs = (api.medicalTravelDocuments || []).filter(d => d.type === 'MEDICAL');
        const travelDocs = (api.medicalTravelDocuments || []).filter(d => d.type === 'TRAVEL');
        const bio = api.biometrics || {};

        return {
            personalInfo: {
                firstName: pi.firstName || '',
                middleName: pi.middleName || '',
                lastName: pi.lastName || '',
                dateOfBirth: pi.dateOfBirth || '',
                streetAddress: pi.address || '',
                city: pi.city || '',
                state: pi.state || '',
                zipCode: pi.postcode || '',
                country: pi.country || '',
                countryCode: pi.phoneCode || '',
                contactNumber: pi.phoneNumber || '',
                email: pi.emailAddress || ''
            },
            professionalSummary: { professionalSummary: api.summary || '' },
            skills: {
                skills: (api.skills || []).map(s => ({
                    name: s.skillName, level: s.rating, id: Date.now() + Math.random()
                }))
            },
            licensesEndorsements: {
                licenses: licenses.map(l => ({
                    licenseName: l.name, licenseNumber: l.number,
                    issuingCountry: l.country, dateOfIssue: l.issueDate,
                    validTill: l.expiryDate, id: Date.now() + Math.random()
                })),
                endorsements: endorsements.map(e => ({
                    licenseName: e.name, licenseNumber: e.number,
                    issuingCountry: e.country, dateOfIssue: e.issueDate,
                    validTill: e.expiryDate, id: Date.now() + Math.random()
                }))
            },
            seaServiceLog: {
                seaServiceEntries: (api.seaService || []).map(s => ({
                    companyName: s.companyName, role: s.role, vesselName: s.vesselName,
                    imoNo: s.imoNumber, flag: s.flag, type: s.vesselType,
                    dwt: s.dwt, meType: s.meType, kwt: s.kwType,
                    joiningDate: s.joiningDate, till: s.tillDate,
                    id: Date.now() + Math.random()
                }))
            },
            academicQualifications: {
                academicQualifications: (api.education || []).map(a => ({
                    qualificationName: a.qualificationName, institution: a.institution,
                    city: a.city, institutionCountry: a.country, grade: a.grade,
                    startDate: a.startDate, endDate: a.endDate,
                    id: Date.now() + Math.random()
                })),
                stcwCertificates: (api.stcwCertificates || []).map(c => ({
                    qualificationName: c.qualification, certificateNumber: c.certificateNumber,
                    issuingCountry: c.issuingCountry, dateOfIssue: c.issueDate,
                    validTill: c.expiryDate, id: Date.now() + Math.random()
                }))
            },
            medicalTravelDocs: {
                medicalDocuments: medDocs.map(m => ({
                    certificateName: m.name, certificateNumber: m.documentNumber,
                    issuingCountry: m.issuingCountry, city: m.city || '',
                    institutionCountry: m.institutionCountry || '',
                    dateOfIssue: m.issueDate, validTill: m.expiryDate,
                    id: Date.now() + Math.random()
                })),
                travelDocuments: travelDocs.map(t => ({
                    documentName: t.name, documentNumber: t.documentNumber,
                    issuingCountry: t.issuingCountry,
                    dateOfIssue: t.issueDate, validTill: t.expiryDate,
                    id: Date.now() + Math.random()
                }))
            },
            biometricsNextOfKin: {
                biometricData: {
                    gender: bio.gender || 'Male', height: bio.height || '',
                    weight: bio.weight || '', bmi: bio.bmi || '',
                    eyeColor: bio.eyeColor || '', overallSize: bio.overallSize || '',
                    shoeSize: bio.shoeSize || ''
                },
                nextOfKinList: (api.nextOfKin || []).map(k => ({
                    name: k.name, relationship: k.relationship,
                    countryCode: k.countryCode || '+44', phone: k.phone || k.phoneNumber || '',
                    email: k.email || '', id: Date.now() + Math.random()
                })),
                refereesList: (api.referees || []).map(r => ({
                    name: r.name, position: r.position || '', company: r.company || '',
                    countryCode: r.countryCode || '+44', phone: r.phone || r.phoneNumber || '',
                    email: r.email || '', id: Date.now() + Math.random()
                }))
            }
        };
    }

    /**
     * Map API GET response → Ratings Dashboard allData shape
     */
    mapApiToRatingsData(api) {
        const officer = this.mapApiToOfficerData(api);
        // Ratings has no licensesEndorsements key
        const { licensesEndorsements, ...rest } = officer;
        return rest;
    }

    /**
     * Map API GET response → Catering Dashboard allData shape
     */
    mapApiToCateringData(api) {
        const officer = this.mapApiToOfficerData(api);
        const licenses = (api.licenses || []).filter(l => !l.isEndorsement && !l.isCertificate);
        const certificates = (api.licenses || []).filter(l => l.isCertificate);

        const { licensesEndorsements, ...rest } = officer;
        return {
            ...rest,
            professionalLicensesCertificates: {
                licenses: licenses.map(l => ({
                    licenseName: l.name, licenseNumber: l.number,
                    issuingCountry: l.country, dateOfIssue: l.issueDate,
                    validTill: l.expiryDate, id: Date.now() + Math.random()
                })),
                certificates: certificates.map(c => ({
                    licenseName: c.name, licenseNumber: c.number,
                    issuingCountry: c.country, dateOfIssue: c.issueDate,
                    validTill: c.expiryDate, id: Date.now() + Math.random()
                }))
            }
        };
    }
}

// Create and export a singleton instance
const resumeService = new ResumeService();
export default resumeService;
