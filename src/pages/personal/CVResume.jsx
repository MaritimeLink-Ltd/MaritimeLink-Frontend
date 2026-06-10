import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiEdit, FiBriefcase, FiTool, FiPhone, FiMail, FiMapPin, FiMenu, FiArrowLeft, FiUser } from 'react-icons/fi';
import { Crown, Star } from 'lucide-react';
import ResumeExportMenu from '../../components/resume/ResumeExportMenu';
import { shareOrDownloadFile } from '../../utils/shareFile';
import toast, { Toaster } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import resumeService from '../../services/resumeService';
import authService from '../../services/authService';
import { isPremiumTier } from '../../utils/isPremiumTier';
import { formatDisplayDate, formatDateRange } from '../../utils/formatDate';
import { useKycGuard } from '../../context/KycContext';
import { KYC_ACTIONS } from '../../constants/kycRestrictedActions';
import KycRestrictedView from '../../components/kyc/KycRestrictedView';
import { isPlaceholderProfilePhoto, resolveProfilePhotoUrl } from '../../utils/profilePhoto';

const CVResume = ({ isReadOnly = false, resumeData = null }) => {
    const navigate = useNavigate();
    const { guardRestrictedAction, hasStage2Access, isKycUnderReview } = useKycGuard();
    const location = useLocation();
    const [membershipTier, setMembershipTier] = useState('FREE');
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        category: '',
        userType: sessionStorage.getItem('professionType') === 'ratings' ? 'rating' : sessionStorage.getItem('professionType') === 'catering' ? 'medical' : sessionStorage.getItem('professionType') || 'officer', // 'officer', 'rating', or 'medical'
        phone: '',
        email: '',
        address: '',
        image: resolveProfilePhotoUrl({ savedPhoto: localStorage.getItem('profileImage') || '' }),
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

    useEffect(() => {
        let mounted = true;
        const loadTier = async () => {
            try {
                const accountResponse = await authService.getMyAccount();
                const professional = accountResponse?.data?.professional || null;
                const tier =
                    professional?.tier ||
                    professional?.membershipTier ||
                    professional?.membership?.tier ||
                    'FREE';
                if (mounted) setMembershipTier(tier || 'FREE');
            } catch {
                // keep FREE
            }
        };
        loadTier();
        return () => {
            mounted = false;
        };
    }, []);

    // Fetch resume data on mount
    useEffect(() => {
        const processData = (data) => {
            setUserData((prevData) => {
                const pi = data.personalInfo || {};
                const ps = data.summary || {};
                const sk = data.skills || [];
                const lic = data.licenses || [];
                const sea = data.seaService || [];
                const aca = data.education || [];
                const med = data.medicalTravelDocuments || [];
                const bio = data.biometrics || {};
                const stcwData = data.stcwCertificates || [];
                const kinList = data.nextOfKin || [];
                const refList = data.referees || [];

                const getArray = (arr) => Array.isArray(arr) ? arr : [];

                return {
                    ...prevData,
                    userType: data.userType || (() => {
                        const stored = sessionStorage.getItem('professionType');
                        if (stored === 'ratings') return 'rating';
                        if (stored === 'catering') return 'medical';
                        return stored || 'officer';
                    })(),
                    category: data.category || data.profession || data.subcategory || prevData.category,
                    name: (pi.firstName || pi.lastName) ? `${pi.firstName || ''} ${pi.lastName || ''}`.trim() : (data.name || prevData.name),
                    phone: pi.contactNumber || pi.phoneNumber ? `${pi.countryCode || pi.phoneCode || ''} ${pi.contactNumber || pi.phoneNumber}`.trim() : (data.phoneNumber || prevData.phone),
                    email: pi.email || pi.emailAddress || data.emailAddress || prevData.email,
                    address: [pi.streetAddress || pi.address || data.address, pi.city || data.city, pi.state || data.state, pi.zipCode || pi.postcode || data.postcode, pi.country || data.country].filter(Boolean).join(', ') || prevData.address,
                    image: resolveProfilePhotoUrl({
                        profile: {
                            profilePhotoUrl: data.profilePhotoUrl,
                            profilePhoto: data.profilePhoto || pi.profilePhoto,
                            photo: pi.photo,
                        },
                        savedPhoto: localStorage.getItem('profileImage') || '',
                    }) ?? (
                        prevData.image && !isPlaceholderProfilePhoto(prevData.image) ? prevData.image : null
                    ),
                    professionalSummary: ps.professionalSummary || ps.summary || (typeof ps === 'string' ? ps : '') || prevData.professionalSummary,
                    skills: getArray(sk).map(s => ({ name: s.skillName, rating: s.rating })),
                    licenses: getArray(lic).filter(l => !l.isEndorsement).map(l => ({
                        license: l.name,
                        licenseNumber: l.number,
                        capacity: l.capacity || '',
                        issuingCountry: l.country,
                        dateOfIssue: l.issueDate,
                        validTill: l.expiryDate
                    })),
                    endorsements: getArray(lic).filter(l => l.isEndorsement).map(e => ({
                        endorsement: e.name,
                        issuingCountry: e.country,
                        dateOfIssue: e.issueDate,
                        validTill: e.expiryDate
                    })),
                    seaServiceLog: getArray(sea).map(s => ({
                        company: s.companyName || s.company_name || s.company,
                        role: s.role,
                        vesselName: s.vesselName || s.vessel_name,
                        imoNo: s.imoNumber || s.imo_number || s.imoNo,
                        flag: s.flag,
                        type: s.vesselType || s.vessel_type || s.type,
                        vesselType: s.vesselType || s.vessel_type || s.type,
                        dwt: s.dwt,
                        meType: s.meType || s.me_type,
                        kw: s.kwType || s.kwtType || s.kw_type || s.kw,
                        joiningDate: s.joiningDate || s.joining_date || s.signOn || null,
                        tillDate: s.tillDate || s.till_date || s.till || s.signOff || null,
                        till: s.tillDate || s.till_date || s.till || s.signOff || null,
                        duration: formatDateRange(
                            s.joiningDate || s.joining_date || s.signOn,
                            s.tillDate || s.till_date || s.till || s.signOff,
                        ),
                    })),
                    academicQualifications: getArray(aca).map(a => ({
                        dates: formatDateRange(a.startDate, a.endDate),
                        qualificationName: a.qualificationName,
                        institution: a.institution,
                        grade: a.grade
                    })),
                    stcwCertificates: getArray(stcwData).map(c => ({
                        stcwQualification: c.qualification,
                        certificateNumber: c.certificateNumber,
                        issuingCountry: c.issuingCountry,
                        dateOfIssue: c.issueDate,
                        validTill: c.expiryDate
                    })),
                    medicalCertificates: getArray(med).filter(m => m.type === 'MEDICAL').map(m => ({
                        certificateName: m.name,
                        certificateNumber: m.documentNumber,
                        issuingCountry: m.issuingCountry,
                        dateOfIssue: m.issueDate,
                        validTill: m.expiryDate
                    })),
                    travelDocuments: getArray(med).filter(m => m.type === 'TRAVEL').map(m => ({
                        documentName: m.name,
                        documentNumber: m.documentNumber,
                        issuingCountry: m.issuingCountry,
                        dateOfIssue: m.issueDate,
                        validTill: m.expiryDate
                    })),
                    biometricInfo: {
                        gender: bio.gender || '',
                        height: bio.height ? `${bio.height}cm` : '',
                        weight: bio.weight ? `${bio.weight}kg` : '',
                        bmi: bio.bmi || '',
                        eyeColor: bio.eyeColor || '',
                        shoeSize: bio.shoeSize || '',
                        overallSize: bio.overallSize || ''
                    },
                    nextOfKin: getArray(kinList).map(kin => ({
                        ...kin,
                        phoneNumber: kin.phoneNumber || (kin.phone ? `${kin.countryCode || ''} ${kin.phone}`.trim() : '')
                    })),
                    references: getArray(refList).map(ref => ({
                        ...ref,
                        company: ref.company || ref.companyName || ref.company_name || '',
                        phoneNumber: ref.phoneNumber || ref.phone_number || (ref.phone ? `${ref.countryCode || ''} ${ref.phone}`.trim() : '')
                    }))
                };
            });
        };

        const fetchResume = async () => {
            if (resumeData) {
                processData({
                    personalInfo: resumeData.personalInfo || {
                        firstName: resumeData.name?.split(' ')[0] || '',
                        lastName: resumeData.name?.split(' ').slice(1).join(' ') || '',
                        email: resumeData.emailAddress || '',
                        contactNumber: resumeData.phoneNumber || ''
                    },
                    ...resumeData
                });
                return;
            }

            if (location.state?.resumeData) {
                // Synthesize missing fields if passed from admin
                const rd = location.state.resumeData;
                processData({
                    personalInfo: rd.personalInfo || {
                        firstName: rd.name?.split(' ')[0] || '',
                        lastName: rd.name?.split(' ').slice(1).join(' ') || '',
                        email: rd.emailAddress || '',
                        contactNumber: rd.phoneNumber || ''
                    },
                    ...rd
                });
                return;
            }

            setIsLoading(true);
            try {
                const data = await resumeService.getResume();
                if (data) processData(data);
            } catch (error) {
                console.error("Failed to fetch CV resume", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResume();
    }, []);

    const cvRef = useRef(null);

    const handleEditResume = () => {
        const dashboardMap = {
            'officer': '/officer-dashboard',
            'rating': '/ratings-dashboard',
            'medical': '/catering-medical-dashboard'
        };
        navigate(dashboardMap[userData.userType] || '/officer-dashboard');
    };

    const buildResumePdfBlob = async () => {
        const element = cvRef.current;
        if (!element) {
            throw new Error('Resume content is not ready.');
        }

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#F5F7FA',
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

        return pdf.output('blob');
    };

    const downloadResumePdf = async () => {
        document.body.style.cursor = 'wait';

        try {
            const blob = await buildResumePdfBlob();
            const fileName = `${(userData.name || 'Resume').replace(/\s+/g, '_')}_CV.pdf`;
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
            alert(err?.message || 'Failed to download PDF. Please try again.');
        } finally {
            document.body.style.cursor = 'default';
        }
    };

    const shareResumePdf = async () => {
        document.body.style.cursor = 'wait';

        try {
            const safeName = (userData.name || 'Resume').replace(/\s+/g, '_');
            const fileName = `${safeName}_CV.pdf`;
            const blob = await buildResumePdfBlob();

            const result = await shareOrDownloadFile({
                blob,
                fileName,
                title: `${userData.name || 'My'} Resume`,
                text: 'My professional resume from MaritimeLink',
            });

            if (result === 'shared') {
                toast.success('Resume shared successfully.', { position: 'top-right' });
            } else if (result === 'downloaded') {
                toast.success(
                    'Resume PDF downloaded. Attach it from your Downloads folder to share.',
                    { position: 'top-right', duration: 5000 },
                );
            }
        } catch (err) {
            if (err?.name === 'AbortError') {
                return;
            }
            console.error('Share failed', err);
            toast.error(
                err?.message || 'Could not share resume. Try Download PDF instead.',
                { position: 'top-right' },
            );
        } finally {
            document.body.style.cursor = 'default';
        }
    };

    const handleDownloadPDF = () => {
        if (isReadOnly) return;
        guardRestrictedAction(KYC_ACTIONS.EXPORT_RESUME, () => {
            if (!isPremiumTier(membershipTier)) {
                setShowPremiumModal(true);
                return;
            }
            void downloadResumePdf();
        });
    };

    const handleShareResume = () => {
        if (isReadOnly) return;
        guardRestrictedAction(KYC_ACTIONS.EXPORT_RESUME, () => {
            if (!isPremiumTier(membershipTier)) {
                setShowPremiumModal(true);
                return;
            }
            void shareResumePdf();
        });
    };

    // Helper to switch user types for demonstration
    const switchUserType = (type) => {
        let category = 'Deck Officer';
        if (type === 'rating') category = 'Engine Fitter';
        if (type === 'medical') category = 'Paramedic';

        setUserData(prev => ({
            ...prev,
            userType: type,
            category: category
        }));
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

    const isPlatformAdmin =
        typeof window !== 'undefined' &&
        (localStorage.getItem('adminUserType') === 'admin' ||
            localStorage.getItem('userType') === 'admin');

    const isRecruiterOrTrainerResumeView =
        isReadOnly &&
        (location.pathname.includes('/admin/cv-resume') ||
            location.pathname.includes('/trainingprovider/cv-resume')) &&
        Boolean(location.state?.resumeData || resumeData);

    if (isRecruiterOrTrainerResumeView && !isPlatformAdmin && !hasStage2Access) {
        return (
            <KycRestrictedView
                actionLabel={KYC_ACTIONS.VIEW_RESUME}
                isUnderReview={isKycUnderReview}
                onBack={() => navigate(-1)}
            />
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[#F5F7FA]">
            <Toaster position="top-right" />
            {/* Dev Toolbar */}
            {/* Removed Preview Mode toggle - category is now automatic based on session */}

            <div className="flex-1 overflow-y-auto">
                <div ref={cvRef}>
                    {/* Navbar */}
                    {!isReadOnly && (
                        <nav className="bg-white px-4 sm:px-8 py-4">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                {/* Logo with Menu */}
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                                        <FiMenu size={24} className="text-gray-600" />
                                    </button>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12">
                                        <img
                                            src="/images/logo.png"
                                            alt="Matrim Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 sm:gap-3" data-html2canvas-ignore="true">
                                    <button
                                        onClick={handleEditResume}
                                        className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px]"
                                    >
                                        <FiEdit size={16} />
                                        <span className="font-medium text-sm">Edit Resume</span>
                                    </button>
                                    <button
                                        onClick={handleEditResume}
                                        className="sm:hidden p-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    >
                                        <FiEdit size={18} />
                                    </button>
                                    <ResumeExportMenu
                                        onShare={handleShareResume}
                                        onDownload={handleDownloadPDF}
                                    />
                                </div>
                            </div>
                        </nav>
                    )}

                    {/* Back Button for Read-Only Mode */}
                    {isReadOnly && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <FiArrowLeft size={16} />
                                Back
                            </button>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
                        {/* Profile Section */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                {/* Profile Image */}
                                <div className="flex-shrink-0">
                                    {userData.image && !isPlaceholderProfilePhoto(userData.image) ? (
                                        <img
                                            src={userData.image}
                                            alt={userData.name}
                                            className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl object-cover mx-auto sm:mx-0"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl bg-gray-100 flex items-center justify-center mx-auto sm:mx-0">
                                            <FiUser className="text-gray-400" size={56} />
                                        </div>
                                    )}
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
                                                {renderStars(skill.rating)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conditional Sections based on user type */}
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(license.dateOfIssue)}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(license.validTill)}</td>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(endorsement.dateOfIssue)}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(endorsement.validTill)}</td>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{log.kwt}</td>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(cert.dateOfIssue)}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(cert.validTill)}</td>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(cert.dateOfIssue)}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(cert.validTill)}</td>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(doc.dateOfIssue)}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{formatDisplayDate(doc.validTill)}</td>
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
                </div> {/* End of cvRef wrapper */}
            </div> {/* End of overflow container */}

            {showPremiumModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
                                <Star size={32} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Premium Feature
                        </h3>

                        <p className="text-gray-500 mb-8 text-sm sm:text-base">
                            Upgrade to Premium to unlock Resume Sharing, PDF Download, and many other exclusive features to boost your maritime career.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/personal/profile/manage-subscription')}
                                className="w-full bg-[#003366] text-white py-3.5 px-4 rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                            >
                                <Crown size={20} />
                                Yes, Upgrade Now
                            </button>

                            <button
                                onClick={() => setShowPremiumModal(false)}
                                className="w-full text-gray-500 hover:text-gray-700 py-3.5 px-4 rounded-xl font-medium transition-colors border border-gray-200 hover:bg-gray-50 bg-white"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVResume;
