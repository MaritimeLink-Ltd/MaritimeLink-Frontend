import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Download,
    Eye,
    File,
    FileText,
    Folder,
    Headphones,
    MessageSquare,
    Ship,
    Star,
    Wallet,
    X,
} from 'lucide-react';

const toDisplayDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB');
};

const getDocStatus = (expiryDate) => {
    if (!expiryDate) return 'valid';
    const exp = new Date(expiryDate);
    if (Number.isNaN(exp.getTime())) return 'valid';

    const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'expired';
    if (diffDays < 60) return 'expiring-soon';
    return 'valid';
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'expired':
            return { label: 'Expired', cls: 'bg-red-100 text-red-700', icon: <X className="h-4 w-4" /> };
        case 'expiring-soon':
            return { label: 'Expiring Soon', cls: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="h-4 w-4" /> };
        default:
            return { label: 'Valid', cls: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> };
    }
};

const mapApiStatusToStage = (status) => {
    const normalized = String(status || '').toUpperCase();
    const map = {
        APPLIED: null,
        SHORTLISTED: 'shortlisted',
        INTERVIEWING: 'interviewing',
        OFFERED: 'offer-sent',
        HIRED: 'hired',
        REJECTED: null,
    };
    return map[normalized] ?? null;
};

const extractUpdatedByRole = (source) => {
    if (!source) return null;

    const application = source.application || null;
    const role =
        application?.updatedByRole ||
        application?.updatedBy?.role ||
        source.updatedByRole ||
        source.updatedBy?.role ||
        source.statusUpdatedByRole ||
        source.statusUpdatedBy?.role ||
        null;

    if (!role) return null;
    const normalized = String(role).toLowerCase();
    if (normalized.includes('admin')) return 'Admin';
    if (normalized.includes('recruiter')) return 'Recruiter';
    return null;
};

function CandidateSummary({ candidateId: propCandidateId, onBack, showApplicationStatus = false, onViewResume, onMessage }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { candidateId: urlCandidateId } = useParams();
    const candidateId = propCandidateId || urlCandidateId;

    const currentUserType = typeof window !== 'undefined'
        ? (localStorage.getItem('userType') || localStorage.getItem('adminUserType'))
        : null;
    const isAdmin = currentUserType === 'admin';

    const [fetchedCandidate, setFetchedCandidate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDocumentWallet, setShowDocumentWallet] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const getInitialStage = () => {
        const status = location.state?.applicantStatus;
        if (!status) return null;

        const stageMap = {
            new: null,
            matches: null,
            shortlisted: 'shortlisted',
            interviewing: 'interviewing',
            offered: 'offer-sent',
            hired: 'hired',
            rejected: null,
        };

        return stageMap[status] !== undefined ? stageMap[status] : null;
    };

    const [applicationStage, setApplicationStage] = useState(getInitialStage());
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdatedBy, setStatusUpdatedBy] = useState(null);

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            const rawApplicant = location.state?.candidateData?.rawApplicant;

            if (!candidateId) {
                setIsLoading(false);
                return;
            }

            if (!isAdmin && rawApplicant) {
                setFetchedCandidate(rawApplicant);
                if (rawApplicant.status) {
                    setApplicationStage(mapApiStatusToStage(rawApplicant.status));
                }
                setStatusUpdatedBy(extractUpdatedByRole(rawApplicant));
                setIsLoading(false);
                return;
            }

            if (!isAdmin) {
                setIsLoading(false);
                return;
            }

            const isProfessionalView = location.state?.isProfessionalView;
            if (
                isProfessionalView &&
                rawApplicant &&
                candidateId &&
                String(rawApplicant.id) === String(candidateId)
            ) {
                setFetchedCandidate(rawApplicant);
                if (rawApplicant.application?.status || rawApplicant.status) {
                    setApplicationStage(mapApiStatusToStage(rawApplicant.application?.status || rawApplicant.status));
                } else {
                    setApplicationStage(null);
                }
                setStatusUpdatedBy(extractUpdatedByRole(rawApplicant));
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const endpoint = isProfessionalView
                    ? API_ENDPOINTS.ADMIN.PROFESSIONAL_DETAIL(candidateId)
                    : API_ENDPOINTS.ADMIN.APPLICANT_DETAILS(candidateId);

                const response = await httpClient.get(endpoint);
                const responseData = response?.data?.data || response?.data;
                const obj = isProfessionalView && responseData?.professional ? responseData.professional : responseData;

                if (obj) {
                    setFetchedCandidate(obj);
                    if (obj.application?.status || obj.status) {
                        setApplicationStage(mapApiStatusToStage(obj.application?.status || obj.status));
                    }
                    setStatusUpdatedBy(extractUpdatedByRole(obj));
                }
            } catch (error) {
                console.error('Failed to fetch candidate details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidateDetails();
    }, [candidateId, isAdmin, location.state]);

    const resolveApplicantData = () => {
        const fallback = location.state?.candidateData || {};
        const source = fetchedCandidate || fallback.rawApplicant || null;

        if (!source) {
            return {
                professional: null,
                resume: null,
                attachedDocuments: [],
                cvUrl: null,
                fallback,
            };
        }

        if (source.application) {
            const application = source.application;
            const professional = application.professional || source.professional || null;
            return {
                professional,
                resume: application.resumeSnapshot || professional?.resume || null,
                attachedDocuments: source.attachedDocuments || application.attachedDocuments || professional?.documents || [],
                cvUrl: application.cvUrl || professional?.cvUrl || null,
                fallback,
            };
        }

        if (source.professional) {
            return {
                professional: source.professional,
                resume: source.resumeSnapshot || source.professional.resume || null,
                attachedDocuments: source.attachedDocuments || source.professional.documents || [],
                cvUrl: source.cvUrl || source.professional.cvUrl || null,
                fallback,
            };
        }

        return {
            professional: source,
            resume: source.resume || null,
            attachedDocuments: source.documents || [],
            cvUrl: source.cvUrl || null,
            fallback,
        };
    };

    const { professional, resume, attachedDocuments, cvUrl, fallback } = resolveApplicantData();

    const candidate = useMemo(() => {
        const seaService = Array.isArray(resume?.seaService) ? resume.seaService : [];
        const vesselTypes = [...new Set(seaService.map((s) => s.vesselType).filter(Boolean))];
        const experience = seaService.map((s) => {
            const role = s.role || 'Role not provided';
            const vessel = s.vesselName || s.vesselType || 'Vessel not provided';
            const range = `${toDisplayDate(s.joiningDate)} - ${s.tillDate ? toDisplayDate(s.tillDate) : 'Present'}`;
            return `${role} - ${vessel} (${range})`;
        });

        const skills = Array.isArray(resume?.skills)
            ? resume.skills.map((s) => ({ name: s.skillName || s.name || 'Unnamed skill', rating: Number(s.rating) || 0 }))
            : [];

        const rank = professional?.profession || professional?.subcategory || resume?.subcategory || resume?.category || fallback.rank || 'N/A';
        const years = Number(professional?.totalYearsExperience);

        return {
            name: professional?.fullname || [professional?.firstName, professional?.lastName].filter(Boolean).join(' ') || fallback.name || 'Unknown',
            rank,
            image: professional?.profilePhotoUrl || professional?.avatarUrl || professional?.photo || null,
            location: professional?.location || resume?.country || fallback.location || 'N/A',
            vesselTypes,
            seaTime: Number.isFinite(years) ? `${years} years experience` : (seaService.length ? `${seaService.length} sea service record(s)` : 'No sea service recorded'),
            compliant: professional?.isVerified || professional?.kyc?.status === 'APPROVED' || false,
            experience,
            skills,
        };
    }, [professional, resume, fallback]);

    const documentWallet = useMemo(() => {
        const docsFromAttached = (Array.isArray(attachedDocuments) ? attachedDocuments : []).map((d) => ({
            id: d.id,
            category: d.category || 'OTHER',
            name: d.name || 'Untitled Document',
            expiryDate: toDisplayDate(d.expiryDate),
            status: getDocStatus(d.expiryDate),
            url: d.fileUrl || '',
            uploadedOn: toDisplayDate(d.createdAt),
            verificationStatus: d.verificationStatus || 'PENDING',
        }));

        const resumeDocs = [];
        const pushResumeDoc = (category, arr, defaultName) => {
            (Array.isArray(arr) ? arr : []).forEach((item, idx) => {
                resumeDocs.push({
                    id: `${category}-${idx}-${item?.id || 'x'}`,
                    category,
                    name: item?.name || item?.qualification || defaultName,
                    expiryDate: toDisplayDate(item?.expiryDate),
                    status: getDocStatus(item?.expiryDate),
                    url: item?.fileUrl || '',
                    uploadedOn: 'N/A',
                    verificationStatus: 'N/A',
                });
            });
        };

        pushResumeDoc('LICENSES_ENDORSEMENTS', resume?.licenses, 'License');
        pushResumeDoc('MEDICAL_CERTIFICATES', resume?.medicalCertificates, 'Medical Certificate');
        pushResumeDoc('TRAVEL_DOCUMENTS', resume?.travelDocuments, 'Travel Document');
        pushResumeDoc('STCW_CERTIFICATES', resume?.stcwCertificates, 'STCW Certificate');

        const allDocs = [...docsFromAttached, ...resumeDocs];
        const categories = [...new Set(allDocs.map((d) => d.category))];

        return {
            folders: categories.map((category, idx) => ({
                id: idx + 1,
                name: (category || '').split('_').filter(Boolean).map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') || 'Other',
                documents: allDocs.filter((d) => d.category === category),
            })),
        };
    }, [attachedDocuments, resume]);

    const shouldShowApplicationStatus = (showApplicationStatus || location.state?.fromJobDetail) && location.state?.applicantStatus !== 'matches';
    const stages = [
        { id: 'shortlisted', label: 'Shortlisted' },
        { id: 'interviewing', label: 'Interviewing' },
        { id: 'offer-sent', label: 'Offer Sent' },
        { id: 'hired', label: 'Hired' },
    ];
    const currentStageIndex = applicationStage ? stages.findIndex((stage) => stage.id === applicationStage) : -1;

    const getNextStageInfo = () => {
        if (!applicationStage) {
            return { nextStage: 'shortlisted', buttonText: 'Move To Shortlisted' };
        }

        const stageProgression = {
            shortlisted: { nextStage: 'interviewing', buttonText: 'Move To Interviewing' },
            interviewing: { nextStage: 'offer-sent', buttonText: 'Move To Offer Sent' },
            'offer-sent': { nextStage: 'hired', buttonText: 'Move To Hired' },
            hired: { nextStage: null, buttonText: 'Hired' },
        };

        return stageProgression[applicationStage] || { nextStage: 'hired', buttonText: 'Move To Hired' };
    };

    const nextStageInfo = getNextStageInfo();

    const stageToApiStatus = {
        shortlisted: 'SHORTLISTED',
        interviewing: 'INTERVIEWING',
        'offer-sent': 'OFFERED',
        hired: 'HIRED',
        rejected: 'REJECTED',
    };

    const getStatusUpdateEndpoint = () => {
        if (!candidateId) return null;
        return isAdmin
            ? API_ENDPOINTS.ADMIN.UPDATE_APPLICANT_STATUS(candidateId)
            : API_ENDPOINTS.RECRUITER.UPDATE_APPLICANT_STATUS(candidateId);
    };

    const updateApplicantStatus = async (nextStage, reason) => {
        const endpoint = getStatusUpdateEndpoint();
        const status = stageToApiStatus[nextStage];

        if (!endpoint || !status) return false;

        const payload = reason
            ? { status, reason }
            : { status };

        setIsUpdatingStatus(true);
        try {
            const response = await httpClient.patch(endpoint, payload);
            const responseData = response?.data?.data || response?.data || response;

            const roleFromResponse = extractUpdatedByRole(responseData);
            setStatusUpdatedBy(roleFromResponse || (isAdmin ? 'Admin' : 'Recruiter'));
            return true;
        } catch (error) {
            console.error('Failed to update applicant status:', error);
            return false;
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const moveToNextStage = async () => {
        if (!nextStageInfo.nextStage || isUpdatingStatus) return;

        const updated = await updateApplicantStatus(nextStageInfo.nextStage);
        if (updated) {
            setApplicationStage(nextStageInfo.nextStage);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }
        navigate(-1);
    };

    const handleViewResume = () => {
        const isDirectProfessional = location.state?.isProfessionalView || !!professional?.fullname;

        if (!isDirectProfessional && cvUrl) {
            window.open(cvUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        const resumeSnapshot = {
            ...resume,
            category: professional?.subcategory || professional?.profession || resume?.subcategory || resume?.category,
            userType: 'officer',
            personalInfo: {
                firstName: professional?.firstName,
                lastName: professional?.lastName,
                email: professional?.email,
                contactNumber: resume?.phoneNumber,
                countryCode: resume?.phoneCode,
            },
            name: professional?.fullname,
            profilePhoto: professional?.profilePhotoUrl,
            skills: resume?.skills || [],
            licenses: resume?.licenses || [],
            education: resume?.education || [],
            medicalTravelDocuments: [
                ...(Array.isArray(resume?.medicalCertificates) ? resume.medicalCertificates.map((x) => ({ ...x, type: 'MEDICAL' })) : []),
                ...(Array.isArray(resume?.travelDocuments) ? resume.travelDocuments.map((x) => ({ ...x, type: 'TRAVEL' })) : []),
            ],
            seaService: resume?.seaService || [],
            stcwCertificates: resume?.stcwCertificates || [],
            nextOfKin: resume?.nextOfKin || [],
            referees: resume?.referees || [],
            biometrics: {
                gender: resume?.gender,
                height: resume?.height,
                weight: resume?.weight,
                bmi: resume?.bmi,
                eyeColor: resume?.eyeColor,
                overallSize: resume?.overallSize,
                shoeSize: resume?.shoeSize,
            },
        };

        if (onViewResume) {
            onViewResume(candidateId, resumeSnapshot);
            return;
        }

        if (location.pathname.includes('/trainingprovider/')) {
            navigate('/trainingprovider/cv-resume', { state: { resumeData: resumeSnapshot } });
        } else if (isAdmin) {
            navigate('/admin/admin-cv-resume', { state: { resumeData: resumeSnapshot } });
        } else {
            navigate('/admin/cv-resume', { state: { resumeData: resumeSnapshot } });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-10 h-10 border-4 border-[#003971] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Loading candidate details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-6">
            <div className="mb-4">
                <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-6">
                            {candidate.image ? (
                                <img src={candidate.image} alt={candidate.name} className="w-40 h-40 rounded-2xl object-cover border-2 border-gray-100" />
                            ) : (
                                <div className="w-40 h-40 rounded-2xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500">
                                    No image
                                </div>
                            )}

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h1>
                                <p className="text-lg text-gray-600 font-medium mb-3">{candidate.rank}</p>
                                <div className="space-y-2">
                                    {candidate.vesselTypes.map((v, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-700">
                                            <Ship className="h-4 w-4 text-[#003971]" />
                                            <span className="font-medium">{v}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{candidate.seaTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Briefcase className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{candidate.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {candidate.compliant && (
                            <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                Fully Compliant
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {!location.pathname.includes('/trainingprovider/') && (
                            <button onClick={handleViewResume} className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors">
                                <FileText className="h-5 w-5" />
                                View Resume
                            </button>
                        )}

                        <button onClick={() => setShowDocumentWallet(true)} className="bg-[#003971] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#002855] transition-colors">
                            <Wallet className="h-5 w-5" />
                            View Document Wallet
                        </button>

                        <button
                            onClick={() => onMessage
                                ? onMessage(candidateId, candidate.name)
                                : navigate(
                                    location.pathname.includes('/trainingprovider/') ? '/trainingprovider/chats' : (isAdmin ? '/admin/admin-chats' : '/admin/chats'),
                                    { state: { candidateId, candidateName: candidate.name } },
                                )
                            }
                            className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#003971] hover:text-white transition-colors"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Message {candidate.name}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Briefcase className="h-5 w-5 text-[#003971]" />
                        <h2 className="text-lg font-bold text-[#003971]">Experience Summary</h2>
                    </div>
                    <div className="space-y-3">
                        {candidate.experience.length > 0 ? candidate.experience.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl">
                                <div className="h-2 w-2 rounded-full bg-[#003971] mt-2 flex-shrink-0" />
                                <p className="text-gray-700 font-medium">{item}</p>
                            </div>
                        )) : <div className="bg-gray-50 p-3.5 rounded-xl text-gray-600 text-sm">No experience summary available.</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Headphones className="h-5 w-5 text-[#003971]" />
                        <h2 className="text-lg font-bold text-[#003971]">Key Skills & Competencies</h2>
                    </div>
                    <div className="space-y-4">
                        {candidate.skills.length > 0 ? candidate.skills.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-gray-900 font-medium">{skill.name}</span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < skill.rating ? 'fill-[#003971] text-[#003971]' : 'fill-gray-200 text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        )) : <div className="bg-gray-50 p-3.5 rounded-xl text-gray-600 text-sm">No key skills available.</div>}
                    </div>
                </div>

                {shouldShowApplicationStatus && (
                    <div className="bg-[#f3f4f6] rounded-2xl border border-[#eceff3] shadow-sm px-5 py-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                            <div>
                                <h2 className="text-[31px] leading-none font-bold text-[#003971]">Application Status</h2>
                                {statusUpdatedBy && (
                                    <p className="mt-1 text-xs font-medium text-gray-500">Updated by {statusUpdatedBy}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="h-8 px-5 rounded-full text-red-600 bg-[#f8e7ea] hover:bg-[#f3dde1] transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isUpdatingStatus}
                                >
                                    Reject Candidate
                                </button>
                                <button
                                    onClick={moveToNextStage}
                                    className="h-8 bg-[#003971] text-white px-7 rounded-full text-sm font-medium hover:bg-[#002f61] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={!nextStageInfo.nextStage || isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? 'Updating...' : nextStageInfo.buttonText}
                                </button>
                            </div>
                        </div>

                        <div className="relative px-6 pt-1">
                            <div className="absolute left-10 right-10 top-3.5 h-px bg-[#d4d9df]" />
                            <div
                                className="absolute left-10 top-3.5 h-px bg-[#003971] transition-all"
                                style={{ width: currentStageIndex < 0 ? '0%' : `calc((100% - 5rem) * ${(currentStageIndex / Math.max(1, stages.length - 1)).toFixed(4)})` }}
                            />

                            <div className="relative grid grid-cols-4 gap-2">
                                {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex;
                                    const isCurrent = idx === currentStageIndex;
                                    const isUpcoming = idx > currentStageIndex;

                                    return (
                                        <div key={stage.id} className="flex flex-col items-center text-center">
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center mb-3 text-[11px] font-semibold ${
                                                    isCompleted
                                                        ? 'bg-[#003971] border-[#003971] text-white'
                                                        : isCurrent
                                                            ? 'bg-white border-[#003971] text-[#003971]'
                                                            : 'bg-[#f3f4f6] border-[#d8dde4] text-[#c2c8cf]'
                                                }`}
                                            >
                                                {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                                            </div>
                                            <p className={`text-[18px] leading-none font-medium ${isCurrent ? 'text-[#003971]' : isUpcoming ? 'text-[#b6bdc8]' : 'text-[#1f2937]'}`}>
                                                {stage.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 mb-3">Reject Candidate?</h3>

                            <p className="text-gray-600 mb-6">
                                Are you sure you want to reject this candidate? This action cannot be undone.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason"
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!rejectReason.trim()) return;
                                        updateApplicantStatus('rejected', rejectReason.trim()).then((updated) => {
                                            if (!updated) return;
                                            setShowRejectModal(false);
                                            setRejectReason('');
                                            navigate(-1);
                                        });
                                    }}
                                    disabled={!rejectReason.trim() || isUpdatingStatus}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingStatus ? 'Rejecting...' : 'Reject Candidate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDocumentWallet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-0 max-w-4xl w-full max-h-[85vh] flex flex-col relative">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#003971] mb-1">Document Wallet</h3>
                                    <p className="text-sm text-gray-600">Documents from applicant profile and resume snapshot</p>
                                </div>
                                <button onClick={() => setShowDocumentWallet(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-4">
                                    {documentWallet.folders.length > 0 ? documentWallet.folders.map((folder) => (
                                        <div key={folder.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-[#003971] p-2.5 rounded-lg">
                                                    <Folder className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{folder.name}</h4>
                                                    <p className="text-sm text-gray-600">{folder.documents.length} documents</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {folder.documents.map((doc) => {
                                                    const badge = getStatusBadge(doc.status);
                                                    return (
                                                        <div key={doc.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <File className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-900 mb-1">{doc.name}</p>
                                                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>Expires: {doc.expiryDate}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                                    <div className={`${badge.cls} px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5`}>
                                                                        {badge.icon}
                                                                        {badge.label}
                                                                    </div>

                                                                    <button onClick={() => setSelectedDocument(doc)} className="p-2 text-[#003971] hover:bg-blue-50 rounded-lg transition-colors" title="View Document">
                                                                        <Eye className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-sm text-gray-600">
                                            No documents available.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex items-center justify-end flex-shrink-0">
                                <button onClick={() => setShowDocumentWallet(false)} className="bg-[#003971] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#002855] transition-colors">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedDocument && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedDocument(null)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            Expiry: {selectedDocument.expiryDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (selectedDocument.url) window.open(selectedDocument.url, '_blank', 'noopener,noreferrer');
                                        }}
                                        className="p-2 text-gray-500 hover:text-[#003971] hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setSelectedDocument(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-100 p-6 overflow-auto flex items-center justify-center">
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-2xl w-full aspect-[3/4] flex flex-col relative">
                                    <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {selectedDocument.url ? (
                                            /\.pdf(\?|$)/i.test(selectedDocument.url) ? (
                                                <iframe src={selectedDocument.url} title="Document Preview" className="w-full h-full" />
                                            ) : (
                                                <img src={selectedDocument.url} alt="Document Preview" className="w-full h-full object-contain" />
                                            )
                                        ) : (
                                            <div className="text-sm font-medium text-gray-500">No preview available</div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100">
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-900">{selectedDocument.name}</p>
                                            <p className="text-gray-500">Uploaded on {selectedDocument.uploadedOn || 'N/A'}</p>
                                        </div>
                                        <span className="text-xs font-bold text-[#003971] bg-blue-50 px-2 py-1 rounded">
                                            {selectedDocument.verificationStatus || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CandidateSummary;
