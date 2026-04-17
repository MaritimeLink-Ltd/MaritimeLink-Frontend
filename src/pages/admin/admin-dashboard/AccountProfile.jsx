import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, CheckCircle, AlertTriangle, FileText, Image as ImageIcon, Loader, Eye } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function countActiveJobs(jobs) {
    if (!Array.isArray(jobs) || jobs.length === 0) return 0;
    const withStatus = jobs.filter((j) => j?.status != null && String(j.status).length > 0);
    if (withStatus.length === 0) return 0;
    return jobs.filter((j) => String(j?.status || '').toUpperCase() === 'ACTIVE').length;
}

function countActiveCourses(courses) {
    if (!Array.isArray(courses) || courses.length === 0) return 0;
    const withStatus = courses.filter((c) => c?.status != null && String(c.status).length > 0);
    if (withStatus.length === 0) return 0;
    return courses.filter((c) => {
        const s = String(c?.status || '').toUpperCase();
        return s === 'ACTIVE' || s === 'PUBLISHED' || c?.isPublished === true;
    }).length;
}

/**
 * Candidates hired — prefers explicit API counters. If the recruiter detail
 * response does not include any of these fields, the UI shows 0 until the
 * backend adds one (e.g. candidatesHired, placementsCount).
 */
function resolveCandidatesHired(r) {
    const raw =
        r.candidatesHired ??
        r.candidates_hired ??
        r.hiredCandidates ??
        r.hired_count ??
        r.placementsCount ??
        r.placements_count;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Training provider: students trained — same pattern as hired count. */
function resolveStudentsTrained(r) {
    const raw = r.studentsTrained ?? r.students_trained ?? r.traineesCount ?? r.trainees_count;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

function companyDetailsSubmitted(r) {
    const org = (r.organizationName || '').trim();
    if (!org) return false;
    if (Number(r.registrationStep) >= 5) return true;
    return Boolean(
        (r.address || '').trim() ||
            (r.companyCity || '').trim() ||
            (r.website || '').trim() ||
            (r.companyCountry || '').trim()
    );
}

function hasKycIdDocuments(kyc, recruiter) {
    if (recruiter?.idPassportUrl) return true;
    if (!kyc || typeof kyc !== 'object') return false;
    return Boolean(kyc.documentFrontUrl || kyc.documentUrl || kyc.documentBackUrl);
}

function formatKycDate(value) {
    if (!value) return 'N/A';
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString();
    } catch {
        return String(value);
    }
}

/** Build document object for DocViewerModal from a KYC asset URL. */
function kycViewerDocument(label, url) {
    if (!url) return null;
    const lower = String(url).toLowerCase();
    const isPdf = lower.endsWith('.pdf') || lower.includes('.pdf?');
    return {
        name: label,
        url,
        type: isPdf ? 'pdf' : 'image',
        size: '—',
        date: 'KYC submission',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        Icon: FileText,
    };
}

function recruiterKycSubmitted(kyc) {
    if (!kyc || typeof kyc !== 'object') return false;
    return Boolean(
        kyc.documentFrontUrl ||
            kyc.documentUrl ||
            kyc.documentBackUrl ||
            kyc.selfieUrl ||
            (kyc.documentNumber && String(kyc.documentNumber).trim())
    );
}

function kycStatusBadgeClass(status) {
    const u = String(status || 'PENDING').toUpperCase();
    if (u === 'APPROVED' || u === 'VERIFIED') return 'bg-green-50 text-green-700 border border-green-200';
    if (u === 'REJECTED') return 'bg-red-50 text-red-700 border border-red-200';
    return 'bg-orange-50 text-orange-700 border border-orange-200';
}

function formatDocumentTypeLabel(raw) {
    if (!raw) return '—';
    return String(raw)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Risk tier row from KYC / account; IP row when API sends ipReputation. */
function buildRiskAnalysisDisplay(profileData) {
    const kyc = profileData?.kyc;
    const explicitIp = profileData?.ipReputation || profileData?.ipReputationStatus;
    if (explicitIp) {
        const s = String(explicitIp).toLowerCase();
        const tone =
            s.includes('high') || s.includes('poor') || s.includes('bad')
                ? 'bad'
                : s.includes('medium') || s.includes('warn')
                  ? 'warn'
                  : s.includes('clean') || s.includes('good') || s.includes('low')
                    ? 'good'
                    : 'muted';
        return {
            row1Label: 'IP reputation',
            row1Value: String(explicitIp),
            row1Tone: tone,
            row2Label: 'Email domain',
            row2Value: profileData?.isVerified ? 'Verified' : 'Not verified',
            row2Tone: profileData?.isVerified ? 'good' : 'warn',
            dotClass: tone === 'bad' ? 'bg-red-500' : tone === 'warn' ? 'bg-orange-500' : tone === 'good' ? 'bg-green-500' : 'bg-gray-400',
        };
    }

    if (kyc?.mismatchDetected || profileData?.hasCompanyMismatch || kyc?.hasCompanyMismatch) {
        return {
            row1Label: 'Risk tier',
            row1Value: 'Mismatch flagged',
            row1Tone: 'bad',
            row2Label: 'Email domain',
            row2Value: profileData?.isVerified ? 'Verified' : 'Not verified',
            row2Tone: profileData?.isVerified ? 'good' : 'warn',
            dotClass: 'bg-red-500',
        };
    }

    const tier = String(kyc?.riskLevel || profileData?.riskLevel || '').toUpperCase();
    let row1Value = 'Not assessed';
    let row1Tone = 'muted';
    if (tier === 'HIGH') {
        row1Value = 'High';
        row1Tone = 'bad';
    } else if (tier === 'MEDIUM') {
        row1Value = 'Medium';
        row1Tone = 'warn';
    } else if (tier === 'LOW') {
        row1Value = 'Low';
        row1Tone = 'good';
    }

    const dotClass =
        tier === 'HIGH' ? 'bg-red-500' : tier === 'MEDIUM' ? 'bg-orange-500' : tier === 'LOW' ? 'bg-green-500' : 'bg-gray-400';

    return {
        row1Label: 'Risk tier',
        row1Value,
        row1Tone,
        row2Label: 'Email domain',
        row2Value: profileData?.isVerified ? 'Verified' : 'Not verified',
        row2Tone: profileData?.isVerified ? 'good' : 'warn',
        dotClass,
    };
}

function riskValueToneClass(tone) {
    if (tone === 'good') return 'font-semibold text-green-600';
    if (tone === 'bad') return 'font-semibold text-red-600';
    if (tone === 'warn') return 'font-semibold text-orange-600';
    return 'font-semibold text-gray-500';
}

/** Address verification tick — uses KYC proof URLs or flags if the API sends them. */
function hasKycAddressVerified(kyc) {
    if (!kyc || typeof kyc !== 'object') return false;
    if (kyc.addressVerified === true) return true;
    const st = String(kyc.addressVerificationStatus || kyc.address_verification_status || '').toUpperCase();
    if (st === 'VERIFIED' || st === 'APPROVED') return true;
    return Boolean(kyc.addressProofUrl || kyc.addressDocumentUrl || kyc.utilityBillUrl);
}

/** Structured company vs web-source mismatches (e.g. GEMINI_GOOGLE_SEARCH). */
function getCompanyMismatchPayload(kyc) {
    if (!kyc || typeof kyc !== 'object') return null;
    if (kyc.companyMismatch && typeof kyc.companyMismatch === 'object') return kyc.companyMismatch;
    const raw = kyc.mismatchDetails;
    if (raw && typeof raw === 'object' && (raw.source || Array.isArray(raw.mismatches))) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && (parsed.source || Array.isArray(parsed.mismatches))) {
                return parsed;
            }
        } catch {
            return null;
        }
    }
    return null;
}

function humanizeFieldKey(field) {
    if (!field) return 'Field';
    return String(field)
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

function formatHttpErrorMessage(err) {
    const d = err?.data;
    if (d && typeof d === 'object') {
        const m = d.message ?? d.error;
        if (Array.isArray(m)) return m.filter(Boolean).join('; ');
        if (typeof m === 'string' && m.trim()) return m.trim();
    }
    if (typeof d === 'string' && d.trim()) return d.trim();
    return err?.message || 'Request failed';
}

function extractCreatedNoteFromPostResponse(response) {
    if (!response || typeof response !== 'object') return null;
    const inner = response.data && typeof response.data === 'object' ? response.data : null;
    return (
        response.note ||
        inner?.note ||
        response.adminNote ||
        inner?.adminNote ||
        (Array.isArray(response.adminNotes) ? response.adminNotes[0] : null) ||
        (Array.isArray(inner?.adminNotes) ? inner.adminNotes[0] : null) ||
        (Array.isArray(response.notes) ? response.notes[0] : null) ||
        (Array.isArray(inner?.notes) ? inner.notes[0] : null) ||
        null
    );
}

function mapApiNoteToUi(apiNote, fallbackContent) {
    const c = apiNote?.content ?? apiNote?.text ?? apiNote?.note ?? fallbackContent;
    const createdAt = apiNote?.createdAt ? new Date(apiNote.createdAt).toLocaleString() : 'Just now';
    const author = apiNote?.author ?? apiNote?.admin?.email ?? apiNote?.createdBy ?? 'You (Admin)';
    const initials = (() => {
        const email = apiNote?.admin?.email;
        if (email && typeof email === 'string') {
            return email
                .split('@')[0]
                .split(/[.\s_-]/)
                .filter(Boolean)
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return String(author).substring(0, 2).toUpperCase() || 'AD';
    })();
    return {
        id: apiNote?.id ?? Date.now(),
        author,
        initials,
        time: createdAt,
        content: (c || '').trim(),
    };
}

/** POST admin note — tries common paths/bodies (backends vary). */
async function postAccountAdminNote(client, { accountId, isTrainer, content }) {
    const base = isTrainer
        ? API_ENDPOINTS.ADMIN.TRAINER_DETAIL(accountId)
        : API_ENDPOINTS.ADMIN.RECRUITER_DETAIL(accountId);
    const trimmed = content.trim();
    const attempts = [
        { url: `${base}/notes`, body: { content: trimmed } },
        { url: `${base}/notes`, body: { text: trimmed } },
        { url: `${base}/notes`, body: { note: trimmed } },
        { url: `${base}/admin-notes`, body: { content: trimmed } },
        { url: `${base}/admin-note`, body: { content: trimmed } },
    ];
    let lastErr;
    for (const { url, body } of attempts) {
        try {
            return await client.post(url, body);
        } catch (e) {
            lastErr = e;
            if (e.status === 404) continue;
            throw e;
        }
    }
    throw lastErr;
}

/** PATCH admin note — tries common paths/bodies. */
async function patchAccountAdminNote(client, { accountId, isTrainer, noteId, content }) {
    const base = isTrainer
        ? API_ENDPOINTS.ADMIN.TRAINER_DETAIL(accountId)
        : API_ENDPOINTS.ADMIN.RECRUITER_DETAIL(accountId);
    const trimmed = content.trim();
    const attempts = [
        { url: `${base}/notes/${noteId}`, body: { content: trimmed } },
        { url: `${base}/notes/${noteId}`, body: { text: trimmed } },
        { url: `${base}/admin-notes/${noteId}`, body: { content: trimmed } },
    ];
    let lastErr;
    for (const { url, body } of attempts) {
        try {
            return await client.patch(url, body);
        } catch (e) {
            lastErr = e;
            if (e.status === 404) continue;
            throw e;
        }
    }
    throw lastErr;
}

function AccountProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Get ID from URL
    const isTrainerAccount = location.state?.accountType === 'trainer';

    const [activeTab, setActiveTab] = useState('Overview');
    const [timeFilter, setTimeFilter] = useState('Today');
    const [newNote, setNewNote] = useState('');
    const [showNoteNotification, setShowNoteNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [noteNotificationTone, setNoteNotificationTone] = useState('success');
    const [isPostingNote, setIsPostingNote] = useState(false);
    const noteTextareaRef = useRef(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editNoteContent, setEditNoteContent] = useState('');
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [showApprovePopup, setShowApprovePopup] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showActionNotification, setShowActionNotification] = useState(false);
    const [actionNotificationMessage, setActionNotificationMessage] = useState('');
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [notes, setNotes] = useState([]);

    // Recruiter API state
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoadingRecruiter, setIsLoadingRecruiter] = useState(false);
    const [recruiterFetchError, setRecruiterFetchError] = useState('');
    const [apiDocuments, setApiDocuments] = useState([]);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);

    // Determine data based on ID prefix
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = UUID_REGEX.test(id || '');
    const isKYC = id?.startsWith('KYC');
    const isTrainingProvider = id?.startsWith('TP');
    const isProfessional = id?.startsWith('PRO');
    // A recruiter if old mock prefix OR a real UUID from the recruiters tab
    const isRecruiter = id?.startsWith('REC') || (isUUID && !isTrainerAccount);
    const isTrainer = isUUID && isTrainerAccount;

    useEffect(() => {
        if (isUUID) {
            setIsLoadingRecruiter(true);
            setRecruiterFetchError('');
            const detailEndpoint = isTrainerAccount
                ? API_ENDPOINTS.ADMIN.TRAINER_DETAIL(id)
                : API_ENDPOINTS.ADMIN.RECRUITER_DETAIL(id);
            httpClient.get(detailEndpoint)
                .then((response) => {
                    const r = response?.data?.trainer || response?.data?.recruiter || response?.trainer || response?.recruiter || response;
                    if (r && r.id) {
                        const fullName = [r.firstName, r.middleName, r.lastName]
                            .filter(Boolean).join(' ') || r.organizationName || 'Unknown';
                        setRecruiterData({
                            name: fullName,
                            role: r.role === 'TRAINING_AGENT' ? 'TRAINING AGENT' : 'RECRUITER',
                            roleDetail: r.role === 'TRAINING_AGENT' ? 'Training Agent at' : 'Recruiter at',
                            company: r.organizationName || 'N/A',
                            email: r.email || 'N/A',
                            phone: r.phoneCode && r.phoneNumber ? `${r.phoneCode} ${r.phoneNumber}` : 'N/A',
                            applied: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                            ip: 'N/A',
                            companyName: r.organizationName || 'N/A',
                            companyWeb: r.website || 'N/A',
                            address: r.address || [r.companyCity, r.companyState, r.companyCountry].filter(Boolean).join(', ') || 'N/A',
                            plan: r.tier ? `${r.tier.charAt(0).toUpperCase()}${r.tier.slice(1).toLowerCase()} Plan` : 'Free Plan',
                            stats: {
                                activeJobs: isTrainerAccount
                                    ? countActiveCourses(r.courses || [])
                                    : countActiveJobs(r.jobs || []),
                                candidatesHired: isTrainerAccount
                                    ? resolveStudentsTrained(r)
                                    : resolveCandidatesHired(r),
                            },
                            statsLabels: isTrainerAccount
                                ? { stat1: 'Active Courses', stat2: 'Students Trained' }
                                : { stat1: 'Active Jobs', stat2: 'Candidates Hired' },
                            stage1Status: r.status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
                            stage2Status: r.kyc ? (r.kyc.status === 'APPROVED' ? 'COMPLETED' : 'PENDING') : 'PENDING',
                            stage1Checks: {
                                email: Boolean(r.isVerified),
                                phone: Boolean(r.phoneVerified),
                                company: companyDetailsSubmitted(r),
                            },
                            stage2Checks: {
                                idDocuments: hasKycIdDocuments(r.kyc, r),
                                addressVerified: hasKycAddressVerified(r.kyc),
                            },
                            // Extra raw fields for Submitted Details
                            personalRole: r.personalRole || 'N/A',
                            isVerified: r.isVerified,
                            phoneVerified: r.phoneVerified,
                            isAuthorized: r.isAuthorized,
                            agreedToTerms: r.agreedToTerms,
                            howDidYouHear: r.howDidYouHear || 'N/A',
                            status: r.status,
                            companyLinkedIn: r.companyLinkedIn || null,
                            companyCity: r.companyCity || 'N/A',
                            companyState: r.companyState || 'N/A',
                            companyZip: r.companyZip || 'N/A',
                            companyCountry: r.companyCountry || 'N/A',
                            profilePhotoUrl: r.profilePhotoUrl || null,
                            idPassportUrl: r.idPassportUrl || null,
                            jobs: r.jobs || [],
                            courses: r.courses || [],
                            kyc: r.kyc,
                            riskLevel: r.kyc?.riskLevel ?? r.riskLevel ?? null,
                            hasCompanyMismatch: Boolean(r.hasCompanyMismatch ?? r.kyc?.hasCompanyMismatch),
                            ipReputation: r.ipReputation || r.ipReputationStatus || null,
                        });
                        
                        // Extract and set admin notes from API response
                        if (r.adminNotes && Array.isArray(r.adminNotes)) {
                            setNotes(r.adminNotes.map(note => ({
                                id: note.id || Date.now(),
                                author: note.author || 'Admin',
                                initials: (note.author || 'A').substring(0, 1).toUpperCase(),
                                time: note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A',
                                content: note.content || note.text || ''
                            })));
                        }
                        
                        // Extract and set documents from API response
                        if (r.documents && Array.isArray(r.documents)) {
                            setApiDocuments(r.documents);
                        }

                        // Extract and set timeline events from API response
                        if (r.timeline && Array.isArray(r.timeline)) {
                            setTimelineEvents(r.timeline.map((event, index) => ({
                                id: event.id || index,
                                title: event.title || event.eventType || '',
                                description: event.description || event.message || '',
                                timestamp: event.timestamp || event.createdAt || '',
                                color: event.color || (index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'gray')
                            })));
                        }

                        // Extract and set activity logs from API response
                        if (r.activityLog && Array.isArray(r.activityLog)) {
                            setActivityLogs(r.activityLog.map(activity => ({
                                id: activity.id || Date.now(),
                                title: activity.title || activity.activityType || '',
                                description: activity.description || activity.message || '',
                                timestamp: activity.timestamp || activity.createdAt || '',
                                user: activity.user || activity.userId || 'System',
                                icon: activity.icon || 'default',
                                color: activity.color || 'blue'
                            })));
                        }
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch detail:', err);
                    setRecruiterFetchError(err.message || 'Failed to load details');
                })
                .finally(() => setIsLoadingRecruiter(false));
        }
    }, [id, isUUID, isTrainerAccount]);

    // Only use real API data - no mock data
    const getProfileData = () => {
        if (isUUID && recruiterData) return recruiterData; // Real API data
        
        // Return empty/loading state structure if no real data
        return {
            name: isLoadingRecruiter ? 'Loading...' : 'Data not available',
            role: '',
            roleDetail: '',
            company: 'N/A',
            email: 'N/A',
            phone: 'N/A',
            applied: 'N/A',
            ip: 'N/A',
            companyName: 'N/A',
            companyWeb: 'N/A',
            address: 'N/A',
            plan: 'N/A',
            stats: { activeJobs: 0, candidatesHired: 0 },
            statsLabels: { stat1: 'Active Jobs', stat2: 'Candidates Hired' },
            stage1Status: 'PENDING',
            stage2Status: 'PENDING',
            stage1Checks: { email: false, phone: false, company: false },
            stage2Checks: { idDocuments: false, addressVerified: false },
            riskLevel: null,
            hasCompanyMismatch: false,
            ipReputation: null,
            isVerified: false,
        };
    };

    const profileData = getProfileData();
    const stage1BadgeDone = profileData.stage1Status === 'COMPLETED';
    const stage2BadgeDone = profileData.stage2Status === 'COMPLETED';
    const s1 = profileData.stage1Checks || { email: false, phone: false, company: false };
    const s2 = profileData.stage2Checks || { idDocuments: false, addressVerified: false };
    const riskAnalysis = buildRiskAnalysisDisplay(profileData);

    // Use API documents if available, otherwise empty array (no mock data)
    const documents = apiDocuments || [];

    const allTabs = ['Overview', 'Submitted Details', `Documents (${documents.length})`, 'KYC', 'Activity Log', 'Admin Notes'];
    const tabs = isRecruiter || isTrainer ? allTabs.filter(tab => !tab.startsWith('Documents')) : allTabs;
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Handle posting a new note
    const handlePostNote = async () => {
        const text = newNote.trim();
        if (!text) {
            setNoteNotificationTone('error');
            setNotificationMessage('Please enter a note before posting.');
            setShowNoteNotification(true);
            setTimeout(() => setShowNoteNotification(false), 4000);
            return;
        }
        if (isUUID) {
            setIsPostingNote(true);
            try {
                const response = await postAccountAdminNote(httpClient, {
                    accountId: id,
                    isTrainer: isTrainerAccount,
                    content: text,
                });
                const apiNote = extractCreatedNoteFromPostResponse(response);
                const newNoteObj = apiNote
                    ? mapApiNoteToUi(apiNote, text)
                    : {
                        id: Date.now(),
                        author: 'You (Admin)',
                        initials: 'AD',
                        time: 'Just now',
                        content: text,
                    };
                setNotes([newNoteObj, ...notes]);
                setNewNote('');
                setNoteNotificationTone('success');
                setNotificationMessage('Note posted successfully!');
                setShowNoteNotification(true);
                setTimeout(() => setShowNoteNotification(false), 3000);
            } catch (err) {
                console.error('Failed to post note:', err);
                setNoteNotificationTone('error');
                setNotificationMessage(`Could not save note: ${formatHttpErrorMessage(err)}`);
                setShowNoteNotification(true);
                setTimeout(() => setShowNoteNotification(false), 6000);
            } finally {
                setIsPostingNote(false);
            }
            return;
        }
        const newNoteObj = {
            id: notes.length + 1,
            author: 'You (Admin)',
            initials: 'AD',
            time: 'Just now',
            content: text,
        };
        setNotes([newNoteObj, ...notes]);
        setNewNote('');
        setNoteNotificationTone('success');
        setNotificationMessage('Note saved locally (demo account).');
        setShowNoteNotification(true);
        setTimeout(() => setShowNoteNotification(false), 3000);
    };

    // Handle Add New Note button click
    const handleAddNewNote = () => {
        if (noteTextareaRef.current) {
            noteTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            noteTextareaRef.current.focus();
        }
    };

    // Handle edit note
    const handleEditNote = (note) => {
        setEditingNoteId(note.id);
        setEditNoteContent(note.content);
    };

    // Handle save edited note
    const handleSaveEdit = async (noteId) => {
        if (!editNoteContent.trim()) return;
        if (isUUID) {
            try {
                await patchAccountAdminNote(httpClient, {
                    accountId: id,
                    isTrainer: isTrainerAccount,
                    noteId,
                    content: editNoteContent.trim(),
                });
            } catch (err) {
                console.error('Failed to update note in API:', err);
                setNoteNotificationTone('error');
                setNotificationMessage(`Could not update note: ${formatHttpErrorMessage(err)}`);
                setShowNoteNotification(true);
                setTimeout(() => setShowNoteNotification(false), 6000);
                return;
            }
        }

        setNotes(notes.map((note) =>
            note.id === noteId
                ? { ...note, content: editNoteContent.trim() }
                : note
        ));
        setEditingNoteId(null);
        setEditNoteContent('');
        setNoteNotificationTone('success');
        setNotificationMessage('Note updated successfully!');
        setShowNoteNotification(true);
        setTimeout(() => setShowNoteNotification(false), 3000);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditNoteContent('');
    };

    // Handle Cancel Review
    const handleCancelReview = () => {
        navigate(-1);
    };

    // Handle Reject Account
    const handleRejectAccount = () => {
        setShowRejectPopup(true);
    };

    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    const confirmRejectAccount = async () => {
        if (!rejectReason.trim()) return;

        if (isUUID) {
            setIsSubmittingAction(true);
            // Backend updates login status for both RECRUITMENT_AGENT and TRAINING_AGENT via recruiters status route
            const statusEndpoint = API_ENDPOINTS.ADMIN.UPDATE_RECRUITER_STATUS(id);
            try {
                await httpClient.patch(statusEndpoint, {
                    status: 'REJECTED'
                });
                setActionNotificationMessage('Account rejected successfully!');
                setShowActionNotification(true);
                setShowRejectPopup(false);
                setRejectReason('');
                const navTab = isTrainerAccount ? 'Training Providers' : 'Recruiters';
                const navMsg = isTrainerAccount ? 'Training provider account rejected successfully!' : 'Recruiter account rejected successfully!';
                setTimeout(() => {
                    setShowActionNotification(false);
                    navigate('/admin/accounts', { state: { activeTab: navTab, successMessage: navMsg } });
                }, 2000);
            } catch (err) {
                console.error('Failed to reject recruiter:', err);
                setActionNotificationMessage('Failed to reject account. Please try again.');
                setShowActionNotification(true);
                setTimeout(() => setShowActionNotification(false), 3000);
            } finally {
                setIsSubmittingAction(false);
            }
        } else {
            setActionNotificationMessage('Account rejected successfully!');
            setShowActionNotification(true);
            setTimeout(() => {
                setShowActionNotification(false);
                navigate(-1);
            }, 2000);
            setShowRejectPopup(false);
            setRejectReason('');
        }
    };

    const cancelRejectAccount = () => {
        setShowRejectPopup(false);
        setRejectReason('');
    };

    // Handle Approve Account
    const handleApproveAccount = () => {
        setShowApprovePopup(true);
    };

    const confirmApproveAccount = async () => {
        if (isUUID) {
            setIsSubmittingAction(true);
            const statusEndpoint = API_ENDPOINTS.ADMIN.UPDATE_RECRUITER_STATUS(id);
            try {
                await httpClient.patch(statusEndpoint, {
                    status: 'APPROVED'
                });
                setActionNotificationMessage('Account approved successfully!');
                setShowActionNotification(true);
                setShowApprovePopup(false);
                const navTab = isTrainerAccount ? 'Training Providers' : 'Recruiters';
                const navMsg = isTrainerAccount ? 'Training provider account approved successfully!' : 'Recruiter account approved successfully!';
                setTimeout(() => {
                    setShowActionNotification(false);
                    navigate('/admin/accounts', { state: { activeTab: navTab, successMessage: navMsg } });
                }, 2000);
            } catch (err) {
                console.error('Failed to approve recruiter:', err);
                setActionNotificationMessage('Failed to approve account. Please try again.');
                setShowActionNotification(true);
                setTimeout(() => setShowActionNotification(false), 3000);
            } finally {
                setIsSubmittingAction(false);
            }
        } else {
            setActionNotificationMessage('Account approved successfully!');
            setShowActionNotification(true);
            setTimeout(() => {
                setShowActionNotification(false);
                navigate(-1);
            }, 2000);
            setShowApprovePopup(false);
        }
    };

    const cancelApproveAccount = () => {
        setShowApprovePopup(false);
    };

    // Handle document view
    const handleViewDocument = (doc) => {
        setSelectedDocument(doc);
        setShowDocViewer(true);
    };

    const closeDocViewer = () => {
        setShowDocViewer(false);
        setSelectedDocument(null);
    };

    // Document Viewer Modal Component
    const DocViewerModal = ({ isOpen, onClose, document }) => {
        if (!isOpen || !document) return null;

        return (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${document.iconBg} rounded-lg`}>
                                <document.Icon className={`h-5 w-5 ${document.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{document.name}</h3>
                                <p className="text-sm text-gray-500">{document.size} • {document.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(document.url);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link =
                                            window.document.createElement('a');
                                        link.href = url;
                                        link.download = document.name;
                                        window.document.body.appendChild(link);
                                        link.click();
                                        window.document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        // Fallback to opening in new tab
                                        window.open(document.url, '_blank');
                                    }
                                }}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
                        {document.type === 'pdf' ? (
                            <iframe
                                src={document.url}
                                className="w-full h-full rounded-lg shadow-sm bg-white"
                                title="Document Viewer"
                            />
                        ) : (
                            <img
                                src={document.url}
                                alt={document.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Loading state for UUID recruiter
    if (isUUID && isLoadingRecruiter) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader className="h-8 w-8 text-[#1e5a8f] animate-spin" />
                    <p className="text-gray-600 font-medium">Loading recruiter details...</p>
                </div>
            </div>
        );
    }

    // Error state for UUID recruiter
    if (isUUID && recruiterFetchError && !recruiterData) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Accounts
                </button>
                <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Recruiter</h2>
                    <p className="text-sm text-red-600">{recruiterFetchError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Accounts
            </button>

            {/* Note Posted Notification */}
            {showNoteNotification && (
                <div
                    className={`fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-md ${
                        noteNotificationTone === 'error' ? 'bg-red-600' : 'bg-green-600'
                    }`}
                    role="status"
                >
                    {noteNotificationTone === 'error' ? (
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                    ) : (
                        <CheckCircle className="h-5 w-5 shrink-0" />
                    )}
                    <span className="font-semibold text-sm leading-snug">{notificationMessage}</span>
                </div>
            )}

            {/* Action Notification */}
            {showActionNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{actionNotificationMessage}</span>
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocViewerModal
                isOpen={showDocViewer}
                onClose={closeDocViewer}
                document={selectedDocument}
            />

            {/* Reject Account Popup */}
            {showRejectPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reject Account</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this account..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                rows="4"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelRejectAccount}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRejectAccount}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Account Popup */}
            {showApprovePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Approve Account</h3>
                                <p className="text-sm text-gray-500">Confirm account approval</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to approve this account? The user will be notified and granted full access to the platform.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelApproveAccount}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproveAccount}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Approve Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                                {profileData.profilePhotoUrl ? (
                                    <img
                                        src={profileData.profilePhotoUrl}
                                        alt={profileData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.classList.remove('bg-white');
                                            e.target.parentNode.classList.add('bg-blue-100');
                                            e.target.parentNode.innerHTML = `<span class="text-blue-600 font-bold text-xl">${(profileData.name || '?').charAt(0).toUpperCase()}</span>`;
                                        }}
                                    />
                                ) : isUUID ? (
                                    <span className="text-blue-600 font-bold text-2xl bg-blue-100 w-full h-full flex items-center justify-center">
                                        {(profileData.name || '?').charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt={profileData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML = '<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                        }}
                                    />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                    {profileData.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                {profileData.roleDetail} {!isProfessional && <span className="text-[#1e5a8f] font-semibold">{profileData.company}</span>}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Applied: {profileData.applied}
                                </span>
                                {isUUID ? (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {profileData.email}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        IP: {profileData.ip}
                                    </span>
                                )}
                                {isUUID && profileData.status && (
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                        profileData.status === 'APPROVED' ? 'bg-green-50 text-green-700'
                                        : profileData.status === 'REJECTED' ? 'bg-red-50 text-red-700'
                                        : 'bg-orange-50 text-orange-700'
                                    }`}>{profileData.status}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {isProfessional && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/admin/candidate/${id}`)}
                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Resume
                            </button>
                            <button
                                onClick={() => navigate('/admin/admin-chats', { state: { candidateId: id, candidateName: profileData.name } })}
                                className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                            >
                                Message
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mt-6 -mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Stat 1 */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">{profileData.statsLabels?.stat1 || 'Active Jobs'}</div>
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{profileData.stats.activeJobs}</div>
                                </div>

                                {/* Stat 2 */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">{profileData.statsLabels?.stat2 || 'Candidates Hired'}</div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Users className="h-5 w-5 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{profileData.stats.candidatesHired}</div>
                                </div>
                            </div>

                            {/* Account Status Overview */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-4">Account Status Overview</h3>

                                <div className="grid grid-cols-2 gap-4">

                                    {/* Stage 1 */}
                                    <div className="bg-blue-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#1e5a8f] rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">01</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 1: Approval</div>
                                                    <div className="text-xs text-gray-600">Basic Account Setup</div>
                                                </div>
                                            </div>
                                            <span
                                                className={`flex items-center gap-1 text-xs font-bold ${
                                                    stage1BadgeDone ? 'text-green-600' : 'text-orange-600'
                                                }`}
                                            >
                                                {stage1BadgeDone ? (
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                ) : (
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                )}
                                                {profileData.stage1Status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                {s1.email ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" aria-hidden />
                                                )}
                                                <span className={s1.email ? 'text-gray-700' : 'text-gray-500'}>Email Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                {s1.phone ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" aria-hidden />
                                                )}
                                                <span className={s1.phone ? 'text-gray-700' : 'text-gray-500'}>Phone Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                {s1.company ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" aria-hidden />
                                                )}
                                                <span className={s1.company ? 'text-gray-700' : 'text-gray-500'}>Company Details Submitted</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stage 2 */}
                                    <div className="bg-orange-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border-2 border-orange-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-700 font-bold text-sm">02</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 2: KYC</div>
                                                    <div className="text-xs text-gray-600">Identity Verification</div>
                                                </div>
                                            </div>
                                            <span
                                                className={`flex items-center gap-1 text-xs font-bold ${
                                                    stage2BadgeDone ? 'text-green-600' : 'text-orange-600'
                                                }`}
                                            >
                                                {stage2BadgeDone ? (
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                ) : (
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                )}
                                                {profileData.stage2Status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                {s2.idDocuments ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" aria-hidden />
                                                )}
                                                <span className={s2.idDocuments ? 'text-gray-700' : 'text-gray-500'}>ID Document Upload</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                {s2.addressVerified ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" aria-hidden />
                                                )}
                                                <span className={s2.addressVerified ? 'text-gray-700' : 'text-gray-500'}>Address Verification</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Documents */}
                            {!(isRecruiter || isTrainer) && (
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="mb-4">
                                    <h3 className="text-base font-bold text-gray-900">Recent Documents</h3>
                                </div>

                                <div className="space-y-3">
                                    {documents.slice(0, 2).map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 ${doc.iconBg} rounded-lg`}>
                                                    <doc.Icon className={`h-5 w-5 ${doc.iconColor}`} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">Uploaded {doc.uploadTime} • {doc.size}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}
                        </>
                    )}

                    {activeTab === 'Submitted Details' && (
                        <>
                            {/* Stage Header with Approve Button */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <span className="text-[#1e5a8f] font-bold text-sm">01</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Stage 1: Account Approval</h3>
                                    </div>
                                    {profileData.status !== 'APPROVED' && (
                                        <button
                                            onClick={handleApproveAccount}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve
                                        </button>
                                    )}
                                    {profileData.status === 'APPROVED' && (
                                        <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-md">
                                            COMPLETED
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    {/* Line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                                    <div className="absolute top-5 left-0 w-1/3 h-0.5 bg-blue-500"></div>

                                    <div className="relative flex justify-between">
                                        {/* STAGE 1 - Completed */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">STAGE 1</span>
                                        </div>

                                        {/* REVIEW - Current */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">REVIEW</span>
                                        </div>

                                        {/* KYC - Pending */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-xs text-gray-400">3</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">KYC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Details</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Full Name</label>
                                        <div className="text-sm font-semibold text-gray-900">{profileData.name}</div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{profileData.email}</span>
                                            {(profileData.isVerified !== false) && (
                                                <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Phone Number</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{profileData.phone}</span>
                                            {profileData.phoneVerified === true && (
                                                <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                            )}
                                            {profileData.phoneVerified === false && isUUID && (
                                                <span className="text-xs font-semibold text-orange-500">(Not Verified)</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Role / Position */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Role</label>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {isProfessional
                                                ? 'Maritime Professional'
                                                : isUUID && profileData.personalRole
                                                    ? profileData.personalRole
                                                    : profileData.role === 'COMPANY' ? 'Company Admin' : 'Senior Recruiter'}
                                        </div>
                                    </div>

                                    {/* Account Type (UUID only) */}
                                    {isUUID && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Account Type</label>
                                            <div className="text-sm font-semibold text-gray-900">{profileData.role}</div>
                                        </div>
                                    )}

                                    {/* Account Status (UUID only) */}
                                    {isUUID && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Account Status</label>
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                                profileData.status === 'APPROVED' ? 'bg-green-50 text-green-700'
                                                : profileData.status === 'REJECTED' ? 'bg-red-50 text-red-700'
                                                : 'bg-orange-50 text-orange-700'
                                            }`}>{profileData.status || 'PENDING'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Company Information */}
                            {!isProfessional && (
                                <div className="bg-white rounded-xl border border-gray-100 p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Information</h3>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Company Name / Website */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Company Name</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">{profileData.companyName}</span>
                                                    {profileData.companyName && profileData.companyName !== 'N/A' && (
                                                        <span className="text-xs font-semibold text-blue-600">(Claimed)</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Website</label>
                                                {profileData.companyWeb && profileData.companyWeb !== 'N/A' ? (
                                                    <a
                                                        href={profileData.companyWeb.startsWith('http') ? profileData.companyWeb : `https://${profileData.companyWeb}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 hover:underline cursor-pointer"
                                                    >
                                                        <span className="text-sm font-semibold text-blue-600">{profileData.companyWeb}</span>
                                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                ) : <span className="text-sm text-gray-400">N/A</span>}
                                            </div>
                                        </div>

                                        {/* LinkedIn + Plan (UUID only) */}
                                        {isUUID && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">LinkedIn</label>
                                                    {profileData.companyLinkedIn ? (
                                                        <a href={profileData.companyLinkedIn} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline break-all">
                                                            {profileData.companyLinkedIn}
                                                        </a>
                                                    ) : <span className="text-sm text-gray-400">N/A</span>}
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Plan Tier</label>
                                                    <span className="text-sm font-semibold text-gray-900">{profileData.plan}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Address */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Address</label>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {profileData.address}
                                            </div>
                                        </div>

                                        {/* City / State / Country / ZIP (UUID only) */}
                                        {isUUID && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">City / State</label>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {[profileData.companyCity, profileData.companyState].filter(v => v && v !== 'N/A').join(', ') || 'N/A'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Country / ZIP</label>
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {[profileData.companyCountry, profileData.companyZip].filter(v => v && v !== 'N/A').join(' — ') || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Plan Tier (non-UUID) */}
                                        {!isUUID && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Plan Tier</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">{profileData.plan}</span>
                                                    <span className="text-xs text-gray-500">(Billed Annually)</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Compliance Declaration */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Declaration</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Declaration 1 — Authorized */}
                                    <div className={`flex items-start gap-3 p-3 border rounded-lg ${
                                        (isUUID ? profileData.isAuthorized : true)
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        {(isUUID ? profileData.isAuthorized : true)
                                            ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            : <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                                        <span className="text-sm text-gray-700">I confirm I am authorized to represent this company</span>
                                    </div>

                                    {/* Declaration 2 — Terms */}
                                    <div className={`flex items-start gap-3 p-3 border rounded-lg ${
                                        (isUUID ? profileData.agreedToTerms : true)
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        {(isUUID ? profileData.agreedToTerms : true)
                                            ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            : <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                                        <span className="text-sm text-gray-700">I accept the Terms of Service and Privacy Policy</span>
                                    </div>

                                    {/* Declaration 3 — How Did You Hear */}
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                            Heard about us via: <span className="font-semibold">{profileData.howDidYouHear || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={handleCancelReview}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel review
                                </button>
                                {profileData.status === 'APPROVED' ? (
                                    <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                                        ✓ APPROVED
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleRejectAccount}
                                            className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                        >
                                            Reject Account
                                        </button>
                                        <button
                                            onClick={handleApproveAccount}
                                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!isRecruiter && !isTrainer && activeTab.startsWith('Documents') && (
                        <>
                            {/* Documents Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Documents</h3>

                                {/* Document Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Document Thumbnail */}
                                            <div className="aspect-[4/3] bg-gray-100 relative group cursor-pointer" onClick={() => handleViewDocument(doc)}>
                                                {doc.type === 'image' ? (
                                                    <img
                                                        src={doc.url}
                                                        alt="Document preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <FileText className="h-16 w-16 text-gray-300" />
                                                    </div>
                                                )}
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-lg px-4 py-2 font-semibold text-gray-900 text-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                        View Document
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Document Info */}
                                            <div className="p-4">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                    {doc.category}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {doc.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {doc.size} • {doc.date}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'KYC' && (() => {
                        const kyc = profileData.kyc;
                        const companyMismatchPayload = getCompanyMismatchPayload(kyc);
                        const showCompanyMismatchPanel =
                            Boolean(kyc?.mismatchDetected) ||
                            Boolean(profileData?.hasCompanyMismatch) ||
                            Boolean(kyc?.hasCompanyMismatch) ||
                            (Array.isArray(companyMismatchPayload?.mismatches) && companyMismatchPayload.mismatches.length > 0);
                        const kycSubmitted = recruiterKycSubmitted(kyc);
                        const frontUrl = kyc?.documentFrontUrl || kyc?.documentUrl || '';
                        const backUrl = kyc?.documentBackUrl || '';
                        const selfieUrl = kyc?.selfieUrl || '';
                        const kycStatusLabel = String(kyc?.status || (kycSubmitted ? 'SUBMITTED' : 'AWAITING SUBMISSION')).toUpperCase();

                        return (
                        <>
                            {/* KYC Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                            <span className="text-gray-500 font-bold text-sm">02</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">Stage 2: KYC Verification</h3>
                                            <p className="text-xs text-gray-500">Identity verification process</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-md ${kycStatusBadgeClass(kyc?.status)}`}>
                                            {kycStatusLabel}
                                        </span>
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                                            kycSubmitted ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {kycSubmitted ? 'Documents on file' : 'Not yet submitted'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {kycSubmitted ? (
                                <>
                                    {/* KYC documents & extracted data */}
                                    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <h3 className="text-base font-bold text-gray-900">ID Document & Photo</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                            {[
                                                { label: 'ID — Front', url: frontUrl, key: 'front' },
                                                { label: 'ID — Back', url: backUrl, key: 'back' },
                                                { label: 'Selfie', url: selfieUrl, key: 'selfie' },
                                            ].map(({ label, url, key }) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    disabled={!url}
                                                    onClick={() => {
                                                        const doc = kycViewerDocument(label, url);
                                                        if (doc) handleViewDocument(doc);
                                                    }}
                                                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                                >
                                                    <div className="aspect-[3/2] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                        {url ? (
                                                            <>
                                                                <img src={url} alt={label} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                                                    <Eye className="opacity-0 group-hover:opacity-100 text-white w-7 h-7 drop-shadow-md" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 px-2 text-center">Not provided</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 text-xs font-medium text-gray-600">{label}</div>
                                                </button>
                                            ))}
                                        </div>

                                        <h4 className="text-sm font-bold text-gray-900 mb-3">Submitted identity details</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Document type</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDocumentTypeLabel(kyc?.documentType)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Document number</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{kyc?.documentNumber || '—'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Legal name (KYC)</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                                    {[kyc?.firstName, kyc?.lastName].filter(Boolean).join(' ') || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date of birth</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatKycDate(kyc?.dateOfBirth)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expiry date</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatKycDate(kyc?.expiryDate)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Issuing country</span>
                                                <p className="text-sm font-semibold text-gray-900 mt-0.5">{kyc?.issueCountry || '—'}</p>
                                            </div>
                                        </div>

                                        {showCompanyMismatchPanel && (
                                            <div className="mt-5 space-y-4">
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-amber-900">Data mismatch flagged</p>
                                                        {companyMismatchPayload?.source === 'GEMINI_GOOGLE_SEARCH' && (
                                                            <p className="text-xs text-amber-900/80 mt-1">
                                                                Source: Gemini (Google Search grounding)
                                                            </p>
                                                        )}
                                                        {typeof kyc.mismatchDetails === 'string' && !companyMismatchPayload && (
                                                            <p className="text-sm text-amber-800 mt-1">{kyc.mismatchDetails}</p>
                                                        )}
                                                        {!kyc.mismatchDetails && !companyMismatchPayload?.mismatches?.length && (
                                                            <p className="text-sm text-amber-800 mt-1">
                                                                Review submitted company details against public records.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {Array.isArray(companyMismatchPayload?.mismatches) && companyMismatchPayload.mismatches.length > 0 && (
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                            Field discrepancies
                                                        </div>
                                                        <div className="divide-y divide-gray-100">
                                                            {companyMismatchPayload.mismatches.map((row, idx) => (
                                                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-3 py-2.5 text-sm">
                                                                    <div className="font-medium text-gray-900">{humanizeFieldKey(row.field)}</div>
                                                                    <div className="text-gray-700">
                                                                        <span className="text-xs font-semibold text-gray-500 block">Entered</span>
                                                                        {row.entered ?? '—'}
                                                                    </div>
                                                                    <div className="text-gray-700">
                                                                        <span className="text-xs font-semibold text-gray-500 block">Public record</span>
                                                                        {row.external ?? '—'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                                                KYC not yet submitted by the user
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                When this user completes their KYC submission, you will be able to review and verify their identity documents here.
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    ID Document
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Address Verification
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancelReview}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel review
                                </button>
                                {profileData.status === 'APPROVED' ? (
                                    <span className="px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                                        ✓ APPROVED
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleRejectAccount}
                                            className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                        >
                                            Reject Account
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleApproveAccount}
                                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approve Account
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                        );
                    })()}

                    {activeTab === 'Activity Log' && (
                        <>
                            {/* Activity Log */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Activity Log</h3>

                                <div className="space-y-6">
                                    {activityLogs.length > 0 ? (
                                        activityLogs.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    activity.color === 'green' ? 'bg-green-50' :
                                                    activity.color === 'blue' ? 'bg-blue-50' :
                                                    activity.color === 'yellow' ? 'bg-yellow-50' :
                                                    'bg-gray-100'
                                                }`}>
                                                    {activity.color === 'green' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                                    {activity.color === 'blue' && (
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    )}
                                                    {activity.color === 'yellow' && (
                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                    {!['green', 'blue', 'yellow'].includes(activity.color) && (
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                    {activity.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                                    )}
                                                    <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                        User: {activity.user}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-6">
                                            No activity logs available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Admin Notes' && (
                        <>
                            {/* Admin Notes */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-900">Admin Notes</h3>
                                    <button
                                        onClick={handleAddNewNote}
                                        className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Note
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {notes.map((note) => (
                                        <div key={note.id} className="flex gap-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-600">{note.initials}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{note.author}</span>
                                                    <span className="text-xs text-gray-400">{note.time}</span>
                                                </div>
                                                {editingNoteId === note.id ? (
                                                    <div>
                                                        <textarea
                                                            value={editNoteContent}
                                                            onChange={(e) => setEditNoteContent(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] mb-2"
                                                            rows="3"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(note.id)}
                                                                className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {editingNoteId !== note.id && (
                                                <button
                                                    onClick={() => handleEditNote(note)}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline self-start"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Note */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-blue-600">YOU</span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            ref={noteTextareaRef}
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Write an internal note..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                            rows="3"
                                        ></textarea>
                                        <div className="flex justify-end mt-3">
                                            <button
                                                type="button"
                                                onClick={handlePostNote}
                                                disabled={!newNote.trim() || isPostingNote}
                                                className="px-5 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isPostingNote ? 'Posting…' : 'Post Note'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Risk Analysis — KYC risk tier, optional IP field, email verification */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Risk Analysis</h3>
                            <div className={`w-2 h-2 rounded-full ${riskAnalysis.dotClass}`} title="Summary risk signal" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm gap-3">
                                <span className="text-gray-600 shrink-0">{riskAnalysis.row1Label}</span>
                                <span className={`text-right ${riskValueToneClass(riskAnalysis.row1Tone)}`}>
                                    {riskAnalysis.row1Value}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm gap-3">
                                <span className="text-gray-600 shrink-0">{riskAnalysis.row2Label}</span>
                                <span className={`text-right ${riskValueToneClass(riskAnalysis.row2Tone)}`}>
                                    {riskAnalysis.row2Value}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Notes</h3>
                            <button
                                onClick={() => {
                                    if (notes.length > 0) {
                                        setActiveTab('Admin Notes');
                                        setTimeout(() => {
                                            handleEditNote(notes[0]);
                                        }, 100);
                                    }
                                }}
                                className="text-sm font-bold text-[#1e5a8f] hover:underline"
                            >
                                Edit
                            </button>
                        </div>

                        {/* Note */}
                        {notes.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-gray-600">{notes[0].initials}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{notes[0].author}</span>
                                            <span className="text-xs text-gray-400">{notes[0].time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            "{notes[0].content}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setActiveTab('Admin Notes');
                                setTimeout(() => {
                                    if (noteTextareaRef.current) {
                                        noteTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        noteTextareaRef.current.focus();
                                    }
                                }, 100);
                            }}
                            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                        >
                            + Add Note
                        </button>
                    </div>

                    {/* Application Timeline */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Application Timeline</h3>

                        <div className="space-y-4">
                            {timelineEvents.length > 0 ? (
                                timelineEvents.map((event, index) => (
                                    <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2 h-2 rounded-full ${
                                                event.color === 'blue' ? 'bg-blue-500' : 
                                                event.color === 'green' ? 'bg-green-500' : 
                                                'bg-gray-300'
                                            }`}></div>
                                            {index < timelineEvents.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="text-sm font-semibold text-gray-900 mb-0.5">{event.title}</div>
                                            <div className="text-xs text-gray-500 mb-1">{event.description}</div>
                                            <div className="text-xs text-gray-400">
                                                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    No timeline events available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountProfile;
