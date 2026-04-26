import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import jobService from '../../../../services/jobService';
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
    Sparkles,
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

const isPdfDocument = (url, mimeType) => {
    if (mimeType && String(mimeType).toLowerCase().includes('pdf')) return true;
    return typeof url === 'string' && /\.pdf(\?|$)/i.test(url);
};

const WALLET_APP_CATEGORY = 'APPLICATION_SUBMISSION';

const formatWalletCategoryTitle = (category) => {
    if (category === WALLET_APP_CATEGORY) return 'This job application';
    return (category || '').split('_').filter(Boolean).map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') || 'Other';
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

/** Maps API `ApplicationStatus` to internal pipeline stage ids (JobDetail tabs / progress UI). */
const mapApiStatusToStage = (status) => {
    const normalized = String(status || '').toUpperCase();
    const map = {
        APPLIED: null,
        UNDER_REVIEW: 'under-review',
        REVIEWING: 'under-review',
        SHORTLISTED: 'shortlisted',
        INTERVIEW: 'interviewing',
        INTERVIEWED: 'interviewing',
        INTERVIEWING: 'interviewing',
        OFFER: 'offered',
        OFFERED: 'offered',
        ACCEPTED: 'offered',
        HIRED: 'hired',
        REJECTED: 'rejected',
        WITHDRAWN: 'withdrawn',
    };
    return map[normalized] ?? null;
};

/** Backend `ApplicationStatus` values — used to detect an application row vs a match/candidate stub. */
const APPLICATION_STATUS_VALUES = new Set([
    'APPLIED',
    'SHORTLISTED',
    'UNDER_REVIEW',
    'REVIEWING',
    'INTERVIEWED',
    'INTERVIEWING',
    'INTERVIEW',
    'OFFERED',
    'OFFER',
    'ACCEPTED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
]);

function rawApplicantLooksLikeApplicationRow(raw) {
    if (!raw || raw.id == null) return false;
    const st = String(raw.status || '').toUpperCase();
    if (APPLICATION_STATUS_VALUES.has(st)) return true;
    if (raw.jobId != null || raw.job?.id != null) return true;
    return false;
}

/**
 * PATCH …/applicants/:id/status expects the job-application row id.
 * Route `:candidateId` may be a professional id on some entry points — do not assume the URL alone is correct unless other context matches.
 */
function resolveApplicantRecordIdForStatusPatch(navState, urlCandidateId, fetchedRecord) {
    const cd = navState?.candidateData;
    const raw = cd?.rawApplicant;

    if (navState?.fromJobDetail && cd?.id != null) {
        return String(cd.id);
    }

    if (rawApplicantLooksLikeApplicationRow(raw)) {
        return String(raw.id);
    }

    if (fetchedRecord?.application?.id != null) {
        return String(fetchedRecord.application.id);
    }
    if (rawApplicantLooksLikeApplicationRow(fetchedRecord)) {
        return String(fetchedRecord.id);
    }

    if (urlCandidateId) return String(urlCandidateId);
    return null;
}

function formatStatusPatchError(err) {
    const d = err?.data;
    if (d && typeof d === 'object') {
        const m = d.message ?? d.error;
        if (Array.isArray(m)) return m.filter(Boolean).join('; ');
        if (typeof m === 'string' && m.trim()) return m.trim();
    }
    if (typeof d === 'string' && d.trim()) return d.trim();
    return err?.message || 'Could not update status';
}

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
            'under-review': 'under-review',
            shortlisted: 'shortlisted',
            interviewing: 'interviewing',
            offered: 'offered',
            /** Legacy tab id from older UI */
            'offer-sent': 'offered',
            hired: 'hired',
            rejected: 'rejected',
            withdrawn: 'withdrawn',
        };

        return stageMap[status] !== undefined ? stageMap[status] : null;
    };

    const [applicationStage, setApplicationStage] = useState(getInitialStage());
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdatedBy, setStatusUpdatedBy] = useState(null);
    const [statusActionError, setStatusActionError] = useState('');
    const [isBookingActionLoading, setIsBookingActionLoading] = useState(false);
    const [showBookingRejectModal, setShowBookingRejectModal] = useState(false);
    const [bookingRejectReason, setBookingRejectReason] = useState('');

    const statusPatchApplicationId = useMemo(
        () => resolveApplicantRecordIdForStatusPatch(location.state, candidateId, fetchedCandidate),
        [location.state, candidateId, fetchedCandidate],
    );

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            const rawApplicant = location.state?.candidateData?.rawApplicant;
            const fromJobDetail = !!location.state?.fromJobDetail;
            const rowFromJob = location.state?.candidateData;
            const isMatchesRow = rowFromJob?.status === 'matches';

            if (!candidateId) {
                setIsLoading(false);
                return;
            }

            const fromAttendance = !!location.state?.fromAttendance;
            const isTrainingProviderUser = currentUserType === 'training-provider';

            if (fromAttendance && (isAdmin || isTrainingProviderUser)) {
                try {
                    setIsLoading(true);
                    const bookingId = location.state?.bookingId;
                    if (bookingId) {
                        const bPath = isAdmin
                            ? API_ENDPOINTS.ADMIN.BOOKING_DETAIL(bookingId)
                            : API_ENDPOINTS.TRAINER.BOOKING_DETAIL(bookingId);
                        const bRes = await httpClient.get(bPath);
                        const booking = bRes?.data?.booking ?? bRes?.data?.data?.booking ?? bRes?.data;
                        const professional = booking?.professional || booking?.trainee || booking?.user || null;
                        const att = Array.isArray(booking?.attachedDocuments) ? booking.attachedDocuments : [];

                        const mergedCandidate = {
                            professional,
                            booking,
                            application: {
                                professional,
                                attachedDocuments: att,
                                cvUrl: booking?.cvUrl || null,
                                coverLetterUrl: booking?.coverLetterUrl || null,
                                coverLetter: booking?.coverLetter ?? null,
                                resumeSnapshot: booking?.resumeSnapshot || professional?.resume || null,
                                status: booking?.bookingStatus || booking?.applicationStatus || 'APPLIED',
                            },
                        };

                        setFetchedCandidate(mergedCandidate);
                        const appStatus = mergedCandidate.application?.status;
                        setApplicationStage(appStatus ? mapApiStatusToStage(appStatus) : null);
                        setStatusUpdatedBy(extractUpdatedByRole(mergedCandidate));
                    } else {
                        // Fallback (older navigation): no booking id passed.
                        const profPath = isAdmin
                            ? API_ENDPOINTS.ADMIN.PROFESSIONAL_DETAIL(candidateId)
                            : API_ENDPOINTS.TRAINER.PROFESSIONAL_DETAIL(candidateId);
                        const response = await httpClient.get(profPath);
                        const responseData = response?.data?.data || response?.data;
                        const obj = responseData?.professional ? responseData.professional : responseData;
                        if (obj) {
                            setFetchedCandidate(obj);
                            setApplicationStage(obj.application?.status || obj.status ? mapApiStatusToStage(obj.application?.status || obj.status) : null);
                            setStatusUpdatedBy(extractUpdatedByRole(obj));
                        }
                    }
                } catch (error) {
                    console.error('Failed to load professional for session attendee:', error);
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            const recruiterApplicationFetchId =
                !isAdmin && !isMatchesRow
                    ? (fromJobDetail && rowFromJob?.id != null
                        ? String(rowFromJob.id)
                        : rawApplicantLooksLikeApplicationRow(rawApplicant) && rawApplicant?.id != null
                            ? String(rawApplicant.id)
                            : fromJobDetail
                                ? String(candidateId)
                                : null)
                    : null;

            if (!isAdmin && recruiterApplicationFetchId) {
                try {
                    setIsLoading(true);
                    const response = await jobService.getApplicantDetails(recruiterApplicationFetchId, { asAdmin: false });
                    const responseData = response?.data?.data || response?.data;
                    if (responseData?.application) {
                        setFetchedCandidate(responseData);
                        const app = responseData.application;
                        if (app?.status) setApplicationStage(mapApiStatusToStage(app.status));
                        setStatusUpdatedBy(extractUpdatedByRole(responseData));
                    } else if (responseData) {
                        setFetchedCandidate({ application: responseData });
                        const app = responseData;
                        if (app?.status) setApplicationStage(mapApiStatusToStage(app.status));
                        setStatusUpdatedBy(extractUpdatedByRole(responseData));
                    } else if (rawApplicant) {
                        setFetchedCandidate(rawApplicant);
                        if (rawApplicant.status) setApplicationStage(mapApiStatusToStage(rawApplicant.status));
                        setStatusUpdatedBy(extractUpdatedByRole(rawApplicant));
                    }
                } catch (error) {
                    console.error('Failed to fetch recruiter applicant details:', error);
                    if (rawApplicant) {
                        setFetchedCandidate(rawApplicant);
                        if (rawApplicant.status) setApplicationStage(mapApiStatusToStage(rawApplicant.status));
                        setStatusUpdatedBy(extractUpdatedByRole(rawApplicant));
                    }
                } finally {
                    setIsLoading(false);
                }
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
                if (isProfessionalView) {
                    const response = await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONAL_DETAIL(candidateId));
                    const responseData = response?.data?.data || response?.data;
                    const obj = responseData?.professional ? responseData.professional : responseData;
                    if (obj) {
                        setFetchedCandidate(obj);
                        if (obj.application?.status || obj.status) {
                            setApplicationStage(mapApiStatusToStage(obj.application?.status || obj.status));
                        }
                        setStatusUpdatedBy(extractUpdatedByRole(obj));
                    }
                } else {
                    const response = await jobService.getApplicantDetails(candidateId, { asAdmin: true });
                    const responseData = response?.data?.data || response?.data;
                    const obj = responseData;

                    if (obj) {
                        setFetchedCandidate(obj);
                        if (obj.application?.status || obj.status) {
                            setApplicationStage(mapApiStatusToStage(obj.application?.status || obj.status));
                        }
                        setStatusUpdatedBy(extractUpdatedByRole(obj));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch candidate details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidateDetails();
    }, [candidateId, isAdmin, currentUserType, location.state]);

    const resolveApplicantData = () => {
        const fallback = location.state?.candidateData || {};
        const source = fetchedCandidate || fallback.rawApplicant || null;
        const isApplicationScopedView = !!location.state?.fromJobDetail || showApplicationStatus === true;
        const trainerAttendanceAttachmentOnly =
            !!location.state?.fromAttendance && currentUserType === 'training-provider' && !isAdmin;

        if (!source) {
            return {
                professional: null,
                resume: null,
                attachedDocuments: [],
                applicationAttachments: [],
                cvUrl: null,
                coverLetter: null,
                coverLetterUrl: null,
                fallback,
            };
        }

        if (source.application) {
            const application = source.application;
            const professional = application.professional || source.professional || null;
            const allowAdminFullDocumentAccess =
                isAdmin &&
                !!(application.job?.adminId || source.job?.adminId || location.state?.jobData?.adminId);

            return {
                professional,
                resume:
                    trainerAttendanceAttachmentOnly
                        ? null
                        : allowAdminFullDocumentAccess || !isApplicationScopedView
                            ? application.resumeSnapshot || professional?.resume || null
                            : application.resumeSnapshot || null,
                attachedDocuments:
                    trainerAttendanceAttachmentOnly
                        ? (Array.isArray(application.attachedDocuments)
                            ? application.attachedDocuments
                            : Array.isArray(source.attachedDocuments)
                                ? source.attachedDocuments
                                : [])
                        : allowAdminFullDocumentAccess || !isApplicationScopedView
                            ? source.attachedDocuments || application.attachedDocuments || professional?.documents || []
                            : Array.isArray(application.attachedDocuments)
                                ? application.attachedDocuments
                                : [],
                applicationAttachments: Array.isArray(application.attachedDocuments) ? application.attachedDocuments : [],
                cvUrl:
                    trainerAttendanceAttachmentOnly
                        ? null
                        : allowAdminFullDocumentAccess || !isApplicationScopedView
                            ? application.cvUrl || professional?.cvUrl || null
                            : application.cvUrl || null,
                coverLetter: application.coverLetter ?? null,
                coverLetterUrl: application.coverLetterUrl ?? null,
                fallback,
            };
        }

        if (source.professional) {
            const isApplicationRow = rawApplicantLooksLikeApplicationRow(source);
            const allowAdminFullDocumentAccess =
                isAdmin &&
                !!(source.job?.adminId || location.state?.jobData?.adminId);
            return {
                professional: source.professional,
                resume:
                    trainerAttendanceAttachmentOnly
                        ? null
                        : allowAdminFullDocumentAccess || !isApplicationScopedView || !isApplicationRow
                            ? source.resumeSnapshot || source.professional.resume || null
                            : source.resumeSnapshot || null,
                attachedDocuments:
                    trainerAttendanceAttachmentOnly
                        ? (Array.isArray(source.attachedDocuments) ? source.attachedDocuments : [])
                        : allowAdminFullDocumentAccess || !isApplicationScopedView || !isApplicationRow
                            ? source.attachedDocuments || source.professional.documents || []
                            : Array.isArray(source.attachedDocuments)
                                ? source.attachedDocuments
                                : [],
                applicationAttachments:
                    isApplicationRow && Array.isArray(source.attachedDocuments) ? source.attachedDocuments : [],
                cvUrl:
                    trainerAttendanceAttachmentOnly
                        ? null
                        : allowAdminFullDocumentAccess || !isApplicationScopedView || !isApplicationRow
                            ? source.cvUrl || source.professional.cvUrl || null
                            : source.cvUrl || null,
                coverLetter: isApplicationRow ? (source.coverLetter ?? null) : null,
                coverLetterUrl: isApplicationRow ? (source.coverLetterUrl ?? null) : null,
                fallback,
            };
        }

        return {
            professional: source,
            resume: source.resume || null,
            attachedDocuments: source.documents || [],
            applicationAttachments: [],
            cvUrl: source.cvUrl || null,
            coverLetter: null,
            coverLetterUrl: null,
            fallback,
        };
    };

    const { professional, resume, attachedDocuments, applicationAttachments, cvUrl, coverLetter, coverLetterUrl, fallback } =
        resolveApplicantData();

    const adminCreatedJobApplicationView =
        isAdmin &&
        !!(
            fetchedCandidate?.application?.job?.adminId ||
            fetchedCandidate?.job?.adminId ||
            location.state?.jobData?.adminId
        );

    /** Job applicant flow: recruiters see only application-submitted files; admin-created jobs can still expose the full document set. */
    const walletJobApplicationOnly =
        (!!location.state?.fromJobDetail || showApplicationStatus === true) &&
        !adminCreatedJobApplicationView;

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
        const applicationSubmissionDocs = [];

        if (cvUrl) {
            applicationSubmissionDocs.push({
                id: 'wallet-app-cv',
                category: WALLET_APP_CATEGORY,
                name: 'CV / resume',
                walletSubtitle: 'File submitted with this application',
                expiryDate: '—',
                status: 'valid',
                url: cvUrl,
                mimeType: isPdfDocument(cvUrl, null) ? 'application/pdf' : null,
                uploadedOn: 'N/A',
                verificationStatus: 'SUBMITTED',
                walletKind: 'file',
            });
        }
        if (coverLetterUrl) {
            applicationSubmissionDocs.push({
                id: 'wallet-app-cover-file',
                category: WALLET_APP_CATEGORY,
                name: 'Cover letter (document)',
                walletSubtitle: 'Uploaded with this application',
                expiryDate: '—',
                status: 'valid',
                url: coverLetterUrl,
                mimeType: isPdfDocument(coverLetterUrl, null) ? 'application/pdf' : null,
                uploadedOn: 'N/A',
                verificationStatus: 'SUBMITTED',
                walletKind: 'file',
            });
        }
        if (typeof coverLetter === 'string' && coverLetter.trim()) {
            const body = coverLetter.trim();
            applicationSubmissionDocs.push({
                id: 'wallet-app-cover-text',
                category: WALLET_APP_CATEGORY,
                name: 'Cover letter (written)',
                walletSubtitle: body.length > 100 ? `${body.slice(0, 100)}…` : body,
                expiryDate: '—',
                status: 'valid',
                url: '',
                mimeType: null,
                uploadedOn: 'N/A',
                verificationStatus: 'SUBMITTED',
                walletKind: 'text',
                textContent: body,
            });
        }
        (Array.isArray(applicationAttachments) ? applicationAttachments : []).forEach((d, idx) => {
            applicationSubmissionDocs.push({
                id: d.id || `wallet-app-attach-${idx}`,
                category: WALLET_APP_CATEGORY,
                name: d.name || 'Attached document',
                walletSubtitle: formatWalletCategoryTitle(d.category),
                expiryDate: toDisplayDate(d.expiryDate),
                status: getDocStatus(d.expiryDate),
                url: d.fileUrl || '',
                mimeType: d.mimeType || null,
                uploadedOn: toDisplayDate(d.createdAt),
                verificationStatus: d.verificationStatus || 'PENDING',
                walletKind: 'file',
            });
        });

        if (walletJobApplicationOnly) {
            const allDocs = applicationSubmissionDocs;
            const categories = [...new Set(allDocs.map((d) => d.category))];
            categories.sort((a, b) => {
                if (a === WALLET_APP_CATEGORY) return -1;
                if (b === WALLET_APP_CATEGORY) return 1;
                return String(a).localeCompare(String(b));
            });
            return {
                folders: categories.map((category) => ({
                    id: category,
                    categoryKey: category,
                    name: formatWalletCategoryTitle(category),
                    documents: allDocs.filter((d) => d.category === category),
                })),
            };
        }

        const docsFromAttached = (Array.isArray(attachedDocuments) ? attachedDocuments : []).map((d) => ({
            id: d.id,
            category: d.category || 'OTHER',
            name: d.name || d.title || d.fileName || d.number || 'Course booking document',
            expiryDate: toDisplayDate(d.expiryDate),
            status: getDocStatus(d.expiryDate),
            url: d.fileUrl || d.url || d.documentUrl || '',
            mimeType: d.mimeType || null,
            uploadedOn: toDisplayDate(d.createdAt),
            verificationStatus: d.verificationStatus || 'PENDING',
            walletKind: 'file',
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
                    mimeType: item?.mimeType || null,
                    uploadedOn: 'N/A',
                    verificationStatus: 'N/A',
                    walletKind: 'file',
                });
            });
        };

        pushResumeDoc('LICENSES_ENDORSEMENTS', resume?.licenses, 'License');
        pushResumeDoc('MEDICAL_CERTIFICATES', resume?.medicalCertificates, 'Medical Certificate');
        pushResumeDoc('TRAVEL_DOCUMENTS', resume?.travelDocuments, 'Travel Document');
        pushResumeDoc('STCW_CERTIFICATES', resume?.stcwCertificates, 'STCW Certificate');

        const allDocs = [...applicationSubmissionDocs, ...docsFromAttached, ...resumeDocs];
        const categories = [...new Set(allDocs.map((d) => d.category))];
        categories.sort((a, b) => {
            if (a === WALLET_APP_CATEGORY) return -1;
            if (b === WALLET_APP_CATEGORY) return 1;
            return String(a).localeCompare(String(b));
        });

        return {
            folders: categories.map((category) => ({
                id: category,
                categoryKey: category,
                name: formatWalletCategoryTitle(category),
                documents: allDocs.filter((d) => d.category === category),
            })),
        };
    }, [attachedDocuments, resume, cvUrl, coverLetter, coverLetterUrl, applicationAttachments, walletJobApplicationOnly]);

    const shouldShowApplicationStatus =
        (showApplicationStatus || location.state?.fromJobDetail) &&
        location.state?.applicantStatus !== 'matches' &&
        !location.state?.fromAttendance;
    /** Visible stepper only (UNDER_REVIEW / APPLIED use `applicationStage` null or `under-review` — not shown here). */
    const stages = [
        { id: 'shortlisted', label: 'Shortlisted' },
        { id: 'interviewing', label: 'Interview' },
        { id: 'offered', label: 'Offer' },
        { id: 'hired', label: 'Hired' },
    ];
    const currentStageIndex = applicationStage ? stages.findIndex((stage) => stage.id === applicationStage) : -1;

    const getNextStageInfo = () => {
        if (applicationStage === 'rejected' || applicationStage === 'withdrawn') {
            return {
                nextStage: null,
                buttonText: applicationStage === 'withdrawn' ? 'Withdrawn' : 'Rejected',
            };
        }

        if (!applicationStage) {
            return { nextStage: 'under-review', buttonText: 'Start review' };
        }

        const stageProgression = {
            'under-review': { nextStage: 'shortlisted', buttonText: 'Shortlist candidate' },
            shortlisted: { nextStage: 'interviewing', buttonText: 'Move to interview' },
            interviewing: { nextStage: 'offered', buttonText: 'Send offer' },
            offered: { nextStage: 'hired', buttonText: 'Mark hired' },
            hired: { nextStage: null, buttonText: 'Hired' },
        };

        return stageProgression[applicationStage] || { nextStage: null, buttonText: 'Hired' };
    };

    const nextStageInfo = getNextStageInfo();

    /** Target stage id -> API `ApplicationStatus` for PATCH. */
    const stageToApiStatus = {
        'under-review': 'UNDER_REVIEW',
        shortlisted: 'SHORTLISTED',
        interviewing: 'INTERVIEW',
        offered: 'OFFER',
        hired: 'HIRED',
        rejected: 'REJECTED',
    };

    const updateApplicantStatus = async (nextStage) => {
        const status = stageToApiStatus[nextStage];

        if (!status) {
            setStatusActionError('Invalid stage update.');
            return false;
        }

        if (!statusPatchApplicationId) {
            setStatusActionError(
                'Missing job application id. Open this profile from the job’s applicant list (not matches-only) so the correct application can be updated.',
            );
            return false;
        }

        setIsUpdatingStatus(true);
        setStatusActionError('');
        try {
            const response = await jobService.updateApplicantStatus(statusPatchApplicationId, status, {
                asAdmin: isAdmin,
            });
            const responseData = response?.data?.data || response?.data || response;

            const roleFromResponse = extractUpdatedByRole(responseData);
            setStatusUpdatedBy(roleFromResponse || (isAdmin ? 'Admin' : 'Recruiter'));
            return true;
        } catch (error) {
            console.error('Failed to update applicant status:', error);
            setStatusActionError(formatStatusPatchError(error));
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

    const fromAttendanceReview = !!location.state?.fromAttendance;
    const bookingDecisionSessionId = location.state?.sessionId;
    const bookingDecisionBookingId = location.state?.bookingId;
    const adminCourseBookingsOnly = !!location.state?.adminCourseBookingsMode;
    const canTrainerDecideSessionBooking =
        fromAttendanceReview &&
        Boolean(bookingDecisionSessionId) &&
        Boolean(bookingDecisionBookingId) &&
        !adminCourseBookingsOnly &&
        currentUserType === 'training-provider';
    const sessionBookingStatusUpper = String(location.state?.bookingStatus || '').toUpperCase();
    const sessionPaymentStatusUpper = String(location.state?.paymentStatus || '').toUpperCase();
    const sessionBookingIsPending = sessionBookingStatusUpper === 'PENDING';
    const sessionBookingCanReleasePayout =
        sessionBookingStatusUpper !== 'COMPLETED' &&
        sessionBookingStatusUpper !== 'CANCELLED' &&
        (sessionPaymentStatusUpper === 'SUCCEEDED' || sessionPaymentStatusUpper === 'PAID');
    const sessionBookingCanReject =
        sessionBookingIsPending || sessionBookingCanReleasePayout;

    const handleApproveSessionBooking = async () => {
        if (!bookingDecisionSessionId || !bookingDecisionBookingId) return;
        setIsBookingActionLoading(true);
        try {
            await httpClient.post(
                API_ENDPOINTS.TRAINER.APPROVE_ATTENDEE(bookingDecisionSessionId, bookingDecisionBookingId),
                {},
            );
            toast.success(sessionBookingCanReleasePayout ? 'Payout released.' : 'Attendee approved.');
            if (location.state?.returnPath) navigate(location.state.returnPath);
            else navigate(-1);
        } catch (e) {
            toast.error(e?.message || 'Could not approve this booking.');
        } finally {
            setIsBookingActionLoading(false);
        }
    };

    const handleRejectSessionBooking = async () => {
        if (!bookingDecisionSessionId || !bookingDecisionBookingId || !bookingRejectReason.trim()) return;
        setIsBookingActionLoading(true);
        try {
            await httpClient.post(
                API_ENDPOINTS.TRAINER.REJECT_ATTENDEE(bookingDecisionSessionId, bookingDecisionBookingId),
                { reason: bookingRejectReason.trim() },
            );
            toast.success(sessionBookingCanReleasePayout ? 'Booking rejected and payment refunded.' : 'Attendee rejected.');
            setShowBookingRejectModal(false);
            setBookingRejectReason('');
            if (location.state?.returnPath) navigate(location.state.returnPath);
            else navigate(-1);
        } catch (e) {
            toast.error(
                e?.message ||
                    'Could not reject this booking. If this keeps failing, the reject endpoint may not be deployed yet.',
            );
        } finally {
            setIsBookingActionLoading(false);
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
            <Toaster position="top-right" />
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
                        {(!location.pathname.includes('/trainingprovider/') || (location.state?.fromAttendance && isAdmin)) && (
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

                {fromAttendanceReview && location.state?.bookingId ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-5 w-5 text-[#003971]" />
                            <h2 className="text-lg font-bold text-[#003971]">Course session booking</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Booking ID{' '}
                            <span className="font-mono text-xs text-gray-800">{String(location.state.bookingId)}</span>
                            {location.state?.bookingStatus ? (
                                <>
                                    {' '}
                                    · Status{' '}
                                    <span className="font-semibold text-gray-900">
                                        {String(location.state.bookingStatus)}
                                    </span>
                                </>
                            ) : null}
                        </p>
                        {canTrainerDecideSessionBooking && (sessionBookingIsPending || sessionBookingCanReleasePayout) ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleApproveSessionBooking}
                                    disabled={isBookingActionLoading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait"
                                >
                                    <Check className="h-4 w-4" />
                                    {isBookingActionLoading
                                        ? 'Working…'
                                        : sessionBookingCanReleasePayout
                                            ? 'Complete / Release payout'
                                            : 'Accept booking'}
                                </button>
                                {sessionBookingCanReject ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingRejectModal(true)}
                                        disabled={isBookingActionLoading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                    >
                                        <X className="h-4 w-4" />
                                        {sessionBookingCanReleasePayout ? 'Reject / Refund' : 'Reject booking'}
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {adminCourseBookingsOnly
                                    ? 'Admin course booking overview: use session-level attendee tools to approve or reject pending trainees when a session is selected.'
                                    : canTrainerDecideSessionBooking
                                        ? 'This booking is not pending approval.'
                                        : 'Accept and reject actions are available for training providers when the booking is still pending.'}
                            </p>
                        )}
                    </div>
                ) : null}

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
                                    disabled={
                                        isUpdatingStatus ||
                                        applicationStage === 'rejected' ||
                                        applicationStage === 'withdrawn' ||
                                        applicationStage === 'hired'
                                    }
                                >
                                    Reject Candidate
                                </button>
                                <button
                                    onClick={moveToNextStage}
                                    className="h-8 bg-[#003971] text-white px-7 rounded-full text-sm font-medium hover:bg-[#002f61] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={
                                        !nextStageInfo.nextStage ||
                                        isUpdatingStatus ||
                                        applicationStage === 'rejected' ||
                                        applicationStage === 'withdrawn'
                                    }
                                >
                                    {isUpdatingStatus ? 'Updating...' : nextStageInfo.buttonText}
                                </button>
                            </div>
                        </div>

                        {statusActionError ? (
                            <p className="mb-4 text-sm font-medium text-red-600" role="alert">
                                {statusActionError}
                            </p>
                        ) : null}

                        <div className="relative px-6 pt-1">
                            <div className="absolute left-10 right-10 top-3.5 h-px bg-[#d4d9df]" />
                            <div
                                className="absolute left-10 top-3.5 h-px bg-[#003971] transition-all"
                                style={{ width: currentStageIndex < 0 ? '0%' : `calc((100% - 5rem) * ${(currentStageIndex / Math.max(1, stages.length - 1)).toFixed(4)})` }}
                            />

                            <div className="relative grid grid-cols-4 gap-1 sm:gap-2">
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
                                        updateApplicantStatus('rejected').then((updated) => {
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

                {showBookingRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBookingRejectModal(false);
                                    setBookingRejectReason('');
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {sessionBookingCanReleasePayout ? 'Reject and refund this booking?' : 'Reject this booking?'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                {sessionBookingCanReleasePayout
                                    ? 'The trainee will be cancelled for this session and their payment will be refunded. Add a short reason for your records.'
                                    : 'The trainee will be marked as rejected for this session. Add a short reason for your records.'}
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={bookingRejectReason}
                                    onChange={(e) => setBookingRejectReason(e.target.value)}
                                    placeholder="Please provide a reason"
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingRejectModal(false);
                                        setBookingRejectReason('');
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRejectSessionBooking}
                                    disabled={!bookingRejectReason.trim() || isBookingActionLoading}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBookingActionLoading
                                        ? 'Rejecting…'
                                        : sessionBookingCanReleasePayout
                                            ? 'Reject / Refund'
                                            : 'Reject booking'}
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
                                    <p className="text-sm text-gray-600">
                                        {walletJobApplicationOnly
                                            ? 'Only the CV, cover letter, and files the candidate included when they applied for this job.'
                                            : location.state?.fromAttendance
                                                ? (currentUserType === 'training-provider' && !isAdmin
                                                    ? 'Only the files attached to this specific course booking.'
                                                    : 'Course booking attachments, profile wallet documents, and resume-linked certificates.')
                                                : 'Documents from this application submission, profile wallet, and resume-linked certificates.'}
                                    </p>
                                </div>
                                <button onClick={() => setShowDocumentWallet(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-5">
                                    {documentWallet.folders.length > 0 ? documentWallet.folders.map((folder) => {
                                        const isApplicationFolder = folder.categoryKey === WALLET_APP_CATEGORY;
                                        return (
                                            <div
                                                key={folder.id}
                                                className={
                                                    isApplicationFolder
                                                        ? 'rounded-2xl border-2 border-[#003971]/20 bg-gradient-to-br from-slate-50 via-white to-[#EBF3FF] p-5 shadow-sm'
                                                        : 'bg-gray-50 rounded-xl p-5 border border-gray-200'
                                                }
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div
                                                        className={
                                                            isApplicationFolder
                                                                ? 'bg-gradient-to-br from-[#003971] to-[#002855] p-2.5 rounded-xl shadow-md'
                                                                : 'bg-[#003971] p-2.5 rounded-lg'
                                                        }
                                                    >
                                                        {isApplicationFolder ? (
                                                            <Sparkles className="h-5 w-5 text-white" />
                                                        ) : (
                                                            <Folder className="h-5 w-5 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{folder.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {isApplicationFolder
                                                                ? 'CV, cover letter, and documents included when they applied'
                                                                : `${folder.documents.length} document(s)`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {folder.documents.map((doc) => {
                                                        const isSubmitted = doc.verificationStatus === 'SUBMITTED';
                                                        const badge = isSubmitted
                                                            ? { label: 'Submitted', cls: 'bg-[#003971]/10 text-[#003971]', icon: <Check className="h-4 w-4" /> }
                                                            : getStatusBadge(doc.status);
                                                        const isText = doc.walletKind === 'text';
                                                        return (
                                                            <div
                                                                key={doc.id}
                                                                className={
                                                                    isApplicationFolder
                                                                        ? 'bg-white/95 rounded-xl p-4 border border-[#003971]/10 shadow-sm'
                                                                        : 'bg-white rounded-lg p-4 border border-gray-200'
                                                                }
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                        {isText ? (
                                                                            <FileText className="h-5 w-5 text-[#003971] mt-0.5 flex-shrink-0" />
                                                                        ) : (
                                                                            <File className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-gray-900 mb-0.5">{doc.name}</p>
                                                                            {doc.walletSubtitle ? (
                                                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{doc.walletSubtitle}</p>
                                                                            ) : null}
                                                                            {!isText ? (
                                                                                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1.5">
                                                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                                                    <span>Expires: {doc.expiryDate}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-xs text-gray-500 mt-1.5">Written in application form — open to read full text</p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                                        <div className={`${badge.cls} px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5`}>
                                                                            {badge.icon}
                                                                            {badge.label}
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setSelectedDocument(doc)}
                                                                            className="p-2 text-[#003971] hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title={isText ? 'Read cover letter' : 'View document'}
                                                                        >
                                                                            <Eye className="h-5 w-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-sm text-gray-600">
                                            {walletJobApplicationOnly
                                                ? 'No application documents to show (the candidate may not have attached a CV, cover letter, or extra files for this job).'
                                                : 'No documents available.'}
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
                                <div className="flex items-center gap-4 min-w-0">
                                    <button onClick={() => setSelectedDocument(null)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 truncate">{selectedDocument.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            {selectedDocument.walletKind === 'text' ? (
                                                <>
                                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                                    <span>Written cover letter</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                                    <span>Expires: {selectedDocument.expiryDate}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedDocument.url) window.open(selectedDocument.url, '_blank', 'noopener,noreferrer');
                                        }}
                                        disabled={!selectedDocument.url}
                                        className="p-2 text-gray-500 hover:text-[#003971] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                        title="Open / download file"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setSelectedDocument(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-100 p-6 overflow-auto flex items-stretch justify-center">
                                <div
                                    className={`bg-white shadow-lg rounded-xl overflow-hidden max-w-2xl w-full flex flex-col relative ${
                                        selectedDocument.walletKind === 'text' ? 'min-h-[320px] max-h-full' : 'aspect-[3/4] max-h-[calc(85vh-8rem)]'
                                    }`}
                                >
                                    <div className="flex-1 bg-gray-50 flex flex-col min-h-0 overflow-hidden">
                                        {selectedDocument.walletKind === 'text' && selectedDocument.textContent ? (
                                            <div className="flex-1 overflow-auto p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                {selectedDocument.textContent}
                                            </div>
                                        ) : selectedDocument.url ? (
                                            isPdfDocument(selectedDocument.url, selectedDocument.mimeType) ? (
                                                <iframe src={selectedDocument.url} title="Document Preview" className="w-full min-h-[50vh] flex-1 border-0" />
                                            ) : (
                                                <img src={selectedDocument.url} alt="Document Preview" className="w-full h-full object-contain" />
                                            )
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-500 p-6">
                                                No preview available
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100 gap-3">
                                        <div className="text-xs min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{selectedDocument.name}</p>
                                            <p className="text-gray-500 truncate">
                                                {selectedDocument.walletKind === 'text' ? 'Submitted with application' : `Uploaded on ${selectedDocument.uploadedOn || 'N/A'}`}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-[#003971] bg-blue-50 px-2 py-1 rounded flex-shrink-0">
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
