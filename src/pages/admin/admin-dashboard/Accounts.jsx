import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ChevronDown, UserCheck, AlertTriangle, Shield, RefreshCw, Download, CheckCircle } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function normalizeUserRole(role) {
    if (!role) return '';
    return String(role).toUpperCase().replace(/-/g, '_');
}

/** Supports `{ data: { recruiters|trainers } }`, nested `data.data`, or a raw array fallback. */
function extractAdminUserList(apiBody, listKey) {
    if (!apiBody) return [];
    if (apiBody?.data?.[listKey] && Array.isArray(apiBody.data[listKey])) {
        return apiBody.data[listKey];
    }
    if (apiBody?.data?.data?.[listKey] && Array.isArray(apiBody.data.data[listKey])) {
        return apiBody.data.data[listKey];
    }
    if (apiBody?.[listKey] && Array.isArray(apiBody[listKey])) {
        return apiBody[listKey];
    }
    if (Array.isArray(apiBody.data)) {
        return apiBody.data;
    }
    if (Array.isArray(apiBody)) {
        return apiBody;
    }
    return [];
}

function Accounts() {
    const location = useLocation();
    // Parse Query Params
    const queryParams = new URLSearchParams(location.search);
    const viewParam = queryParams.get('view');

    const [activeTab, setActiveTab] = useState(
        viewParam === 'expiring_compliance'
            ? 'Professionals'
            : (location.state?.activeTab || 'Recruiters')
    );
    const [statusFilter, setStatusFilter] = useState(
        viewParam === 'expiring_compliance' ? 'Expiring Soon' : 'All'
    );
    const [timeFilter, setTimeFilter] = useState('30 Days');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportNotification, setShowExportNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [kycSubmissions, setKycSubmissions] = useState([]);
    const [isLoadingKyc, setIsLoadingKyc] = useState(false);
    const [kycError, setKycError] = useState('');
    const [kycSummary, setKycSummary] = useState({
        total: 0,
        pending: 0,
        highRisk: 0,
        verified: 0,
    });
    const [professionals, setProfessionals] = useState([]);
    const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
    const [professionalsError, setProfessionalsError] = useState('');
    const [professionalsSummary, setProfessionalsSummary] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        flagged: 0
    });

    const [recruiters, setRecruiters] = useState([]);
    const [isLoadingRecruiters, setIsLoadingRecruiters] = useState(false);
    const [recruitersError, setRecruitersError] = useState('');
    const [recruitersSummary, setRecruitersSummary] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        flagged: 0
    });

    const [trainers, setTrainers] = useState([]);
    const [isLoadingTrainers, setIsLoadingTrainers] = useState(false);
    const [trainersError, setTrainersError] = useState('');
    const [trainersSummary, setTrainersSummary] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        flagged: 0
    });

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            // Clear the message from history state so it doesn't show again
            window.history.replaceState({ ...window.history.state, successMessage: null }, '');

            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    // Filter states
    const [companyFilter, setCompanyFilter] = useState('All');
    const [domainFilter, setDomainFilter] = useState('All');

    // Dropdown visibility states
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showDomainDropdown, setShowDomainDropdown] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const tabs = ['Recruiters', 'Training Providers', 'Professionals', 'KYC Status'];
    const isProfessionalTab = activeTab === 'Professionals';

    const mapKycStatusLabel = (status) => {
        if (!status) return 'Unknown';
        const upper = status.toUpperCase();
        if (upper === 'PENDING') return 'Under Review';
        if (upper === 'APPROVED') return 'KYC Approved';
        if (upper === 'REJECTED') return 'Rejected';
        if (upper === 'DOCUMENTS_PENDING') return 'Documents Pending';
        return status
            .toLowerCase()
            .split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');
    };

    const mapKycStatusColor = (status) => {
        if (!status) return 'text-gray-600';
        const upper = status.toUpperCase();
        if (upper === 'PENDING' || upper === 'UNDER_REVIEW') return 'text-blue-500';
        if (upper === 'APPROVED') return 'text-green-500';
        if (upper === 'REJECTED') return 'text-red-500';
        if (upper === 'DOCUMENTS_PENDING') return 'text-orange-500';
        return 'text-gray-600';
    };

    const fetchKycSubmissions = async () => {
        setIsLoadingKyc(true);
        setKycError('');
        try {
            const [recruiterResponse, professionalResponse] = await Promise.all([
                httpClient.get(API_ENDPOINTS.ADMIN.KYC_PENDING).catch(e => {
                    console.error('Failed to load recruiter KYC:', e);
                    return null;
                }),
                httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONAL_KYC_PENDING).catch(e => {
                    console.error('Failed to load professional KYC:', e);
                    return null;
                })
            ]);

            const extractKycList = (res) => {
                if (!res) return [];
                if (res?.data?.data?.kycs && Array.isArray(res.data.data.kycs)) return res.data.data.kycs;
                if (res?.data?.data?.submissions && Array.isArray(res.data.data.submissions)) return res.data.data.submissions;
                if (res?.data?.kycs && Array.isArray(res.data.kycs)) return res.data.kycs;
                if (res?.data?.submissions && Array.isArray(res.data.submissions)) return res.data.submissions;
                if (Array.isArray(res?.data)) return res.data;
                if (Array.isArray(res)) return res;
                return [];
            };

            const extractResultsCount = (res) => {
                if (!res) return 0;
                if (typeof res?.results === 'number') return res.results;
                if (typeof res?.data?.results === 'number') return res.data.results;
                if (typeof res?.data?.data?.results === 'number') return res.data.data.results;
                return 0;
            };

            const kycList = [...extractKycList(recruiterResponse), ...extractKycList(professionalResponse)];

            const getTimeAgo = (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return 'N/A';
                const diffMs = new Date() - date;
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) return `${diffHours} hours ago`;
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays < 7) return `${diffDays} days ago`;
                const diffWeeks = Math.floor(diffDays / 7);
                return `${diffWeeks} weeks ago`;
            };

            let computedPending = 0, computedHighRisk = 0, computedVerified = 0;

            const mappedSubmissions = kycList.map((item) => {
                const isProfessional = Boolean(item.professional);
                const professionalInfo = item.professional || {};
                const recruiterInfo = item.recruiter || {};

                const fullName = professionalInfo.fullname || [item.firstName, item.lastName].filter(Boolean).join(' ') || item.name || 'Unknown';
                const email = recruiterInfo.email || professionalInfo.email || item.email || 'N/A';
                const company = isProfessional ? (professionalInfo.subcategory || 'Individual') : (recruiterInfo.organizationName || item.companyName || 'N/A');

                // Count stats
                const upperStatus = (item.status || '').toUpperCase();
                if (upperStatus === 'PENDING' || upperStatus === 'UNDER_REVIEW') computedPending++;
                if (upperStatus === 'APPROVED') computedVerified++;
                if ((item.riskLevel || '').toUpperCase() === 'HIGH') computedHighRisk++;

                return {
                    id: item.id,
                    recruiterId: item.recruiterId, // Optional, depending on userType
                    userType: item.userType || (isProfessional ? 'PROFESSIONAL' : 'RECRUITER'),
                    name: fullName,
                    company: company,
                    domain: email,
                    country: item.issueCountry || professionalInfo?.resume?.country || 'N/A',
                    tier: item.riskLevel || 'N/A',
                    lastActive: getTimeAgo(item.updatedAt || item.createdAt),
                    status: mapKycStatusLabel(item.status),
                    statusColor: mapKycStatusColor(item.status),
                    documentType: item.documentType,
                    documentNumber: item.documentNumber,
                };
            });

            setKycSubmissions(mappedSubmissions);

            const recruiterTotal = extractResultsCount(recruiterResponse);
            const professionalTotal = extractResultsCount(professionalResponse);
            const total = recruiterTotal + professionalTotal || kycList.length;

            // Try to fetch stats from dedicated stats endpoint, fallback to computed
            try {
                const statsResponse = await httpClient.get(API_ENDPOINTS.ADMIN.KYC_STATS);
                const statsData = statsResponse?.data || statsResponse || {};

                setKycSummary({
                    total,
                    pending: statsData.pending ?? computedPending,
                    highRisk: statsData.highRisk ?? computedHighRisk,
                    verified: statsData.verified ?? computedVerified,
                });
            } catch (statsError) {
                console.error('Failed to load KYC stats:', statsError);
                setKycSummary({
                    total,
                    pending: computedPending,
                    highRisk: computedHighRisk,
                    verified: computedVerified,
                });
            }
        } catch (error) {
            console.error('Failed to load KYC submissions:', error);
            setKycError(error.message || 'Failed to load KYC submissions');
            setKycSubmissions([]);
            setKycSummary({
                total: 0,
                pending: 0,
                highRisk: 0,
                verified: 0,
            });
        } finally {
            setIsLoadingKyc(false);
        }
    };

    const fetchProfessionals = async () => {
        setIsLoadingProfessionals(true);
        setProfessionalsError('');
        try {
            const response = await httpClient.get(`${API_ENDPOINTS.ADMIN.PROFESSIONALS}?limit=1000`);
            
            // Fetch stats
            try {
                const statsResponse = await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONALS_STATS);
                const statsData = statsResponse?.data || statsResponse || {};
                setProfessionalsSummary({
                    total: statsData.total || 0,
                    pending: statsData.pending || 0,
                    verified: statsData.verified || 0,
                    flagged: statsData.flagged || 0,
                });
            } catch (statsError) {
                console.error('Failed to load professional stats:', statsError);
            }
            let professionalsList = [];
            if (response?.data?.professionals && Array.isArray(response.data.professionals)) {
                professionalsList = response.data.professionals;
            } else if (response?.data && Array.isArray(response.data)) {
                professionalsList = response.data;
            } else if (response?.professionals && Array.isArray(response.professionals)) {
                professionalsList = response.professionals;
            } else if (Array.isArray(response)) {
                professionalsList = response;
            }
            
            const getTimeAgo = (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return 'N/A';
                const diffMs = new Date() - date;
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) return `${diffHours} hours ago`;
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays < 7) return `${diffDays} days ago`;
                const diffWeeks = Math.floor(diffDays / 7);
                return `${diffWeeks} weeks ago`;
            };

            const mappedProfessionals = professionalsList.map((item) => {
                let statusLabel = item.status === 'VERIFIED' || item.isVerified ? 'Verified' : 'Pending Verification';
                if (item.status === 'FLAGGED') statusLabel = 'Flagged';
                let statusColor = 'text-green-500';
                if (statusLabel === 'Pending Verification') statusColor = 'text-orange-500';
                if (statusLabel === 'Flagged') statusColor = 'text-red-500';
                
                return {
                    id: item.id,
                    name: item.fullname || 'Unknown',
                    company: 'Self-Employed',
                    domain: item.email || 'N/A',
                    country: item.country || 'N/A',
                    tier: item.tier ? item.tier.charAt(0).toUpperCase() + item.tier.slice(1).toLowerCase() : 'Free',
                    lastActive: getTimeAgo(item.lastActive || item.createdAt),
                    status: statusLabel,
                    statusColor: statusColor,
                    isVerified: item.isVerified
                };
            });
            
            setProfessionals(mappedProfessionals);
        } catch (error) {
            console.error('Failed to load professionals:', error);
            setProfessionalsError(error.message || 'Failed to load professionals');
            setProfessionals([]);
        } finally {
            setIsLoadingProfessionals(false);
        }
    };

    const fetchRecruiters = async () => {
        setIsLoadingRecruiters(true);
        setRecruitersError('');
        try {
            const [response, statsResponse] = await Promise.allSettled([
                httpClient.get(API_ENDPOINTS.ADMIN.RECRUITERS),
                httpClient.get(API_ENDPOINTS.ADMIN.RECRUITERS_STATS),
            ]);

            // Parse recruiters list (dedicated endpoint; exclude training agents if response is mixed)
            let recruitersList =
                response.status === 'fulfilled'
                    ? extractAdminUserList(response.value, 'recruiters')
                    : [];
            recruitersList = recruitersList.filter(
                (item) => normalizeUserRole(item.role) !== 'TRAINING_AGENT'
            );

            const getTimeAgo = (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return 'N/A';
                const diffMs = new Date() - date;
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) return `${diffHours} hours ago`;
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays < 7) return `${diffDays} days ago`;
                const diffWeeks = Math.floor(diffDays / 7);
                return `${diffWeeks} weeks ago`;
            };

            // Compute fallback counts from list
            let computedPending = 0, computedVerified = 0, computedFlagged = 0;

            const mappedRecruiters = recruitersList.map((item) => {
                let statusLabel = item.status || 'PENDING';
                if (statusLabel === 'APPROVED') statusLabel = 'Approved';
                else if (statusLabel === 'REJECTED') statusLabel = 'Rejected';
                else if (statusLabel === 'PENDING') statusLabel = 'Pending';

                if (statusLabel === 'Approved') computedVerified++;
                if (statusLabel === 'Pending') computedPending++;
                if (statusLabel === 'Rejected' || statusLabel === 'Flagged') computedFlagged++;

                let statusColor = 'text-orange-500';
                if (statusLabel === 'Approved') statusColor = 'text-green-500';
                if (statusLabel === 'Rejected' || statusLabel === 'Flagged') statusColor = 'text-red-500';

                return {
                    id: item.id,
                    name: item.organizationName || 'Unknown',
                    company: item.organizationName || 'N/A',
                    domain: item.email || 'N/A',
                    country: item.companyCountry || 'N/A',
                    tier: item.tier ? item.tier.charAt(0).toUpperCase() + item.tier.slice(1).toLowerCase() : 'Free',
                    lastActive: getTimeAgo(item.lastActive || item.createdAt),
                    status: statusLabel,
                    statusColor: statusColor,
                    isVerified: item.isVerified,
                };
            });

            // Use stats API values if available, otherwise fall back to computed
            if (statsResponse.status === 'fulfilled') {
                const statsData = statsResponse.value?.data || statsResponse.value || {};
                setRecruitersSummary({
                    total: statsData.total ?? recruitersList.length,
                    pending: statsData.pending ?? computedPending,
                    verified: statsData.verified ?? computedVerified,
                    flagged: (statsData.flagged ?? 0) + (statsData.rejected ?? computedFlagged),
                });
            } else {
                console.warn('Recruiter stats API failed, using computed values');
                setRecruitersSummary({
                    total: recruitersList.length,
                    pending: computedPending,
                    verified: computedVerified,
                    flagged: computedFlagged,
                });
            }

            setRecruiters(mappedRecruiters);
        } catch (error) {
            console.error('Failed to load recruiters:', error);
            setRecruitersError(error.message || 'Failed to load recruiters');
            setRecruiters([]);
        } finally {
            setIsLoadingRecruiters(false);
        }
    };

    const fetchTrainers = async () => {
        setIsLoadingTrainers(true);
        setTrainersError('');
        try {
            const response = await httpClient.get(API_ENDPOINTS.ADMIN.TRAINERS);

            let trainersList = extractAdminUserList(response, 'trainers');
            trainersList = trainersList.filter(
                (item) => normalizeUserRole(item.role) !== 'RECRUITMENT_AGENT'
            );

            const getTimeAgo = (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return 'N/A';
                const diffMs = new Date() - date;
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) return `${Math.max(1, diffMins)} mins ago`;
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) return `${diffHours} hours ago`;
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays < 7) return `${diffDays} days ago`;
                const diffWeeks = Math.floor(diffDays / 7);
                return `${diffWeeks} weeks ago`;
            };

            let computedPending = 0, computedVerified = 0, computedFlagged = 0;

            const mappedTrainers = trainersList.map((item) => {
                const fullName = [item.firstName, item.middleName, item.lastName]
                    .filter(Boolean).join(' ') || item.organizationName || 'Unknown';

                let statusLabel = item.status || 'PENDING';
                if (statusLabel === 'APPROVED') statusLabel = 'Approved';
                else if (statusLabel === 'REJECTED') statusLabel = 'Rejected';
                else if (statusLabel === 'PENDING') statusLabel = 'Pending';

                if (statusLabel === 'Approved') computedVerified++;
                if (statusLabel === 'Pending') computedPending++;
                if (statusLabel === 'Rejected' || statusLabel === 'Flagged') computedFlagged++;

                let statusColor = 'text-orange-500';
                if (statusLabel === 'Approved') statusColor = 'text-green-500';
                if (statusLabel === 'Rejected' || statusLabel === 'Flagged') statusColor = 'text-red-500';

                return {
                    id: item.id,
                    name: fullName,
                    company: item.organizationName || 'N/A',
                    domain: item.email || 'N/A',
                    country: item.companyCountry || 'N/A',
                    tier: item.tier ? item.tier.charAt(0).toUpperCase() + item.tier.slice(1).toLowerCase() : 'Free',
                    lastActive: getTimeAgo(item.lastActive || item.createdAt),
                    status: statusLabel,
                    statusColor: statusColor,
                    isVerified: item.isVerified,
                };
            });

            setTrainersSummary({
                total: trainersList.length,
                pending: computedPending,
                verified: computedVerified,
                flagged: computedFlagged,
            });

            setTrainers(mappedTrainers);
        } catch (error) {
            console.error('Failed to load trainers:', error);
            setTrainersError(error.message || 'Failed to load trainers');
            setTrainers([]);
        } finally {
            setIsLoadingTrainers(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'KYC Status') {
            fetchKycSubmissions();
        } else if (activeTab === 'Professionals') {
            fetchProfessionals();
        } else if (activeTab === 'Recruiters') {
            fetchRecruiters();
        } else if (activeTab === 'Training Providers') {
            fetchTrainers();
        }
    }, [activeTab]);

    // Tab-specific data
    const recruitersData = recruiters;

    const trainingProvidersData = trainers;

    const professionalsData = professionals;

    const kycStatusData = kycSubmissions;

    // Get current tab data
    const getCurrentTabData = () => {
        switch (activeTab) {
            case 'Recruiters':
                return recruitersData;
            case 'Training Providers':
                return trainingProvidersData;
            case 'Professionals':
                return professionalsData;
            case 'KYC Status':
                return kycStatusData;
            default:
                return recruitersData;
        }
    };

    const accounts = getCurrentTabData();

    // Tab-specific stats
    const getTabStats = () => {
        switch (activeTab) {
            case 'Recruiters':
                return [
                    {
                        value: recruitersSummary.total.toString(),
                        label: 'Total Recruiters',
                        sublabel: 'Updated now',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: recruitersSummary.pending.toString(),
                        label: 'Pending',
                        sublabel: 'Requires action',
                        icon: UserCheck,
                        iconColor: 'text-orange-500',
                        iconBg: 'bg-orange-50'
                    },
                    {
                        value: recruitersSummary.verified.toString(),
                        label: 'Verified',
                        sublabel: 'Approved',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: recruitersSummary.flagged.toString(),
                        label: 'Flagged/Rejected',
                        sublabel: 'Review needed',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'Training Providers':
                return [
                    {
                        value: trainersSummary.total.toString(),
                        label: 'Total Providers',
                        sublabel: 'Updated now',
                        icon: UserCheck,
                        iconColor: 'text-purple-500',
                        iconBg: 'bg-purple-50'
                    },
                    {
                        value: trainersSummary.pending.toString(),
                        label: 'Pending',
                        sublabel: 'Requires action',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: trainersSummary.verified.toString(),
                        label: 'Approved',
                        sublabel: 'Verified',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: trainersSummary.flagged.toString(),
                        label: 'Rejected',
                        sublabel: 'Review needed',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'Professionals':
                return [
                    {
                        value: professionalsSummary.total.toString(),
                        label: 'Total Professionals',
                        sublabel: 'Updated now',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: professionalsSummary.pending.toString(),
                        label: 'Pending Verification',
                        sublabel: 'Requires action',
                        icon: UserCheck,
                        iconColor: 'text-orange-500',
                        iconBg: 'bg-orange-50'
                    },
                    {
                        value: professionalsSummary.verified.toString(),
                        label: 'Verified',
                        sublabel: 'Approved',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: professionalsSummary.flagged.toString(),
                        label: 'Flagged',
                        sublabel: 'Review needed',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'KYC Status':
                return [
                    {
                        value: kycSummary.total.toString(),
                        label: 'Total Submissions',
                        sublabel: '+0 today',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: kycSummary.pending.toString(),
                        label: 'Pending',
                        sublabel: 'Awaiting review',
                        icon: UserCheck,
                        iconColor: 'text-orange-500',
                        iconBg: 'bg-orange-50'
                    },
                    {
                        value: kycSummary.highRisk.toString(),
                        label: 'High Risk',
                        sublabel: 'Requires attention',
                        icon: Shield,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    },
                    {
                        value: kycSummary.verified.toString(),
                        label: 'Verified',
                        sublabel: 'KYC approved',
                        icon: AlertTriangle,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    }
                ];
            default:
                return [];
        }
    };

    const stats = getTabStats();

    // Get unique values for filters
    const uniqueStatuses = ['All', 'Expiring Soon', ...new Set(accounts.map(acc => acc.status).filter(s => s !== 'Expiring Soon'))];
    const uniqueCompanies = ['All', ...new Set(accounts.map(acc => acc.company))];
    const uniqueDomains = ['All', ...new Set(accounts.map(acc => acc.domain))];

    // Refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);

        if (activeTab === 'KYC Status') {
            fetchKycSubmissions().finally(() => {
                setIsRefreshing(false);
            });
            return;
        }

        if (activeTab === 'Professionals') {
            fetchProfessionals().finally(() => {
                setIsRefreshing(false);
            });
            return;
        }

        if (activeTab === 'Recruiters') {
            fetchRecruiters().finally(() => {
                setIsRefreshing(false);
            });
            return;
        }

        if (activeTab === 'Training Providers') {
            fetchTrainers().finally(() => {
                setIsRefreshing(false);
            });
            return;
        }

        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    // Filter accounts by all criteria including time filter
    const getFilteredAccounts = () => {
        return accounts.filter(account => {
            // Search filter
            const matchesSearch = !searchQuery.trim() ||
                account.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (!isProfessionalTab && account.company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (!isProfessionalTab && account.domain?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                account.country?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'All' || account.status === statusFilter;

            // Company filter
            const matchesCompany = isProfessionalTab || companyFilter === 'All' || account.company === companyFilter;

            // Domain filter
            const matchesDomain = isProfessionalTab || domainFilter === 'All' || account.domain === domainFilter;

            // Time filter - parse lastActive to determine days ago
            let matchesTime = true;
            if (timeFilter !== '30 Days') {
                const lastActive = account.lastActive?.toLowerCase() || '';
                let daysAgo = 0;

                if (lastActive.includes('min')) {
                    daysAgo = 0;
                } else if (lastActive.includes('hour')) {
                    daysAgo = 0;
                } else if (lastActive.includes('day')) {
                    const match = lastActive.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1]) : 1;
                } else if (lastActive.includes('week')) {
                    const match = lastActive.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1]) * 7 : 7;
                }

                if (timeFilter === 'Today') {
                    matchesTime = daysAgo === 0;
                } else if (timeFilter === '7 Days') {
                    matchesTime = daysAgo <= 7;
                }
            }

            return matchesSearch && matchesStatus && matchesCompany && matchesDomain && matchesTime;
        });
    };

    // Export CSV handler
    const handleExportCSV = () => {
        const currentData = getFilteredAccounts();
        const headers = isProfessionalTab
            ? ['ID', 'Name', 'Country', 'Tier', 'Last Active', 'Status']
            : ['ID', 'Name', 'Company', 'Domain', 'Country', 'Tier', 'Last Active', 'Status'];
        const csvRows = [headers.join(',')];

        currentData.forEach(account => {
            const row = isProfessionalTab
                ? [
                    account.id,
                    `"${account.name}"`,
                    account.country,
                    account.tier,
                    `"${account.lastActive}"`,
                    account.status
                ]
                : [
                    account.id,
                    `"${account.name}"`,
                    `"${account.company}"`,
                    `"${account.domain}"`,
                    account.country,
                    account.tier,
                    `"${account.lastActive}"`,
                    account.status
                ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `accounts_${activeTab.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    const filteredAccounts = getFilteredAccounts();

    // Pagination calculations
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to page 1
        // Reset filters when changing tabs
        setSearchQuery('');
        setStatusFilter('All');
        setCompanyFilter('All');
        setDomainFilter('All');
        setShowStatusDropdown(false);
        setShowCompanyDropdown(false);
        setShowDomainDropdown(false);
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="h-full min-h-0 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-6">Accounts Overview</h1>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {tab === 'KYC Status' && <ChevronDown className="inline h-4 w-4 ml-1" />}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Unified Stats Card */}
            <div className="flex-shrink-0 bg-white rounded-3xl border border-gray-100 p-8 mb-6 relative shadow-sm">
                <div className="grid grid-cols-4 divide-x divide-gray-100">
                    {/* Total Count - Special Style */}
                    <div className="pr-8">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{stats[0].value}</div>
                        <div className="text-gray-500 font-medium mb-2">{stats[0].label}</div>
                        <div className="text-green-500 text-sm font-bold">{stats[0].sublabel}</div>
                    </div>

                    {/* Other Stats */}
                    {stats.slice(1).map((stat, index) => (
                        <div key={index} className="px-8 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.iconBg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900 mb-0.5 whitespace-nowrap">
                                    {stat.label} <span className="text-gray-400 font-normal">({stat.value})</span>
                                </div>
                                <div className={`text-sm font-medium ${index === 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {stat.sublabel}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Date Filter - Below Stats */}
            <div className="flex justify-end mb-6">
                <div className="bg-white border border-gray-200 p-1 rounded-full inline-flex shadow-sm">
                    {['Today', '7 Days', '30 Days'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => {
                                setTimeFilter(filter);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${timeFilter === filter
                                ? 'bg-[#1e5a8f] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accounts Table Card - Scrollable */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Export Success Notification */}
                {showExportNotification && (
                    <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">CSV exported successfully!</span>
                    </div>
                )}

                {/* General Success Notification */}
                {successMessage && (
                    <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleFilterChange();
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            {/* Status Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowStatusDropdown(!showStatusDropdown);
                                        setShowCompanyDropdown(false);
                                        setShowDomainDropdown(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Status {statusFilter !== 'All' && `(${statusFilter})`}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {showStatusDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowStatusDropdown(false)}
                                        />
                                        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px]">
                                            {uniqueStatuses.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setStatusFilter(status);
                                                        setShowStatusDropdown(false);
                                                        handleFilterChange();
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === status ? 'bg-blue-50 text-[#1e5a8f] font-semibold' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isProfessionalTab && (
                                <>
                                    {/* Company Filter */}
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setShowCompanyDropdown(!showCompanyDropdown);
                                                setShowStatusDropdown(false);
                                                setShowDomainDropdown(false);
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Company {companyFilter !== 'All' && `(${companyFilter})`}
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        {showCompanyDropdown && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowCompanyDropdown(false)}
                                                />
                                                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                                                    {uniqueCompanies.map((company) => (
                                                        <button
                                                            key={company}
                                                            onClick={() => {
                                                                setCompanyFilter(company);
                                                                setShowCompanyDropdown(false);
                                                                handleFilterChange();
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${companyFilter === company ? 'bg-blue-50 text-[#1e5a8f] font-semibold' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            {company}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Domain Filter */}
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setShowDomainDropdown(!showDomainDropdown);
                                                setShowStatusDropdown(false);
                                                setShowCompanyDropdown(false);
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Domain {domainFilter !== 'All' && `(${domainFilter})`}
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        {showDomainDropdown && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowDomainDropdown(false)}
                                                />
                                                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                                                    {uniqueDomains.map((domain) => (
                                                        <button
                                                            key={domain}
                                                            onClick={() => {
                                                                setDomainFilter(domain);
                                                                setShowDomainDropdown(false);
                                                                handleFilterChange();
                                                            }}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${domainFilter === domain ? 'bg-blue-50 text-[#1e5a8f] font-semibold' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            {domain}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Export CSV Button */}
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table - Scrollable Content */}
                <div className="overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Name
                                </th>
                                {!isProfessionalTab && (
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Company Domain
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tier
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {activeTab === 'KYC Status' && isLoadingKyc ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-gray-500">
                                        Loading KYC submissions...
                                    </td>
                                </tr>
                            ) : activeTab === 'KYC Status' && kycError ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-red-500">
                                        {kycError}
                                    </td>
                                </tr>
                            ) : activeTab === 'Professionals' && isLoadingProfessionals ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-gray-500">
                                        Loading professionals...
                                    </td>
                                </tr>
                            ) : activeTab === 'Professionals' && professionalsError ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-red-500">
                                        {professionalsError}
                                    </td>
                                </tr>
                            ) : activeTab === 'Recruiters' && isLoadingRecruiters ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-gray-500">
                                        Loading recruiters...
                                    </td>
                                </tr>
                            ) : activeTab === 'Recruiters' && recruitersError ? (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-red-500">
                                        {recruitersError}
                                    </td>
                                </tr>
                            ) : activeTab === 'Training Providers' && isLoadingTrainers ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        Loading training providers...
                                    </td>
                                </tr>
                            ) : activeTab === 'Training Providers' && trainersError ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-red-500">
                                        {trainersError}
                                    </td>
                                </tr>
                            ) : paginatedAccounts.length > 0 ? (
                                paginatedAccounts.map((account, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{account.name}</div>
                                            <div className="text-xs text-gray-500">ID: {account.id}</div>
                                        </td>
                                        {!isProfessionalTab && (
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">{account.company}</div>
                                                <div className="text-xs text-gray-500">{account.domain}</div>
                                            </td>
                                        )}
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-700">{account.country}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${account.tier === 'Pro'
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-600 bg-gray-100'
                                                }`}>
                                                {account.tier}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-600">{account.lastActive}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-sm font-semibold ${account.statusColor}`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {activeTab === 'Professionals' ? (
                                                <Link
                                                    to={`/admin/candidate/${account.id}`}
                                                    state={{ isProfessionalView: true }}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Profile
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={
                                                        activeTab === 'KYC Status'
                                                            ? `/admin/accounts/compliance/${account.id}`
                                                            : `/admin/accounts/${account.id}`
                                                    }
                                                    state={
                                                        activeTab === 'KYC Status' && account.userType
                                                            ? { userType: account.userType }
                                                            : activeTab === 'Training Providers'
                                                                ? { accountType: 'trainer' }
                                                                : undefined
                                                    }
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isProfessionalTab ? 6 : 7} className="px-4 py-8 text-center text-gray-500">
                                        No accounts found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAccounts.length > 0 && (
                    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredAccounts.length)}</span> of <span className="font-semibold">{filteredAccounts.length}</span> entries
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    &larr;
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === page
                                                ? 'bg-[#1e5a8f] text-white'
                                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Accounts;
