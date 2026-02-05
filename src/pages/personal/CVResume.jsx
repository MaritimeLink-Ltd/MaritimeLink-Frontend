import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FiEdit, FiShare2, FiDownload, FiBriefcase, FiTool, FiPhone, FiMail, FiMapPin, FiMenu, FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const CVResume = ({ isReadOnly = false }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: 'Ali Shahzaib',
        category: 'Deck Officer',
        userType: 'officer', // 'officer', 'rating', or 'medical'
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
            bmi: '23.2',
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

    const cvRef = useRef(null);

    const handleEditResume = () => {
        console.log('Edit Resume clicked');
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
            {!isReadOnly && (
            <div className="flex-shrink-0 bg-gray-800 text-white px-8 py-2 flex justify-center gap-4 text-sm">
                <span className="opacity-70 flex items-center">Preview Mode:</span>
                <button
                    onClick={() => switchUserType('officer')}
                    className={`px-3 py-1 rounded ${userData.userType === 'officer' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    Officer
                </button>
                <button
                    onClick={() => switchUserType('rating')}
                    className={`px-3 py-1 rounded ${userData.userType === 'rating' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    Rating/Crew
                </button>
                <button
                    onClick={() => switchUserType('medical')}
                    className={`px-3 py-1 rounded ${userData.userType === 'medical' ? 'bg-[#003971]' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    Medical
                </button>
            </div>
            )}

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
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <FiBriefcase size={20} className="text-[#1E3A5F]" />
                            <h2 className="text-xl font-bold text-[#1E3A5F]">Professional Summary</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                            {userData.professionalSummary}
                        </p>
                    </div>

                    {/* Skills */}
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

                    {/* Conditional Sections based on user type */}
                    {/* Licenses Section - For Officers and Medical */}
                    {(userData.userType === 'officer' || userData.userType === 'medical') && userData.licenses && (
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
                    {(userData.userType === 'officer' || userData.userType === 'medical') && userData.endorsements && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.seaServiceLog && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.academicQualifications && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.stcwCertificates && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.medicalCertificates && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.travelDocuments && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.biometricInfo && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.nextOfKin && (
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
                    {(userData.userType === 'officer' || userData.userType === 'rating' || userData.userType === 'medical') && userData.references && (
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
