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
            let result = response;
            // Deeply unwrap generic 'data' wrapper
            if (result && result.data) result = result.data;
            
            // The backend returns a mixed structure: Some fields (like firstName, medicalDocuments) are on the root.
            // Other fields (like address, gender, height) are nested inside the 'resume' object.
            // Merge the inner 'resume' object onto the root so the mapper can access everything flatly.
            if (result && result.resume) {
                const innerResume = result.resume;
                result = { ...result, ...innerResume };
                delete result.resume; // Remove the nested object now that it's merged
            }
            
            return result || {};
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
        if (!api) return {};

        const getObj = (obj1, obj2, obj3) => {
            if (obj1 && Object.keys(obj1).length > 0) return obj1;
            if (obj2 && Object.keys(obj2).length > 0) return obj2;
            if (obj3 && Object.keys(obj3).length > 0) return obj3;
            // Fallback to evaluating the root object 'api'
            return api;
        };

        const getArray = (arr1, arr2, arr3) => {
            if (Array.isArray(arr1) && arr1.length > 0) return arr1;
            if (Array.isArray(arr2) && arr2.length > 0) return arr2;
            if (Array.isArray(arr3) && arr3.length > 0) return arr3;
            return [];
        };

        const pi = getObj(api.personalInfo, api.personal_info, null);
        
        const licenses = getArray(api.licenses, api.licenses_endorsements, []).filter(l => !l.isEndorsement);
        const endorsements = getArray(api.licenses, api.licenses_endorsements, []).filter(l => l.isEndorsement);
        
        // Documents can be returned grouped or separated
        const combinedMedDocs = getArray(api.medicalTravelDocuments, api.medical_travel_documents, api.medicalTravelDocs);
        const medDocs = combinedMedDocs.filter(d => d.type === 'MEDICAL').concat(getArray(api.medicalDocuments, api.medical_documents, api.medicalCertificates));
        const travelDocs = combinedMedDocs.filter(d => d.type === 'TRAVEL').concat(getArray(api.travelDocuments, api.travel_documents, []));
        
        const bio = getObj(api.biometrics, api.biometric_data, api.biometricsNextOfKin);

        let firstName = pi.firstName || pi.first_name || '';
        let middleName = pi.middleName || pi.middle_name || '';
        let lastName = pi.lastName || pi.last_name || '';
        let email = pi.email || pi.emailAddress || pi.email_address || '';

        // Fallback to local storage profile if API didn't return names
        if (!firstName && !lastName) {
            try {
                const profileStr = localStorage.getItem('userProfile');
                const emailStr = localStorage.getItem('userEmail');
                if (profileStr) {
                    const profile = JSON.parse(profileStr);
                    let detectedName = profile.firstName || profile.first_name || profile.name || profile.fullName || profile.full_name || '';
                    if (detectedName && detectedName.includes(' ') && !profile.lastName) {
                        const parts = detectedName.split(' ');
                        firstName = parts[0];
                        lastName = parts.slice(1).join(' ');
                    } else {
                        firstName = detectedName;
                        lastName = profile.lastName || profile.last_name || '';
                    }
                    email = email || profile.email || emailStr || '';
                }
            } catch (e) {
                console.error('Failed to parse userProfile fallback', e);
            }
        }
        
        let formattedGender = bio.gender || bio.gender_identity || 'Male';
        if (formattedGender.toLowerCase() === 'male') formattedGender = 'Male';
        else if (formattedGender.toLowerCase() === 'female') formattedGender = 'Female';

        return {
            personalInfo: {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                dateOfBirth: (pi.dateOfBirth || pi.date_of_birth || '').split('T')[0],
                streetAddress: pi.address || pi.street_address || '',
                city: pi.city || '',
                state: pi.state || '',
                zipCode: pi.zipCode || pi.zip_code || pi.postcode || '',
                country: pi.country || '',
                countryCode: pi.countryCode || pi.country_code || pi.phoneCode || pi.phone_code || '+44',
                contactNumber: pi.contactNumber || pi.contact_number || pi.phoneNumber || pi.phone_number || '',
                email: email
            },
            professionalSummary: { professionalSummary: api.summary || api.professional_summary || '' },
            skills: {
                skills: (api.skills || []).map(s => ({
                    name: s.skillName || s.skill_name || s.name, level: s.rating || s.level, id: Date.now() + Math.random()
                }))
            },
            licensesEndorsements: {
                licenses: licenses.map(l => ({
                    licenseName: l.name || l.license_name, licenseNumber: l.number || l.license_number,
                    issuingCountry: l.country || l.issuing_country, dateOfIssue: l.issueDate || l.issue_date,
                    validTill: l.expiryDate || l.expiry_date, id: Date.now() + Math.random()
                })),
                endorsements: endorsements.map(e => ({
                    licenseName: e.name || e.endorsement_name, licenseNumber: e.number || e.endorsement_number || 'N/A',
                    issuingCountry: e.country || e.issuing_country, dateOfIssue: e.issueDate || e.issue_date,
                    validTill: e.expiryDate || e.expiry_date, id: Date.now() + Math.random()
                }))
            },
            seaServiceLog: {
                seaServiceEntries: (api.seaService || api.sea_service || api.seaServiceLog || []).map(s => ({
                    companyName: s.companyName || s.company_name, role: s.role, vesselName: s.vesselName || s.vessel_name,
                    imoNo: s.imoNumber || s.imo_number, flag: s.flag, type: s.vesselType || s.vessel_type,
                    dwt: s.dwt, meType: s.meType || s.me_type, kwt: s.kwType || s.kw_type || s.kw,
                    joiningDate: s.joiningDate || s.joining_date, till: s.tillDate || s.till_date,
                    id: Date.now() + Math.random()
                }))
            },
            academicQualifications: {
                academicQualifications: (api.education || api.academicQualifications || api.academic_qualifications || []).map(a => ({
                    qualificationName: a.qualificationName || a.qualification_name, institution: a.institution,
                    city: a.city, institutionCountry: a.country || a.institution_country, grade: a.grade,
                    startDate: a.startDate || a.start_date, endDate: a.endDate || a.end_date,
                    id: Date.now() + Math.random()
                })),
                stcwCertificates: (api.stcwCertificates || api.stcw_certificates || []).map(c => ({
                    qualificationName: c.qualification || c.qualification_name, certificateNumber: c.certificateNumber || c.certificate_number,
                    issuingCountry: c.issuingCountry || c.issuing_country, dateOfIssue: c.issueDate || c.issue_date,
                    validTill: c.expiryDate || c.expiry_date, id: Date.now() + Math.random()
                }))
            },
            medicalTravelDocs: {
                medicalDocuments: medDocs.map(m => ({
                    certificateName: m.name || m.certificate_name, certificateNumber: m.documentNumber || m.document_number,
                    issuingCountry: m.issuingCountry || m.issuing_country, city: m.city || '',
                    institutionCountry: m.institutionCountry || m.institution_country || '',
                    dateOfIssue: m.issueDate || m.issue_date, validTill: m.expiryDate || m.expiry_date,
                    id: Date.now() + Math.random()
                })),
                travelDocuments: travelDocs.map(t => ({
                    documentName: t.name || t.document_name, documentNumber: t.documentNumber || t.document_number,
                    issuingCountry: t.issuingCountry || t.issuing_country,
                    dateOfIssue: t.issueDate || t.issue_date, validTill: t.expiryDate || t.expiry_date,
                    id: Date.now() + Math.random()
                }))
            },
            biometricsNextOfKin: {
                biometricData: {
                    gender: formattedGender, height: bio.height || bio.height_cm || '',
                    weight: bio.weight || bio.weight_kg || '', bmi: bio.bmi || '',
                    eyeColor: bio.eyeColor || bio.eye_color || '', overallSize: bio.overallSize || bio.overall_size || '',
                    shoeSize: bio.shoeSize || bio.shoe_size || ''
                },
                nextOfKinList: (api.nextOfKin || api.next_of_kin || []).map(k => ({
                    name: k.name, relationship: k.relationship,
                    countryCode: k.countryCode || k.country_code || '+44', phone: k.phone || k.phoneNumber || k.phone_number || '',
                    email: k.email || '', id: Date.now() + Math.random()
                })),
                refereesList: (api.referees || []).map(r => ({
                    name: r.name, position: r.position || '', company: r.company || r.companyName || r.company_name || '',
                    countryCode: r.countryCode || r.country_code || '+44', phone: r.phone || r.phoneNumber || r.phone_number || '',
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
                    licenseName: l.name || l.license_name, licenseNumber: l.number || l.license_number,
                    issuingCountry: l.country || l.issuing_country, dateOfIssue: l.issueDate || l.issue_date,
                    validTill: l.expiryDate || l.expiry_date, id: Date.now() + Math.random()
                })),
                certificates: certificates.map(c => ({
                    licenseName: c.name || c.license_name, licenseNumber: c.number || c.license_number,
                    issuingCountry: c.country || c.issuing_country, dateOfIssue: c.issueDate || c.issue_date,
                    validTill: c.expiryDate || c.expiry_date, id: Date.now() + Math.random()
                }))
            }
        };
    }
}

// Create and export a singleton instance
const resumeService = new ResumeService();
export default resumeService;
