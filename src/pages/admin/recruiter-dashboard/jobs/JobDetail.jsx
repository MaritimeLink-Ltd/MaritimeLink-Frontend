import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ChevronDown,
    Edit2,
    Trash2
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import jobService from '../../../../services/jobService';

/** Real profile photo URLs only — no placeholders; blocks known dummy hosts. */
function resolveProfessionalAvatarUrl(prof) {
    if (!prof || typeof prof !== 'object') return null;
    const candidates = [
        prof.avatarUrl,
        prof.profilePhotoUrl,
        prof.photoUrl,
        prof.imageUrl,
        prof.profileImageUrl,
    ];
    for (const u of candidates) {
        if (typeof u !== 'string') continue;
        const t = u.trim();
        if (!t) continue;
        if (t.includes('i.pravatar.cc')) continue;
        return t;
    }
    return null;
}

/** GET /api/admin/jobs/:id/applicants — body is `{ status, data: { applicants } }` (httpClient returns JSON root). */
function extractApplicantsList(res) {
    if (!res || typeof res !== 'object') return [];
    const list = res.data?.applicants ?? res.applicants;
    return Array.isArray(list) ? list : [];
}

/**
 * API `ApplicationStatus` -> ATS tab / row `status` id.
 * Order: APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFER → HIRED (plus REJECTED / WITHDRAWN).
 */
function mapApiStatusToApplicantRowStatus(apiStatus) {
    const s = String(apiStatus || '').toUpperCase();
    if (s === 'APPLIED') return 'new';
    if (s === 'UNDER_REVIEW' || s === 'REVIEWING') return 'under-review';
    if (s === 'SHORTLISTED') return 'shortlisted';
    if (s === 'INTERVIEW' || s === 'INTERVIEWED' || s === 'INTERVIEWING') return 'interviewing';
    if (s === 'OFFER' || s === 'OFFERED' || s === 'ACCEPTED') return 'offered';
    if (s === 'HIRED') return 'hired';
    if (s === 'REJECTED') return 'rejected';
    if (s === 'WITHDRAWN') return 'withdrawn';
    return 'new';
}

function mapApiStatusToApplicantUi(appStatus) {
    return mapApiStatusToApplicantRowStatus(appStatus);
}

/** Next `ApplicationStatus` sent to PATCH for the row’s primary action. */
const UI_ROW_STATUS_TO_NEXT_API = {
    new: 'UNDER_REVIEW',
    'under-review': 'SHORTLISTED',
    shortlisted: 'INTERVIEW',
    interviewing: 'OFFER',
    offered: 'HIRED',
};

const ADVANCE_BUTTON_LABEL = {
    new: 'Start review',
    'under-review': 'Shortlist',
    shortlisted: 'Move to interview',
    interviewing: 'Send offer',
    offered: 'Mark hired',
};

/** Job was created via platform admin (marketplace / admin upload), not a recruiter listing. */
function isAdminCreatedJob(job) {
    if (!job || typeof job !== 'object') return false;
    if (job.adminId != null && String(job.adminId).trim() !== '') return true;
    if (job.admin && typeof job.admin === 'object') return true;
    return false;
}

function JobDetail({ onBack, jobId: jobIdProp }) {
    const navigate = useNavigate();
    const { jobId: jobIdFromRoute } = useParams();
    const jobId = jobIdProp || jobIdFromRoute;
    const location = useLocation();
    const jobData = location.state?.jobData;
    const sessionRole = typeof window !== 'undefined'
        ? (localStorage.getItem('userType') || localStorage.getItem('adminUserType'))
        : null;
    /** Recruiter dashboard login sets `adminUserType` to `recruiter`; admin login sets `userType` to `admin`. */
    const isRecruiterContext = sessionRole === 'recruiter';
    const isAdminPath = location.pathname.includes('/admin/') && !isRecruiterContext;
    /** Marketplace routes recruiter vs admin jobs explicitly (see Marketplace.jsx “View Details” links). */
    const isMarketplaceOversightRecruiterJob =
        isAdminPath && location.pathname.includes('/admin/marketplace/oversight/jobs/');
    const isMarketplaceInternalAdminJob =
        isAdminPath && location.pathname.includes('/admin/marketplace/internal/jobs/');
    /**
     * Recruiters always manage their listings.
     * Platform admins: hide edit/delete/publish/close on recruiter jobs (oversight); allow on admin-created jobs
     * (internal marketplace route or job payload has admin linkage).
     */
    const showJobManagementActions =
        isRecruiterContext ||
        (isAdminPath &&
            !isMarketplaceOversightRecruiterJob &&
            (isMarketplaceInternalAdminJob || isAdminCreatedJob(job)));
    const [job, setJob] = useState(jobData || null);
    const [isLoadingJob, setIsLoadingJob] = useState(!jobData); // Only load if no jobData provided initially, or always load to get fresh data
    const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [jobStatus, setJobStatus] = useState(jobData?.status || 'Active');

    const mapApiJobStatusToUi = (status) => {
        const upper = String(status || '').toUpperCase();
        if (upper === 'DRAFT') return 'Draft';
        if (upper === 'EXPIRED') return 'Expired';
        if (upper === 'FILLED') return 'Filled';
        return 'Active';
    };
    
    // Derived values
    const isPublished = jobStatus === 'Active';
    const isClosed = jobStatus === 'Expired' || jobStatus === 'Filled';
    const allowedInitialAtsTabs = new Set([
        'matches',
        'all',
        'new',
        'under-review',
        'shortlisted',
        'interviewing',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
    ]);
    const initialAtsFromNav = location.state?.initialAtsTab;
    const [activeTab, setActiveTab] = useState(() =>
        initialAtsFromNav && allowedInitialAtsTabs.has(initialAtsFromNav) ? initialAtsFromNav : 'matches'
    );
    const [isATSDropdownOpen, setIsATSDropdownOpen] = useState(false);
    const atsDropdownRef = useRef(null);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [invitedApplicants, setInvitedApplicants] = useState([]);
    const [applicantStatusPatchingId, setApplicantStatusPatchingId] = useState(null);
    const [applicantListActionError, setApplicantListActionError] = useState('');
    const [timeFilter, setTimeFilter] = useState('7days');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [allApplicants, setAllApplicants] = useState([]);
    const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (atsDropdownRef.current && !atsDropdownRef.current.contains(event.target)) {
                setIsATSDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Job Data
    useEffect(() => {
        const fetchJobDetail = async () => {
             if (!jobId) return;
             try {
                 setIsLoadingJob(true);
                 const response = await jobService.getJobById(jobId);
                 if (response?.data?.job) {
                     const fetchedJob = response.data.job;
                     
                     // Format category like we do in AdminJobs
                     const formatCategory = (cat) => {
                         if (!cat) return '';
                         return cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
                     };
                     
                     // Format date for "posted"
                     const createdAt = new Date(fetchedJob.createdAt);
                     const now = new Date();
                     const diffDays = Math.ceil(Math.abs(now - createdAt) / (1000 * 60 * 60 * 24));
                     let postedString = `${diffDays} days ago`;
                     if (diffDays === 0) postedString = 'Today';
                     else if (diffDays === 1) postedString = '1 day ago';
                     
                     const formattedStatus = mapApiJobStatusToUi(fetchedJob.status);

                     setJob({
                         ...fetchedJob,
                         title: fetchedJob.title || 'Untitled',
                         vessel: formatCategory(fetchedJob.category) || 'General',
                         domain: fetchedJob.companyId || 'company.com',
                         location: fetchedJob.location || 'Global',
                         posted: postedString,
                         status: formattedStatus
                     });
                     
                     setJobStatus(formattedStatus);
                 }
             } catch (error) {
                 console.error("Failed to fetch job detail:", error);
             } finally {
                 setIsLoadingJob(false);
             }
        };
        fetchJobDetail();
    }, [jobId]);

    // Fetch Applicants
    useEffect(() => {
        const fetchApplicants = async () => {
             if (!jobId) return;
             try {
                 setIsLoadingApplicants(true);
                 const [applicantsRes, matchesRes] = await Promise.all([
                     isAdminPath ? jobService.getAdminJobApplicants(jobId) : jobService.getJobApplicants(jobId),
                     isAdminPath ? jobService.getAdminJobMatches(jobId).catch(e => { console.error(e); return { data: { candidates: [] } }; }) : jobService.getJobMatches(jobId).catch(e => { console.error(e); return { data: { candidates: [] } }; })
                 ]);
                 
                 let applicantsList = [];
                 const rawApplicants = extractApplicantsList(applicantsRes);
                if (rawApplicants.length > 0) {
                    applicantsList = rawApplicants.map((app) => {
                        const prof = app.professional || {};
                        const resume = prof?.resume || app.resumeSnapshot || {};
                        const uiStatus = mapApiStatusToApplicantUi(app.status);

                         return {
                             id: app.id,
                             professionalId: app.professionalId || prof.id,
                             name: prof?.fullname || 'Unknown',
                             age: resume?.dateOfBirth ? (new Date().getFullYear() - new Date(resume.dateOfBirth).getFullYear()) : 'N/A',
                             avatar: resolveProfessionalAvatarUrl(prof),
                             rank: resume?.subcategory || resume?.category || prof?.profession || 'Unknown',
                             availability: 'Immediate',
                             availabilitySubtext: prof?.profession || '',
                             compliance: prof?.compliance || 'Not Deployable',
                             complianceSubtext: prof?.complianceSubtext || 'Missing critical certs',
                             applicationDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                             status: uiStatus,
                             rawApplicant: app
                         };
                     });
                 }
                 
                 let matchesList = [];
                 const rawMatches = matchesRes?.data?.candidates ?? matchesRes?.candidates;
                 if (Array.isArray(rawMatches) && rawMatches.length > 0) {
                     matchesList = rawMatches.map((candidate) => {
                         const prof = candidate.professional || candidate;
                         const resume = prof?.resume || candidate.resumeSnapshot || {};
                         
                         return {
                             id: candidate.id || prof.id,
                             professionalId: candidate.professionalId || prof.id,
                             name: prof?.fullname || 'Unknown',
                             age: resume?.dateOfBirth ? (new Date().getFullYear() - new Date(resume.dateOfBirth).getFullYear()) : 'N/A',
                             avatar: resolveProfessionalAvatarUrl(prof),
                             rank: resume?.subcategory || resume?.category || prof?.profession || 'Unknown',
                             availability: candidate.availability || 'Available Now',
                             availabilitySubtext: candidate.availabilitySubtext || prof?.profession || '',
                             compliance: candidate.compliance || 'Not Deployable',
                             complianceSubtext: candidate.complianceSubtext || 'Missing critical certs',
                             applicationDate: 'Not Applied', // Match without applying
                             status: 'matches',
                             rawApplicant: candidate
                         };
                     });
                 }
                 
                 // Merge lists, prefer applicant over match if duplicate by professionalId
                 const mergedMap = new Map();
                 matchesList.forEach(m => mergedMap.set(m.professionalId, m));
                 applicantsList.forEach(a => mergedMap.set(a.professionalId, a));
                 
                 setAllApplicants(Array.from(mergedMap.values()));
             } catch (error) {
                 console.error("Failed to fetch applicants:", error);
             } finally {
                 setIsLoadingApplicants(false);
             }
        };
        fetchApplicants();
    }, [jobId, isAdminPath, isRecruiterContext, location.pathname]);

    const applicantOnlyRows = allApplicants.filter((item) => item.status !== 'matches');

    const stats = [
        {
            icon: Users,
            label: 'Total Applicants',
            value: applicantOnlyRows.length.toString(),
            subtitle: 'Real time count',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            icon: CheckCircle,
            label: 'Compliance Ready',
            value: applicantOnlyRows.filter(a => a.compliance === 'Ready').length.toString(),
            subtitle: 'Ready to deploy',
            color: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            icon: AlertTriangle,
            label: 'Expiring Soon',
            value: applicantOnlyRows.filter(a => a.compliance === 'Expiring Soon').length.toString(),
            subtitle: 'Renewals needed',
            color: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            icon: XCircle,
            label: 'Not Deployable',
            value: applicantOnlyRows.filter(a => a.compliance === 'Not Deployable').length.toString(),
            subtitle: 'Missing critical certs',
            color: 'bg-red-50',
            iconColor: 'text-red-600'
        }
    ];

    // Get the cutoff date based on selected time filter
    const getTimeFilterDate = () => {
        const now = new Date();
        switch (timeFilter) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case '7days':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30days':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(0); // show all
        }
    };

    // Filter applicants by active tab and time filter
    const filteredApplicants = allApplicants.filter(applicant => {
        const matchesTab = activeTab === 'all' || applicant.status === activeTab;
        const applicationDate = new Date(applicant.applicationDate);
        const cutoffDate = getTimeFilterDate();
        const hasValidApplicationDate = !Number.isNaN(applicationDate.getTime());
        const matchesTime = activeTab === 'all' || activeTab === 'matches'
            ? true
            : hasValidApplicationDate && applicationDate >= cutoffDate;
        return matchesTab && matchesTime;
    });

    // Sort applicants
    const sortedApplicants = [...filteredApplicants].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'age':
                comparison = a.age - b.age;
                break;
            case 'rank':
                comparison = a.rank.localeCompare(b.rank);
                break;
            case 'date':
                comparison = new Date(a.applicationDate) - new Date(b.applicationDate);
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalItems = sortedApplicants.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplicants = sortedApplicants.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, timeFilter]);

    useEffect(() => {
        setApplicantListActionError('');
    }, [activeTab]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleInviteToApply = async (professionalId) => {
        setInvitedApplicants((prev) => [...prev, professionalId]);
        try {
            // Must use the same `isAdminPath` as applicants fetch (path + not recruiter).
            // A local `pathname.includes('/admin/')` alone wrongly calls the admin invite API for recruiters on `/admin/jobs/*`, causing 401 and logout.
            if (isAdminPath) {
                await jobService.inviteAdminMatch(jobId, professionalId);
            } else {
                await jobService.inviteMatch(jobId, professionalId);
            }
        } catch (error) {
            console.error("Failed to invite match:", error);
            setInvitedApplicants((prev) => prev.filter((id) => id !== professionalId));
        }
    };

    const patchApplicantListStatus = async (applicant, nextApiStatus) => {
        if (!applicant?.id || applicant.status === 'matches') return;
        setApplicantListActionError('');
        setApplicantStatusPatchingId(applicant.id);
        try {
            await jobService.updateApplicantStatus(applicant.id, nextApiStatus, { asAdmin: isAdminPath });
            setAllApplicants((prev) =>
                prev.map((a) =>
                    a.id === applicant.id
                        ? {
                              ...a,
                              status: mapApiStatusToApplicantRowStatus(nextApiStatus),
                              rawApplicant: a.rawApplicant
                                  ? { ...a.rawApplicant, status: nextApiStatus }
                                  : a.rawApplicant,
                          }
                        : a,
                ),
            );
        } catch (error) {
            console.error('Failed to update applicant status:', error);
            const msg =
                error?.data?.message ||
                (Array.isArray(error?.data?.message) ? error.data.message.join('; ') : null) ||
                error?.message ||
                'Could not update status';
            setApplicantListActionError(typeof msg === 'string' ? msg : 'Could not update status');
        } finally {
            setApplicantStatusPatchingId(null);
        }
    };

    const handleDeleteJob = async () => {
        try {
            setIsDeleting(true);
            await jobService.deleteJob(jobId);
            setShowDeleteModal(false);
            // Navigate back to jobs list
            const listPath = location.pathname.includes('/admin/marketplace') ? '/admin/marketplace/jobs' : '/admin/jobs';
            navigate(listPath);
        } catch (error) {
            console.error("Failed to delete job:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleJobStatusUpdate = async (nextStatus) => {
        if (!jobId) return;
        try {
            const response = await jobService.updateJobStatus(jobId, nextStatus);
            const updated = response?.data?.job || response?.job;
            const nextUiStatus = mapApiJobStatusToUi(updated?.status || nextStatus);
            setJob((prev) => prev ? ({ ...prev, status: nextUiStatus }) : prev);
            setJobStatus(nextUiStatus);
            setShowJobDetailsModal(false);
        } catch (error) {
            console.error('Failed to update job status:', error);
        }
    };

    const renderApplicantPipelineButtons = (applicant) => {
        if (applicant.status === 'matches') return null;
        const terminal = ['hired', 'rejected', 'withdrawn'].includes(applicant.status);
        if (terminal) return null;
        const nextApi = UI_ROW_STATUS_TO_NEXT_API[applicant.status];
        const busy = applicantStatusPatchingId === applicant.id;
        return (
            <div className="flex flex-wrap items-center gap-2 mt-1">
                {nextApi ? (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => patchApplicantListStatus(applicant, nextApi)}
                        className="px-3 py-1.5 bg-[#003971] text-white rounded-lg text-xs font-semibold hover:bg-[#002855] disabled:opacity-50 transition-colors"
                    >
                        {busy ? 'Saving…' : ADVANCE_BUTTON_LABEL[applicant.status] || 'Next'}
                    </button>
                ) : null}
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => patchApplicantListStatus(applicant, 'REJECTED')}
                    className="px-3 py-1.5 border border-red-200 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                    Reject
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 px-6 pt-6">
                {/* Back Icon */}
                <button
                    onClick={() => onBack ? onBack() : navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{job?.title || 'Loading...'}</h1>
                            {/* Published/Unpublished Badge */}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isClosed
                                ? 'bg-red-100 text-red-700'
                                : isPublished
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                {isClosed ? 'Closed' : isPublished ? 'Published' : 'Unpublished'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span>{job?.vessel || 'General'}</span>
                            <span>•</span>
                            <span>Posted {job?.posted || 'Recently'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Time Period Filters */}
                        {activeTab !== 'all' && (
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                {[
                                    { id: 'today', label: 'Today' },
                                    { id: '7days', label: '7 Days' },
                                    { id: '30days', label: '30 Days' }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => {
                                            setTimeFilter(filter.id);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${timeFilter === filter.id
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showJobManagementActions ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const editPath = location.pathname.includes('/admin/marketplace')
                                        ? '/admin/marketplace/create-job'
                                        : '/admin/upload-job';
                                    navigate(editPath, { state: { jobData: job, isEdit: true } });
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#003971] text-white rounded-lg font-semibold hover:bg-[#002855] transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Job
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setShowJobDetailsModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            View Job Details
                        </button>
                        {showJobManagementActions ? (
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 border border-red-300 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Job
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="px-6 pb-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className={`${stat.color} rounded-xl p-5`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className={`text-xs font-semibold ${stat.iconColor} mb-1`}>
                                {stat.label}
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-600">{stat.subtitle}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs and Filters */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="border-b border-gray-100 p-4">
                        <div className="flex items-center gap-4">
                            {/* Matches Tab */}
                            <button
                                onClick={() => {
                                    setActiveTab('matches');
                                    setIsATSDropdownOpen(false);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'matches' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Matches ({allApplicants.filter(a => a.status === 'matches').length})
                            </button>

                            {/* All Tab */}
                            <button
                                onClick={() => {
                                    setActiveTab('all');
                                    setIsATSDropdownOpen(false);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'all' ? 'bg-[#003971] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All ({allApplicants.length})
                            </button>

                            {/* ATS Dropdown */}
                            <div className="relative" ref={atsDropdownRef}>
                                <button
                                    onClick={() => setIsATSDropdownOpen(!isATSDropdownOpen)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${['new', 'under-review', 'shortlisted', 'interviewing', 'offered', 'hired'].includes(activeTab)
                                        ? 'bg-[#003971] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {(activeTab === 'matches' || activeTab === 'all') ? 'ATS' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isATSDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isATSDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {[
                                            { id: 'new', label: 'Applied' },
                                            { id: 'under-review', label: 'Under review' },
                                            { id: 'shortlisted', label: 'Shortlisted' },
                                            { id: 'interviewing', label: 'Interview' },
                                            { id: 'offered', label: 'Offer' },
                                            { id: 'hired', label: 'Hired' },
                                        ].map((stage) => (
                                            <button
                                                key={stage.id}
                                                onClick={() => {
                                                    setActiveTab(stage.id);
                                                    setIsATSDropdownOpen(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${activeTab === stage.id
                                                    ? 'bg-blue-50 text-[#003971]'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{stage.label}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === stage.id ? 'bg-[#003971] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {allApplicants.filter(a => a.status === stage.id).length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Applicants Table */}
                    {applicantListActionError ? (
                        <p className="px-6 pt-4 text-sm font-medium text-red-600" role="alert">
                            {applicantListActionError}
                        </p>
                    ) : null}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        {activeTab === 'matches' ? 'Candidates' : 'Applicants'} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('rank')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Availability</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Compliance</th>
                                    <th
                                        onClick={() => handleSort('date')}
                                        className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                                    >
                                        Application Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedApplicants.map((applicant, idx) => (
                                    <tr key={applicant.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {applicant.avatar ? (
                                                    <img
                                                        src={applicant.avatar}
                                                        alt=""
                                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                                    />
                                                ) : null}
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            const candidateRoute = location.pathname.includes('/marketplace')
                                                                ? `/admin/marketplace/candidate/${applicant.id}`
                                                                : `/recruiter/candidate/${applicant.id}`;
                                                            navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                        }}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 text-left"
                                                    >
                                                        {applicant.name}
                                                    </button>
                                                    <div className="text-sm text-gray-500">Age: {applicant.age}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-medium">{applicant.rank}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{applicant.availability}</div>
                                                <div className="text-sm text-gray-500">{applicant.availabilitySubtext}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className={`font-semibold ${applicant.compliance === 'Ready' ? 'text-green-600' : 'text-orange-600'
                                                    }`}>
                                                    {applicant.compliance}
                                                </div>
                                                {applicant.complianceSubtext && (
                                                    <div className="text-sm text-gray-500">{applicant.complianceSubtext}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700">{applicant.applicationDate}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {activeTab === 'all' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <button
                                                            onClick={() => {
                                                                const candidateRoute = location.pathname.includes('/marketplace')
                                                                    ? `/admin/marketplace/candidate/${applicant.id}`
                                                                    : `/recruiter/candidate/${applicant.id}`;
                                                                navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                            }}
                                                            className="text-blue-600 font-semibold hover:underline text-sm"
                                                        >
                                                            View Profile
                                                        </button>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'new' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <button
                                                            onClick={() => {
                                                                const candidateRoute = location.pathname.includes('/marketplace')
                                                                    ? `/admin/marketplace/candidate/${applicant.id}`
                                                                    : `/recruiter/candidate/${applicant.id}`;
                                                                navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                            }}
                                                            className="text-blue-600 font-semibold hover:underline text-sm"
                                                        >
                                                            View Profile
                                                        </button>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'matches' && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                const candidateRoute = location.pathname.includes('/marketplace')
                                                                    ? `/admin/marketplace/candidate/${applicant.id}`
                                                                    : `/recruiter/candidate/${applicant.id}`;
                                                                navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                            }}
                                                            className="text-blue-600 font-semibold hover:underline text-sm"
                                                        >
                                                            View Profile
                                                        </button>
                                                        {invitedApplicants.includes(applicant.professionalId) ? (
                                                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                                                                Invited
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleInviteToApply(applicant.professionalId)}
                                                                className="px-3 py-1.5 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors"
                                                            >
                                                                Invite
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {activeTab === 'under-review' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const candidateRoute = location.pathname.includes('/marketplace')
                                                                    ? `/admin/marketplace/candidate/${applicant.id}`
                                                                    : `/recruiter/candidate/${applicant.id}`;
                                                                navigate(candidateRoute, { state: { candidateData: applicant, fromJobDetail: true, applicantStatus: applicant.status } });
                                                            }}
                                                            className="text-blue-600 font-semibold hover:underline text-sm"
                                                        >
                                                            View Profile
                                                        </button>
                                                        <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-sm font-semibold">
                                                            Under review
                                                        </span>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'shortlisted' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
                                                            Shortlisted
                                                        </span>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'interviewing' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold">
                                                            Interview
                                                        </span>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'offered' && (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                                                            Offer
                                                        </span>
                                                        {renderApplicantPipelineButtons(applicant)}
                                                    </div>
                                                )}
                                                {activeTab === 'hired' && (
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">
                                                        Hired
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                                disabled={safeCurrentPage === 1}
                                className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>
                            <button className="h-11 w-11 rounded-xl bg-[#1e5a8f] text-white font-semibold">
                                {safeCurrentPage}
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showJobDetailsModal && job && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Job Details</h3>
                        <p className="text-sm text-gray-600 mb-1">{job.title} • {job.vessel}</p>
                        <p className="text-sm text-gray-600 mb-5">Posted {job.posted}</p>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6 max-h-[50vh] overflow-y-auto overflow-x-hidden">
                            <p className="text-sm font-semibold text-gray-700 mb-1 sticky top-0 bg-gray-50 z-10 pb-1">Description</p>
                            <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap break-words">{job.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowJobDetailsModal(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            {showJobManagementActions ? (
                                <>
                                    {!isClosed && (
                                        <button
                                            type="button"
                                            onClick={() => handleJobStatusUpdate(isPublished ? 'DRAFT' : 'ACTIVE')}
                                            className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors ${isPublished
                                                ? 'bg-orange-500 hover:bg-orange-600'
                                                : 'bg-[#003971] hover:bg-[#002855]'
                                                }`}
                                        >
                                            {isPublished ? 'Unpublish' : 'Publish'}
                                        </button>
                                    )}
                                    {!isClosed ? (
                                        <button
                                            type="button"
                                            onClick={() => handleJobStatusUpdate('EXPIRED')}
                                            className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                        >
                                            Close Job
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="px-5 py-2.5 rounded-xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                                        >
                                            Job Closed
                                        </button>
                                    )}
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Job?</h3>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{job?.title}</span>? This action cannot be undone and will remove all applications associated with this job.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteJob}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Job'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetail;
