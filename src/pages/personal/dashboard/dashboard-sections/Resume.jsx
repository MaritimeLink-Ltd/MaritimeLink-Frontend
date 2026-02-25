import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiEdit, FiDownload, FiBriefcase, FiTool, FiPhone, FiMail, FiMapPin, FiShare2 } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const Resume = ({ isReviewMode = false, defaultUserType = 'officer', onEdit, formData }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: 'Ali Shahzaib',
        category: 'Deck Officer',
        userType: defaultUserType, // 'officer', 'rating', or 'medical'
        phone: '+1235662 89632',
        email: 'pambeasly@gmail.com',
        address: 'House #1 Street 43 California, USA',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        professionalSummary: 'A highly disciplined Seafarer Officer with a passion for ensuring efficient, safe, and regulated maritime operations. With a strong foundation in nautical science/ marine engineering and critical problem-solving. Pam brings years of experience working across various vessel types and challenging sea conditions. Her expertise spans from meticulously designing and executing watchkeeping procedures and navigation plans (or maintaining clean, operable engine room machinery) to leading cross-functional maritime teams in executing complex maneuvers and port operation',
        skills: [
            { name: 'Cargo Operations', rating: 5 },
            { name: 'Seamanship', rating: 5 },
        ],
        licenses: [
            {
                license: 'EOOW Certificate Of Competence',
                licenseNumber: 'COC98293020',
                capacity: 'Class 3 III/I Unlimited Motor & Steam',
                issuingCountry: 'MCA, United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                license: 'EOOW Certificate Of Competence',
                licenseNumber: 'COC98293020',
                capacity: 'Class 3 III/I Unlimited Motor & Steam',
                issuingCountry: 'MCA, United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            }
        ],
        seaServiceLog: [
            {
                company: 'CalMac Ferries UK',
                role: 'Third Engineer',
                vesselName: 'Glen Sannox',
                imoNo: '9875637',
                flag: 'United Kingdom',
                type: 'LNG (Motor)',
                dwt: '900t',
                meType: 'Dual Fuel Wartlisa 342i20df',
                kw: '12000',
                duration: '12-01-2026 To Till Date'
            },
            {
                company: 'CalMac Ferries UK',
                role: 'Third Engineer',
                vesselName: 'Glen Sannox',
                imoNo: '9875637',
                flag: 'United Kingdom',
                type: 'LNG (Motor)',
                dwt: '900t',
                meType: 'Dual Fuel Wartlisa 342i20df',
                kw: '12000',
                duration: '12-01-2026 To Till Date'
            }
        ],
        endorsements: [
            {
                endorsement: 'Advance Gas Tanker Endorsement',
                issuingCountry: 'MCA, United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                endorsement: 'Advance Gas Tanker Endorsement',
                issuingCountry: 'MCA, United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                endorsement: 'Advance Gas Tanker Endorsement',
                issuingCountry: 'MCA, United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            }
        ],
        academicQualifications: [
            {
                dates: '09.2022 - 09/2024',
                qualificationName: 'Master Of Science, Energy Engineering',
                institution: 'University of Hull, UK',
                grade: 'Distinction'
            },
            {
                dates: '09.2022 - 09/2024',
                qualificationName: 'Bachelors of Engineering with Honours, Marine Engineering',
                institution: 'South Shields Marine School Northumbria University Newcastle, UK',
                grade: '2.1, Top 6% of class'
            }
        ],
        stcwCertificates: [
            {
                stcwQualification: 'Basic Safety Training',
                certificateNumber: 'MRT/MAN/1246/2019',
                issuingCountry: 'Nigeria',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                stcwQualification: 'Designated Security Duties',
                certificateNumber: 'MRT/MAN/1246/2019',
                issuingCountry: 'United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                stcwQualification: 'Advanced Fire Fighting',
                certificateNumber: 'MRT/MAN/1246/2019',
                issuingCountry: 'Nigeria',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                stcwQualification: 'Proficiency in Survival Craft & RB',
                certificateNumber: 'MRT/MAN/1246/2019',
                issuingCountry: 'Nigeria',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            }
        ],
        medicalCertificates: [
            {
                certificateName: 'MCA ENG 1',
                certificateNumber: '243373',
                issuingCountry: 'United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                certificateName: 'Yellow Fever Vaccination',
                certificateNumber: 'A2156457',
                issuingCountry: 'Nigeria',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            }
        ],
        travelDocuments: [
            {
                documentName: 'Passport',
                documentNumber: '243373',
                issuingCountry: 'United Kingdom',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            },
            {
                documentName: 'Visa Document',
                documentNumber: 'A2156457',
                issuingCountry: 'Nigeria',
                dateOfIssue: '12-01-2024',
                validTill: '12-01-2026'
            }
        ],
        biometricInfo: {
            gender: 'Male',
            height: '160cm',
            weight: '89kg',
            eyeColor: 'Brown',
            overallSize: 'Medium',
            shoeSize: '9'
        },
        nextOfKin: [
            {
                name: 'Osifo, Wisdom Ikiyobotei',
                relationship: 'Brother',
                phoneNumber: '+60178348297',
                email: 'amioq@yahoo.com'
            }
        ],
        references: [
            {
                name: 'Omar, Azrol Amir',
                position: 'Second Engineer',
                phoneNumber: '+60178348297',
                email: 'amioq@yahoo.com'
            }
        ]
    });

    // Update userData based on formData from parent dashboards
    useEffect(() => {
        if (!formData) return;

        setUserData((prevData) => {
            const pi = formData.personalInfo || {};
            const ps = formData.professionalSummary || {};
            const sk = formData.skills || {};
            const lic = formData.licensesEndorsements || {};
            const profLic = formData.professionalLicensesCertificates || {}; // For Catering/Medical
            const sea = formData.seaServiceLog || {};
            const aca = formData.academicQualifications || {};
            const med = formData.medicalTravelDocs || {};
            const bio = formData.biometricsNextOfKin || {}; // New mapping

            // Helper to get array. Since formData is present, do not fallback to mock data.
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

            return {
                ...prevData,
                userType: defaultUserType || prevData.userType,
                name: (pi.firstName || pi.lastName) ? `${pi.firstName || ''} ${pi.lastName || ''}`.trim() : '',
                phone: pi.contactNumber ? `${pi.countryCode || '+44'} ${pi.contactNumber}` : '',
                email: pi.email || '',
                address: [pi.streetAddress, pi.city, pi.state, pi.zipCode, pi.country].filter(Boolean).join(', '),
                professionalSummary: ps.professionalSummary || ps.summary || '',
                skills: getArray(sk.skills),

                // If standard structure is empty, fallback to Catering structure
                licenses: getArray(lic.licenses, profLic.licenses).map(l => ({
                    ...l,
                    license: l.license || l.licenseName || '',
                    capacity: l.capacity || l.capacityRanking || l.rank || '',
                })),
                endorsements: getArray(lic.endorsements, profLic.certificates).map(e => ({
                    ...e,
                    endorsement: e.endorsement || e.certificateName || e.licenseName || '',
                })),

                seaServiceLog: getArray(sea.seaServiceLog || sea.seaServiceEntries).map(s => ({
                    ...s,
                    company: s.company || s.companyName || '',
                    kw: s.kw || s.kwt || s.engineKw || '',
                    duration: s.duration || formatDateRange(s.joiningDate || s.signOn, s.till || s.signOff),
                })),
                academicQualifications: getArray(aca.academic || aca.academicQualifications).map(a => ({
                    ...a,
                    dates: a.dates || formatDateRange(a.startDate, a.endDate),
                })),
                stcwCertificates: getArray(aca.stcw || aca.stcwCertificates).map(c => ({
                    ...c,
                    stcwQualification: c.stcwQualification || c.qualificationName || c.certificateName || '',
                })),
                medicalCertificates: getArray(med.medical || med.medicalDocuments),
                travelDocuments: getArray(med.travel || med.travelDocuments),

                // Mappings for Biometrics, Kin, and References block
                biometricInfo: {
                    gender: bio.biometricData?.gender || '',
                    height: bio.biometricData?.height ? `${bio.biometricData?.height}cm` : '',
                    weight: bio.biometricData?.weight ? `${bio.biometricData?.weight}kg` : '',
                    eyeColor: bio.biometricData?.eyeColor || '',
                    shoeSize: bio.biometricData?.shoeSize || '',
                    overallSize: bio.biometricData?.overallSize || '',
                    boilerSuitSize: bio.biometricData?.boilerSuitSize || '',
                },
                nextOfKin: getArray(bio.nextOfKinList).map(kin => ({
                    ...kin,
                    phoneNumber: kin.phoneNumber || (kin.phone ? `${kin.countryCode || ''} ${kin.phone}`.trim() : '')
                })),
                references: getArray(bio.refereesList).map(ref => ({
                    ...ref,
                    phoneNumber: ref.phoneNumber || (ref.phone ? `${ref.countryCode || ''} ${ref.phone}`.trim() : '')
                }))
            };
        });
    }, [formData, defaultUserType]);

    const cvRef = useRef(null);

    const handleEditResume = () => {
        if (onEdit) {
            onEdit();
        } else {
            navigate(-1); // Go back one step in history if onEdit not provided
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
            {!isReviewMode && (
                <div className="flex-shrink-0 bg-gray-800 text-white px-8 py-2 flex justify-center gap-4 text-sm">
                    <span className="opacity-70 flex items-center">Preview Mode:</span>
                    <button
                        onClick={() => setUserData({ ...userData, userType: 'officer' })}
                        className={`px-3 py-1 rounded ${userData.userType === 'officer' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Officer
                    </button>
                    <button
                        onClick={() => setUserData({ ...userData, userType: 'rating' })}
                        className={`px-3 py-1 rounded ${userData.userType === 'rating' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Rating/Crew
                    </button>
                    <button
                        onClick={() => setUserData({ ...userData, userType: 'medical' })}
                        className={`px-3 py-1 rounded ${userData.userType === 'medical' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Medical
                    </button>
                </div>
            )}

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
            </div>
        </div>
    );
};

export default Resume;
