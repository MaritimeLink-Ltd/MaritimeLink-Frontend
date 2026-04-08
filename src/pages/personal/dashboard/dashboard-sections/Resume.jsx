import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiEdit, FiDownload, FiBriefcase, FiTool, FiPhone, FiMail, FiMapPin, FiShare2 } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import resumeService from '../../../../services/resumeService';

const Resume = ({ isReviewMode = false, defaultUserType = 'officer', onEdit, formData }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        category: '',
        userType: defaultUserType || (sessionStorage.getItem('professionType') === 'ratings' ? 'rating' : sessionStorage.getItem('professionType') === 'catering' ? 'medical' : sessionStorage.getItem('professionType') || 'officer'), // 'officer', 'rating', or 'medical'
        phone: '',
        email: '',
        address: '',
        image: localStorage.getItem('profileImage') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        professionalSummary: '',
        skills: [],
        licenses: [],
        seaServiceLog: [],
        endorsements: [],
        academicQualifications: [],
        stcwCertificates: [],
        medicalCertificates: [],
        travelDocuments: [],
        biometricInfo: {
            gender: '',
            height: '',
            weight: '',
            bmi: '',
            eyeColor: '',
            overallSize: '',
            shoeSize: ''
        },
        nextOfKin: [],
        references: []
    });

    const [isLoading, setIsLoading] = useState(false);

    // Update userData based on formData from parent dashboards OR from API fetch
    useEffect(() => {
        const processData = (rawData, isApiPayload = false) => {
            if (!rawData) {
                console.warn("Resume: processData called with no data");
                return;
            }
            // Unwrap if data is wrapped in a `resume` key (API GET response format)
            const data = (isApiPayload && rawData.resume) ? rawData.resume : rawData;
            console.log("Resume: Processing data (unwrapped):", data);
            
            setUserData((prevData) => {
                // Determine source for each section based on payload type
                // isApiPayload means data came from getResume()
                // Map common variations (camelCase vs snake_case if any)
                const pi = isApiPayload ? (data.personalInfo || data || {}) : (data.personalInfo || {});
                const ps = isApiPayload ? (data.summary || data.professionalSummary || data || {}) : (data.professionalSummary || {});
                const sk = isApiPayload ? (data.skills || []) : (data.skills || {});
                const lic = isApiPayload ? (data.licenses || []) : (data.licensesEndorsements || {});
                const profLic = isApiPayload ? [] : (data.professionalLicensesCertificates || {}); 
                const sea = isApiPayload ? (data.seaService || []) : (data.seaServiceLog || {});
                const aca = isApiPayload ? (data.education || []) : (data.academicQualifications || {});
                const med = isApiPayload ? (data.medicalTravelDocuments || data.medicalCertificates || data.medical_travel_documents || data.medicalDocuments || []) : (data.medicalTravelDocs || {});
                // GET response returns travel docs separately under `travelDocuments`
                const travelDocs = isApiPayload ? (data.travelDocuments || data.travel_documents || []) : [];
                const bio = isApiPayload ? (data.biometrics || data || {}) : (data.biometricsNextOfKin || {});
                const stcwData = isApiPayload ? (data.stcwCertificates || []) : (aca.stcw || aca.stcwCertificates || []);
                const kinList = isApiPayload ? (data.nextOfKin || []) : (bio.nextOfKinList || []);
                const refList = isApiPayload ? (data.referees || []) : (bio.refereesList || []);

                // Helper to get array.
                const getArray = (arr1, arr2) => {
                    if (Array.isArray(arr1) && arr1.length > 0) return arr1;
                    if (Array.isArray(arr2) && arr2.length > 0) return arr2;
                    return [];
                };

                const formatDateRange = (start, end) => {
                    if (!start && !end) return '';
                    const formatOpts = { day: 'numeric', month: 'short', year: 'numeric' };
                    const s = start ? new Date(start).toLocaleDateString('en-GB', formatOpts) : '';
                    const e = end ? new Date(end).toLocaleDateString('en-GB', formatOpts) : 'Till Date';
                    return `${s} ${s && e ? 'To' : ''} ${e}`.trim();
                };

                // Extract User Type
                const newUserType = (() => {
                    if (defaultUserType && defaultUserType !== 'officer') return defaultUserType;
                    const stored = sessionStorage.getItem('professionType');
                    if (stored === 'ratings') return 'rating';
                    if (stored === 'catering') return 'medical';
                    return stored || defaultUserType || 'officer';
                })();

                const firstName = pi.firstName || pi.first_name || '';
                const middleName = pi.middleName || pi.middle_name || '';
                const lastName = pi.lastName || pi.last_name || '';
                const fullName = pi.fullName || pi.full_name || '';

                return {
                    ...prevData,
                    userType: newUserType,
                    name: (firstName || middleName || lastName) ? `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim() : (fullName || prevData.name),
                    category: pi.category || data.category || data.subcategory || data.profession || prevData.category,
                    phone: pi.contactNumber || pi.phoneNumber || pi.phone || pi.contact_number || pi.phone_number ? `${pi.countryCode || pi.phoneCode || pi.country_code || pi.phone_code || ''} ${pi.contactNumber || pi.phoneNumber || pi.phone || pi.contact_number || pi.phone_number}`.trim() : prevData.phone,
                    email: pi.email || pi.emailAddress || pi.email_address || prevData.email,
                    address: [pi.streetAddress || pi.address || pi.street_address, pi.city, pi.state, pi.zipCode || pi.postcode || pi.zip_code || pi.post_code, pi.country].filter(Boolean).join(', ') || prevData.address,
                    image: isApiPayload
                        ? (data.profilePhotoUrl || data.profilePhoto || data.profile_photo || localStorage.getItem('profileImage') || prevData.image)
                        : (localStorage.getItem('profileImage') || prevData.image),
                    professionalSummary: ps.professionalSummary || ps.summary || (typeof ps === 'string' ? ps : '') || prevData.professionalSummary,
                    
                    skills: isApiPayload 
                        ? (Array.isArray(sk) ? sk : []).map(s => ({ name: s.skillName || s.name || s.skill_name, rating: s.rating || s.level || 0 }))
                        : getArray(sk.skills || sk).map(s => ({ name: s.name || s.skillName || s.skill_name, rating: s.rating || s.level || 0 })),

                    licenses: isApiPayload 
                        ? (Array.isArray(lic) ? lic : []).filter(l => !l.isEndorsement).map(l => ({
                            license: l.name || l.license_name,
                            licenseNumber: l.number || l.license_number,
                            capacity: l.capacity || '',
                            issuingCountry: l.country || l.issuing_country,
                            dateOfIssue: l.issueDate || l.issue_date,
                            validTill: l.expiryDate || l.expiry_date
                        }))
                        : getArray(lic.licenses, profLic.licenses).map(l => ({
                            ...l,
                            license: l.license || l.licenseName || l.license_name || '',
                            capacity: l.capacity || l.capacityRanking || l.rank || '',
                        })),
                    
                    endorsements: isApiPayload
                        ? (Array.isArray(lic) ? lic : []).filter(l => l.isEndorsement).map(e => ({
                            endorsement: e.name || e.endorsement_name,
                            issuingCountry: e.country || e.issuing_country,
                            dateOfIssue: e.issueDate || e.issue_date,
                            validTill: e.expiryDate || e.expiry_date
                        }))
                        : getArray(lic.endorsements, profLic.certificates).map(e => ({
                            ...e,
                            endorsement: e.endorsement || e.certificateName || e.certificate_name || e.licenseName || '',
                        })),

                    seaServiceLog: isApiPayload
                        ? (Array.isArray(sea) ? sea : []).map(s => ({
                            company: s.companyName || s.company_name || s.company,
                            role: s.role,
                            vesselName: s.vesselName || s.vessel_name,
                            imoNo: s.imoNumber || s.imo_number || s.imoNo,
                            flag: s.flag,
                            type: s.vesselType || s.vessel_type || s.type,
                            dwt: s.dwt,
                            meType: s.meType || s.me_type,
                            kw: s.kwType || s.kwtType || s.kw_type || s.kw,
                            duration: formatDateRange(s.joiningDate || s.joining_date, s.tillDate || s.till_date),
                        }))
                        : getArray(sea.seaServiceLog || sea.seaServiceEntries || sea).map(s => ({
                            ...s,
                            company: s.company || s.companyName || '',
                            kw: s.kw || s.kwt || s.engineKw || '',
                            duration: s.duration || formatDateRange(s.joiningDate || s.signOn, s.till || s.signOff),
                        })),

                    academicQualifications: isApiPayload
                        ? (Array.isArray(aca) ? aca : []).map(a => ({
                            dates: formatDateRange(a.startDate || a.start_date, a.endDate || a.end_date),
                            qualificationName: a.qualificationName || a.qualification_name,
                            institution: a.institution,
                            grade: a.grade
                        }))
                        : getArray(aca.academic || aca.academicQualifications || aca).map(a => ({
                            ...a,
                            dates: a.dates || formatDateRange(a.startDate, a.endDate),
                        })),

                    stcwCertificates: isApiPayload
                        ? (Array.isArray(stcwData) ? stcwData : []).map(c => ({
                            stcwQualification: c.qualification || c.qualification_name,
                            certificateNumber: c.certificateNumber || c.certificate_number,
                            issuingCountry: c.issuingCountry || c.issuing_country,
                            dateOfIssue: c.issueDate || c.issue_date,
                            validTill: c.expiryDate || c.expiry_date
                        }))
                        : getArray(stcwData).map(c => ({
                            ...c,
                            stcwQualification: c.stcwQualification || c.qualificationName || c.certificateName || '',
                        })),

                    medicalCertificates: (() => {
                        if (!isApiPayload) return getArray(med.medical || med.medicalDocuments || med);
                        // Check for separate medicalDocuments array on the data object
                        const medicalArr = data.medicalDocuments || data.medical_documents || [];
                        const combinedMedical = (Array.isArray(med) ? med : []).filter(m => m.type === 'MEDICAL');
                        const finalArr = combinedMedical.length > 0 ? combinedMedical : (Array.isArray(medicalArr) && medicalArr.length > 0 ? medicalArr : (Array.isArray(med) ? med : []));
                        return finalArr.map(m => ({
                            certificateName: m.name || m.certificateName || m.certificate_name,
                            certificateNumber: m.documentNumber || m.certificateNumber || m.document_number,
                            issuingCountry: m.issuingCountry || m.issuing_country,
                            dateOfIssue: m.issueDate || m.dateOfIssue || m.issue_date,
                            validTill: m.expiryDate || m.validTill || m.expiry_date
                        }));
                    })(),

                    travelDocuments: (() => {
                        if (!isApiPayload) return getArray(med.travel || med.travelDocuments || med);
                        // Check for separate travelDocuments array on the data object
                        const travelArr = data.travelDocuments || data.travel_documents || [];
                        const combinedTravel = (Array.isArray(med) ? med : []).filter(m => m.type === 'TRAVEL');
                        const finalArr = combinedTravel.length > 0 ? combinedTravel : (Array.isArray(travelArr) && travelArr.length > 0 ? travelArr : []);
                        return finalArr.map(m => ({
                            documentName: m.name || m.documentName || m.document_name,
                            documentNumber: m.documentNumber || m.document_number,
                            issuingCountry: m.issuingCountry || m.issuing_country,
                            dateOfIssue: m.issueDate || m.dateOfIssue || m.issue_date,
                            validTill: m.expiryDate || m.validTill || m.expiry_date
                        }));
                    })(),

                    biometricInfo: {
                        gender: (isApiPayload ? bio.gender : bio.biometricData?.gender) || '',
                        height: (isApiPayload ? (bio.height || bio.height_cm) : bio.biometricData?.height) ? `${isApiPayload ? (bio.height || bio.height_cm) : bio.biometricData?.height}cm` : '',
                        weight: (isApiPayload ? (bio.weight || bio.weight_kg) : bio.biometricData?.weight) ? `${isApiPayload ? (bio.weight || bio.weight_kg) : bio.biometricData?.weight}kg` : '',
                        bmi: (isApiPayload ? bio.bmi : bio.biometricData?.bmi) || '',
                        eyeColor: (isApiPayload ? (bio.eyeColor || bio.eye_color) : bio.biometricData?.eyeColor) || '',
                        shoeSize: (isApiPayload ? (bio.shoeSize || bio.shoe_size) : bio.biometricData?.shoeSize) || '',
                        overallSize: (isApiPayload ? (bio.overallSize || bio.overall_size) : bio.biometricData?.overallSize) || '',
                        boilerSuitSize: bio.biometricData?.boilerSuitSize || '',
                    },

                    nextOfKin: getArray(kinList).map(kin => ({
                        ...kin,
                        phoneNumber: kin.phoneNumber || kin.phone_number || (kin.phone ? `${kin.countryCode || ''} ${kin.phone}`.trim() : '')
                    })),

                    references: getArray(refList).map(ref => ({
                        ...ref,
                        company: ref.company || ref.companyName || ref.company_name || '',
                        phoneNumber: ref.phoneNumber || ref.phone_number || (ref.phone ? `${ref.countryCode || ''} ${ref.phone}`.trim() : '')
                    }))
                };
            });
        };

        if (formData) {
            processData(formData, false);
        } else {
            const fetchResume = async () => {
                setIsLoading(true);
                try {
                    const data = await resumeService.getResume();
                    console.log("Resume Fetch Result:", data);
                    if (data) {
                        processData(data, true);
                        if (data.profilePhotoUrl || data.profilePhoto || data.profile_photo) {
                            const photo = data.profilePhotoUrl || data.profilePhoto || data.profile_photo;
                            localStorage.setItem('profileImage', photo);
                        }
                    } else {
                        console.warn("Resume: API returned null or empty data");
                    }
                } catch (error) {
                    console.error("Failed to fetch formal resume:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResume();
        }

        // Listen for photo updates from the Profile page
        const handleCustomPhotoUpdate = (e) => {
            if (e.detail && e.detail.url) {
                setUserData(prev => ({ ...prev, image: e.detail.url }));
            }
        };
        window.addEventListener('profileImageUpdated', handleCustomPhotoUpdate);

        return () => {
            window.removeEventListener('profileImageUpdated', handleCustomPhotoUpdate);
        };
    }, [formData, defaultUserType]);

    const cvRef = useRef(null);

    const handleEditResume = () => {
        if (onEdit) {
            onEdit();
        } else {
            const dashboardMap = {
                'officer': '/officer-dashboard',
                'rating': '/ratings-dashboard',
                'medical': '/catering-medical-dashboard'
            };
            navigate(dashboardMap[userData.userType] || '/officer-dashboard');
        }
    };

    const handleDownloadPDF = async () => {
        const element = cvRef.current;
        if (!element) return;

        // Show loading state
        document.body.style.cursor = 'wait';

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#F5F7FA'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const pdfImgHeight = imgHeight * ratio;

            let heightLeft = pdfImgHeight;
            let position = 0;
            let page = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                page++;
                position = -pdfHeight * page;

                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
                heightLeft -= pdfHeight;

            }
            const fileName = `${userData.name.replace(/\s+/g, '_')}_CV.pdf`;

            // Manual download to ensure filename
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF failed', err);
            alert('Failed to download PDF. Please try again.');
        } finally {
            document.body.style.cursor = 'default';
        }
    };

    const handleShareResume = async () => {
        const element = cvRef.current;
        if (!element) return;

        // Show loading state
        document.body.style.cursor = 'wait';

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#F5F7FA'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const pdfImgHeight = imgHeight * ratio;

            let heightLeft = pdfImgHeight;
            let position = 0;
            let page = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                page++;
                position = -pdfHeight * page;

                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImgHeight);
                heightLeft -= pdfHeight;
            }

            const fileName = `${userData.name.replace(/\s+/g, '_')}_CV.pdf`;
            const blob = pdf.output('blob');
            const file = new File([blob], fileName, { type: 'application/pdf' });

            // Check if Web Share API is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `${userData.name}'s Resume`,
                    text: `Check out my professional resume`,
                    files: [file]
                });
            } else {
                // Fallback: Create a shareable link or copy to clipboard
                const url = URL.createObjectURL(blob);

                // Try to copy link to clipboard
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(url);
                    alert('Resume link copied to clipboard! You can paste and share it.');
                } else {
                    // Last fallback: Open in new tab
                    window.open(url, '_blank');
                    alert('Resume opened in new tab. You can download and share it from there.');
                }

                // Clean up after some time
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Share cancelled');
            } else {
                console.error('Share failed', err);
                alert('Failed to share resume. Please try downloading and sharing manually.');
            }
        } finally {
            document.body.style.cursor = 'default';
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'text-[#003971]' : 'text-gray-300'}
                size={18}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            {/* Preview Mode Tabs */}
            {/* Removed Preview Mode toggle - category is now automatic based on dashboard/session */}

            {/* Action Buttons Header */}
            <div className={`${isReviewMode ? '' : 'sticky top-0 z-30'} bg-white px-4 sm:px-8 py-4 border-b border-gray-200`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Resume</h1>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Edit Resume Button - Desktop */}
                        <button
                            onClick={handleEditResume}
                            className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px]"
                        >
                            <FiEdit size={16} />
                            <span className="font-medium text-sm">Edit Resume</span>
                        </button>
                        {/* Edit Resume Button - Mobile */}
                        <button
                            onClick={handleEditResume}
                            className="sm:hidden p-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            <FiEdit size={18} />
                        </button>

                        {/* Share Resume Button - Desktop */}
                        {!isReviewMode && (
                            <button
                                onClick={handleShareResume}
                                className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-[#1E3A5F] border-2 border-[#1E3A5F] rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-h-[44px]"
                            >
                                <FiShare2 size={16} />
                                <span className="font-medium text-sm">Share Resume</span>
                            </button>
                        )}
                        {/* Share Resume Button - Mobile */}
                        {!isReviewMode && (
                            <button
                                onClick={handleShareResume}
                                className="sm:hidden p-2.5 bg-white text-[#1E3A5F] border-2 border-[#1E3A5F] rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                                <FiShare2 size={18} />
                            </button>
                        )}

                        {/* Download PDF Button - Desktop */}
                        {!isReviewMode && (
                            <button
                                onClick={handleDownloadPDF}
                                className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px]"
                            >
                                <FiDownload size={16} />
                                <span className="font-medium text-sm">Download PDF</span>
                            </button>
                        )}
                        {/* Download PDF Button - Mobile */}
                        {!isReviewMode && (
                            <button
                                onClick={handleDownloadPDF}
                                className="sm:hidden p-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                                <FiDownload size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div ref={cvRef}>
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
                    {/* Profile Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={userData.image}
                                    alt={userData.name}
                                    className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl object-cover mx-auto sm:mx-0"
                                />
                            </div>

                            {/* Personal Details */}
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{userData.name}</h1>
                                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-5">{userData.category}</p>

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiPhone size={16} className="text-gray-500" />
                                        <span className="text-xs sm:text-sm">{userData.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiMail size={16} className="text-gray-500" />
                                        <span className="text-xs sm:text-sm break-all">{userData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FiMapPin size={16} className="text-gray-500" />
                                        <span className="text-xs sm:text-sm">{userData.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Summary */}
                    {userData.professionalSummary && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Professional Summary</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {userData.professionalSummary}
                            </p>
                        </div>
                    )}

                    {/* Skills */}
                    {userData.skills && userData.skills.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-5">
                                <FiTool size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Skills</h2>
                            </div>
                            <div className="space-y-3">
                                {userData.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <span className="text-gray-800 font-medium min-w-[160px] text-sm">
                                            {skill.name}
                                        </span>
                                        <div className="flex gap-1">
                                            {renderStars(skill.rating || skill.level || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Licenses Section - For Officers and Medical */}
                    {(userData.userType === 'officer' || userData.userType === 'medical') && userData.licenses && userData.licenses.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">
                                    {userData.userType === 'medical' ? 'Professional Licenses' : 'Licenses'}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">License</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">License Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.licenses.map((license, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{license.license}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{license.licenseNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{license.issuingCountry}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{license.dateOfIssue}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{license.validTill}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Endorsements/Certificates Section - For Officers and Medical */}
                    {(userData.userType === 'officer' || userData.userType === 'medical') && userData.endorsements && userData.endorsements.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">
                                    {userData.userType === 'medical' ? 'Certificates' : 'Endorsements'}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">
                                                {userData.userType === 'medical' ? 'Certificates' : 'Endorsement'}
                                            </th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.endorsements.map((endorsement, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{endorsement.endorsement}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{endorsement.issuingCountry}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{endorsement.dateOfIssue}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{endorsement.validTill}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Sea Service Log Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.seaServiceLog && userData.seaServiceLog.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Sea Service Log</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Company</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Role</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Vessel Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">IMO No.</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Flag</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Type</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">DWT</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Me Type</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">KWT</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.seaServiceLog.map((log, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.company}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.role}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.vesselName}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.imoNo}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.flag}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.type}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.dwt}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.meType}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.kwt || log.kw}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{log.duration}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Academic Qualification Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.academicQualifications && userData.academicQualifications.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Academic Qualification</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Dates</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Qualification Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Institution</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.academicQualifications.map((qual, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{qual.dates}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{qual.qualificationName}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{qual.institution}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{qual.grade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* STCW Certificates Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.stcwCertificates && userData.stcwCertificates.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">STCW Certificates</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">STCW Qualification</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Certificate Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.stcwCertificates.map((cert, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.stcwQualification}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.issuingCountry}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.dateOfIssue}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.validTill}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Medical Certificates Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.medicalCertificates && userData.medicalCertificates.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Medical Certificates</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Certificate Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Certificate Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.medicalCertificates.map((cert, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateName}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.issuingCountry}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.dateOfIssue}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{cert.validTill}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Travel Documents Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.travelDocuments && userData.travelDocuments.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Travel Documents</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Document Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Document Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.travelDocuments.map((doc, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{doc.documentName}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{doc.documentNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{doc.issuingCountry}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{doc.dateOfIssue}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{doc.validTill}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Biometrics Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.biometricInfo && Object.values(userData.biometricInfo).some(val => val) && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Biometrics</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Gender</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Height</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Weight</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">BMI</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Eye Color</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Overall Size</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Shoe Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        <tr className="border-b border-gray-200">
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.gender}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.height}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.weight}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.bmi}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.eyeColor}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.overallSize}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.shoeSize}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Next Of Kin Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.nextOfKin && userData.nextOfKin.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Next Of Kin</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Relationship</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Phone Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.nextOfKin.map((kin, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{kin.name}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{kin.relationship}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{kin.phoneNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{kin.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Referees Section - For All Types */}
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.references && userData.references.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-5">
                                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                                <h2 className="text-xl font-bold text-[#1E3A5F]">Referees</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#1E3A5F] text-white">
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Name</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Position</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Company</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Phone Number</th>
                                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {userData.references.map((ref, index) => (
                                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                <td className="px-5 py-4 text-sm text-gray-700">{ref.name}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{ref.position}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{ref.company}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{ref.phoneNumber}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{ref.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Resume;
