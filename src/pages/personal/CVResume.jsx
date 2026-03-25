import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiEdit, FiShare2, FiDownload, FiBriefcase, FiTool, FiPhone, FiMail, FiMapPin, FiMenu, FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import resumeService from '../../services/resumeService';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const CVResume = ({ isReadOnly = false }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        category: '',
        userType: sessionStorage.getItem('professionType') === 'ratings' ? 'rating' : sessionStorage.getItem('professionType') === 'catering' ? 'medical' : sessionStorage.getItem('professionType') || 'officer', // 'officer', 'rating', or 'medical'
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

                const formatDateRange = (start, end) => {
                    if (!start && !end) return '';
                    const formatOpts = { day: 'numeric', month: 'short', year: 'numeric' };
                    const s = start ? new Date(start).toLocaleDateString('en-GB', formatOpts) : '';
                    const e = end ? new Date(end).toLocaleDateString('en-GB', formatOpts) : 'Till Date';
                    return `${s} ${s && e ? 'To' : ''} ${e}`.trim();
                };

                return {
                    ...prevData,
                    userType: (() => {
                        const stored = sessionStorage.getItem('professionType');
                        if (stored === 'ratings') return 'rating';
                        if (stored === 'catering') return 'medical';
                        return stored || 'officer';
                    })(),
                    name: (pi.firstName || pi.lastName) ? `${pi.firstName || ''} ${pi.lastName || ''}`.trim() : prevData.name,
                    phone: pi.contactNumber || pi.phoneNumber ? `${pi.countryCode || pi.phoneCode || ''} ${pi.contactNumber || pi.phoneNumber}`.trim() : prevData.phone,
                    email: pi.email || pi.emailAddress || prevData.email,
                    address: [pi.streetAddress || pi.address, pi.city, pi.state, pi.zipCode || pi.postcode, pi.country].filter(Boolean).join(', ') || prevData.address,
                    image: data.profilePhoto || prevData.image,
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
                        company: s.companyName,
                        role: s.role,
                        vesselName: s.vesselName,
                        imoNo: s.imoNumber,
                        flag: s.flag,
                        type: s.vesselType,
                        dwt: s.dwt,
                        meType: s.meType,
                        kw: s.kwType,
                        duration: formatDateRange(s.joiningDate, s.tillDate),
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
                        phoneNumber: ref.phoneNumber || (ref.phone ? `${ref.countryCode || ''} ${ref.phone}`.trim() : '')
                    }))
                };
            });
        };

        const fetchResume = async () => {
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

    const handleShareResume = () => {
        console.log('Share Resume clicked');
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

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[#F5F7FA]">
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
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px]"
                                    >
                                        <FiDownload size={16} />
                                        <span className="font-medium text-sm">Download PDF</span>
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="sm:hidden p-2.5 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152b47] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    >
                                        <FiDownload size={18} />
                                    </button>
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
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold">Capacity</th>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{license.capacity}</td>
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
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold">KW</th>
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
                                                    <td className="px-5 py-4 text-sm text-gray-700">{log.kw}</td>
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
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold">Phone Number</th>
                                                <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {userData.references.map((ref, index) => (
                                                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                                    <td className="px-5 py-4 text-sm text-gray-700">{ref.name}</td>
                                                    <td className="px-5 py-4 text-sm text-gray-700">{ref.position}</td>
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
        </div>
    );
};

export default CVResume;
