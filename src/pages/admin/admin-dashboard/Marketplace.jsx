import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Briefcase, GraduationCap, CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, Clock, Eye, FileEdit, PauseCircle, Upload, Plus } from 'lucide-react';
import jobService from '../../../services/jobService';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';


function Marketplace() {
    const [activeMainTab, setActiveMainTab] = useState('Oversight');
    const [activeSubTab, setActiveSubTab] = useState('Jobs');
    const [timeFilter, setTimeFilter] = useState('30 Days');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [riskFilter, setRiskFilter] = useState('Risk Level');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportNotification, setShowExportNotification] = useState(false);

    // API Data state
    const [remoteJobs, setRemoteJobs] = useState([]);
    const [totalRemoteJobs, setTotalRemoteJobs] = useState(0);
    const [marketplaceStats, setMarketplaceStats] = useState(null);
    const [oversightData, setOversightData] = useState([]);
    const [totalOversight, setTotalOversight] = useState(0);
    const [coursesList, setCoursesList] = useState([]);
    const [totalCourses, setTotalCourses] = useState(0);
    /** Admin-owned courses from GET /api/courses/my — MaritimeLink Listings → Training */
    const [myMaritimeCourses, setMyMaritimeCourses] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Updated to 10 per page

    // Dropdown Visibility State
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showRiskDropdown, setShowRiskDropdown] = useState(false);
    const fileInputRef = useRef(null);

    // Bulk Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const navigate = useNavigate();

    // Handlers
    const handleCreateNew = () => {
        if (activeSubTab === 'Jobs') {
            navigate('/admin/marketplace/create-job', {
                state: {
                    dashboardType: 'admin',
                    returnPath: '/admin/marketplace'
                }
            });
        } else {
            navigate('/admin/create-course');
        }
    };

    const handleBulkUploadClick = () => {
        setShowUploadModal(true);
        setUploadFile(null);
        setUploadComplete(false);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            // Adjust to the newly added API endpoint
            await httpClient.post(API_ENDPOINTS.JOBS.ADMIN_BULK_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsUploading(false);
            setUploadComplete(true);

            // Reload the jobs table so new jobs show up
            if (activeMainTab === 'MaritimeLink Listings' && activeSubTab === 'Jobs') {
                loadJobsData(1);
                setCurrentPage(1);
            }
            loadStatsData();

            // Close modal after brief success message
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadComplete(false);
                setUploadFile(null);
            }, 2000);
        } catch (error) {
            console.error('Failed to upload jobs:', error);
            setIsUploading(false);
            alert(error.response?.data?.message || 'Failed to bulk upload jobs');
        }
    };

    const handleBulkUploadFile = (event) => {
        // Kept for backward compatibility if needed, but handleFileSelect is preferred
        handleFileSelect(event);
    };

    const mainTabs = ['Oversight', 'MaritimeLink Listings'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Filter Options
    const statusOptions = ['All', 'Active', 'Draft', 'Paused', 'Flagged'];
    const riskOptions = ['All', 'High', 'Medium', 'Low'];

    // Refresh handler
    const loadJobsData = async (page) => {
        try {
            setIsRefreshing(true);
            const res = await httpClient.get(`${API_ENDPOINTS.ADMIN.MARKETPLACE_LISTINGS}?page=${page}&limit=${itemsPerPage}`);

            // Always update state even if listings are empty to prevent stale data
            const listings = res?.data?.listings || res?.listings || [];
            const total = res?.data?.total || res?.total || listings.length || 0;

            setRemoteJobs(listings);
            setTotalRemoteJobs(total);
        } catch (error) {
            console.error('Failed to load listings:', error);
            // On error, clear current results to avoid confusion
            setRemoteJobs([]);
            setTotalRemoteJobs(0);
        } finally {
            setIsRefreshing(false);
        }
    };

    const loadStatsData = async () => {
        try {
            const res = await httpClient.get(API_ENDPOINTS.ADMIN.MARKETPLACE_STATS);
            if (res?.data) {
                setMarketplaceStats(res.data);
            }
        } catch (error) {
            console.error('Failed to load marketplace stats:', error);
        }
    };

    const loadOversightData = async (subTabKey, page = 1, search = '') => {
        try {
            const typeParam = subTabKey === 'Jobs' ? 'JOBS' : 'COURSES';
            const params = new URLSearchParams({
                type: typeParam,
                page: String(page),
                limit: String(itemsPerPage),
            });
            if (search.trim()) params.set('search', search.trim());

            const res = await httpClient.get(`${API_ENDPOINTS.ADMIN.MARKETPLACE_OVERSIGHT}?${params.toString()}`);
            const oversight = res?.data?.data?.oversight ?? res?.data?.oversight ?? [];
            setOversightData(oversight);
            setTotalOversight(Number(res?.pagination?.total ?? res?.data?.total ?? oversight.length ?? 0));
        } catch (error) {
            console.error('Failed to load marketplace oversight:', error);
            setOversightData([]);
            setTotalOversight(0);
        }
    };

    const loadCoursesData = async (page) => {
        try {
            setIsRefreshing(true);
            const res = await httpClient.get(
                `${API_ENDPOINTS.COURSES.LIST}?page=${page}&limit=${itemsPerPage}`
            );
            const courses = res?.data?.courses ?? [];
            const total = typeof res?.total === 'number' ? res.total : courses.length;
            setCoursesList(courses);
            setTotalCourses(total);
        } catch (error) {
            console.error('Failed to load courses:', error);
            setCoursesList([]);
            setTotalCourses(0);
        } finally {
            setIsRefreshing(false);
        }
    };

    const loadMyMaritimeCourses = async () => {
        try {
            setIsRefreshing(true);
            const res = await httpClient.get(API_ENDPOINTS.COURSES.MY);
            const raw = res?.data?.courses ?? [];
            const adminOnly = raw.filter((c) => Boolean(c?.adminId));
            setMyMaritimeCourses(adminOnly);
        } catch (error) {
            console.error('Failed to load my courses:', error);
            setMyMaritimeCourses([]);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadStatsData();
    }, []);

    useEffect(() => {
        if (activeMainTab !== 'MaritimeLink Listings' || activeSubTab !== 'Training Courses') return;
        loadMyMaritimeCourses();
    }, [activeMainTab, activeSubTab]);

    useEffect(() => {
        if (activeMainTab === 'Oversight') {
            if (activeSubTab === 'Training Courses') {
                loadCoursesData(currentPage);
            } else {
                loadOversightData(activeSubTab, currentPage, searchQuery);
            }
        } else if (activeMainTab === 'MaritimeLink Listings' && activeSubTab === 'Jobs') {
            loadJobsData(currentPage);
        }
    }, [currentPage, activeSubTab, activeMainTab, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeMainTab, activeSubTab]);

    const handleRefresh = () => {
        // Reset filters
        setSearchQuery('');
        setStatusFilter('Status');
        setRiskFilter('Risk Level');
        setCurrentPage(1);
        loadStatsData();
        if (activeMainTab === 'Oversight') {
            if (activeSubTab === 'Training Courses') {
                loadCoursesData(1);
            } else {
                loadOversightData(activeSubTab, 1, '');
            }
        } else if (activeSubTab === 'Jobs') {
            loadJobsData(1);
        } else {
            loadMyMaritimeCourses();
        }
    };

    // Export CSV handler
    const handleExportCSV = () => {
        const currentData = getCurrentData();
        const headers = isMaritimeLinkTab
            ? (activeSubTab === 'Jobs'
                ? ['ID', 'Job Title', 'Type', 'Location', 'Status', 'Applications', 'Views', 'Posted']
                : ['ID', 'Title', 'Category', 'Location', 'Price', 'Bookings', 'Status', 'Risk', 'Posted'])
            : (activeSubTab === 'Jobs'
                ? ['ID', 'Recruiter/Company', 'Total Live Jobs', 'Jobs Posted', 'Total Applications', 'Flagged Jobs', 'Risk Level']
                : ['ID', 'Title', 'Category', 'Location', 'Price', 'Provider', 'Status', 'Flagged', 'Risk Level']);

        const csvRows = [headers.join(',')];

        currentData.forEach(record => {
            let row;
            if (isMaritimeLinkTab) {
                if (activeSubTab === 'Jobs') {
                    row = [
                        record.id,
                        `"${record.jobTitle}"`,
                        `"${record.type}"`,
                        `"${record.location}"`,
                        record.status,
                        record.applications,
                        record.views,
                        `"${record.posted}"`
                    ];
                } else {
                    const price = [record.currency, record.price].filter(Boolean).join(' ');
                    const posted = record.createdAt
                        ? new Date(record.createdAt).toLocaleDateString()
                        : '';
                    row = [
                        record.id,
                        `"${(record.title || '').replace(/"/g, '""')}"`,
                        `"${(record.category || '').replace(/"/g, '""')}"`,
                        `"${(record.location || '').replace(/"/g, '""')}"`,
                        `"${price.replace(/"/g, '""')}"`,
                        record.enrolledCount ?? 0,
                        record.status,
                        record.riskLevel || '',
                        `"${posted}"`
                    ];
                }
            } else {
                if (activeSubTab === 'Jobs') {
                    row = [
                        record.id,
                        `"${record.recruiterName}"`,
                        record.totalLiveJobs,
                        record.jobsPosted,
                        record.totalApplications,
                        record.flaggedJobs,
                        record.riskLevel
                    ];
                } else {
                    const provider =
                        record.recruiter?.organizationName ||
                        record.recruiter?.email ||
                        record.admin?.email ||
                        '';
                    row = [
                        record.id,
                        `"${(record.title || '').replace(/"/g, '""')}"`,
                        `"${(record.category || '').replace(/"/g, '""')}"`,
                        `"${(record.location || '').replace(/"/g, '""')}"`,
                        `"${record.currency || ''} ${record.price || ''}"`.trim(),
                        `"${provider.replace(/"/g, '""')}"`,
                        record.status,
                        record.isFlagged ? 'Yes' : 'No',
                        record.riskLevel || ''
                    ];
                }
            }
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `marketplace_${activeMainTab.toLowerCase()}_${activeSubTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    // Calculate dynamic stats from API job data
    const oversightJobs = remoteJobs.filter(j => j.recruiterId);
    // Unified API Stats
    const apiJobsStats = [
        {
            value: marketplaceStats?.jobs?.live?.count?.toString() || '0',
            label: 'Active Jobs',
            sublabel: marketplaceStats?.jobs?.live?.today ? `+${marketplaceStats.jobs.live.today} today` : 'Live listings',
            icon: Briefcase,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: marketplaceStats?.jobs?.applications?.count?.toString() || '0',
            label: 'Total Applications',
            sublabel: marketplaceStats?.jobs?.applications?.today ? `+${marketplaceStats.jobs.applications.today} today` : 'All time',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: marketplaceStats?.jobs?.flagged?.toString() || '0',
            label: 'Flagged Jobs',
            sublabel: 'Action required',
            sublabelColor: 'text-red-600',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: marketplaceStats?.jobs?.removed?.toString() || '0',
            label: 'Removed/Closed',
            sublabel: 'Violations or filled',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        }
    ];

    const apiCoursesStats = [
        {
            value: marketplaceStats?.courses?.active?.count?.toString() || '0',
            label: 'Active Courses',
            sublabel: marketplaceStats?.courses?.active?.today ? `+${marketplaceStats.courses.active.today} today` : 'Live listings',
            icon: GraduationCap,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: marketplaceStats?.courses?.bookings?.count?.toString() || '0',
            label: 'Total Bookings',
            sublabel: marketplaceStats?.courses?.bookings?.today ? `+${marketplaceStats.courses.bookings.today} today` : 'All time',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: marketplaceStats?.courses?.flagged?.toString() || '0',
            label: 'Flagged Listings',
            sublabel: 'Action required',
            sublabelColor: 'text-red-600',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: marketplaceStats?.courses?.upcomingSessions?.toString() || '0',
            label: 'Upcoming Sessions',
            sublabel: 'Next 7 days',
            icon: Clock,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        }
    ];

    // Oversight Jobs Data
    const oversightJobsData = [
        {
            id: '1',
            recruiterName: 'OceanhHire Agency',
            recruiterSubtext: 'David Turner',
            totalLiveJobs: 12,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 2,
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            status: 'Active'
        },
        {
            id: '2',
            recruiterName: 'Worldwide Crew Now',
            recruiterSubtext: 'Sarah Müller',
            totalLiveJobs: 11,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 1,
            riskLevel: 'Low',
            riskColor: 'text-green-600',
            status: 'Active'
        },
        {
            id: '3',
            recruiterName: 'BlueWave Crewing',
            recruiterSubtext: 'James Wilson',
            totalLiveJobs: 11,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 2,
            riskLevel: 'Low',
            riskColor: 'text-green-600',
            status: 'Active'
        },
        {
            id: '4',
            recruiterName: 'New Horizon Crewing',
            recruiterSubtext: 'Pending Approval',
            totalLiveJobs: 0,
            jobsPosted: 0,
            totalApplications: 0,
            flaggedJobs: 0,
            riskLevel: 'Low',
            riskColor: 'text-green-600',
            status: 'Draft'
        }
    ];

    // MaritimeLink Jobs Data
    const maritimeLinkJobsData = [
        {
            id: '1',
            jobTitle: 'Deck Officer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'MECHANICAL, ON OSV',
            typeColor: 'text-blue-600',
            location: 'UK',
            status: 'Active',
            statusColor: 'text-green-600',
            applications: 10,
            views: 176,
            posted: 'Today'
        },
        {
            id: '2',
            jobTitle: 'Chief Engineer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'JOB',
            typeColor: 'text-blue-600',
            location: 'Norway',
            status: 'Draft',
            statusColor: 'text-gray-600',
            applications: 0,
            views: 0,
            posted: 'Today'
        },
        {
            id: '3',
            jobTitle: 'Second Officer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'OFFICER',
            typeColor: 'text-blue-600',
            location: 'Singapore',
            status: 'Draft',
            statusColor: 'text-gray-600',
            applications: 0,
            views: 0,
            posted: 'Yesterday'
        },
        {
            id: '4',
            jobTitle: 'Electrical Technical Officer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'TECHNICAL',
            typeColor: 'text-blue-600',
            location: 'Rotterdam',
            status: 'Draft',
            statusColor: 'text-gray-600',
            applications: 0,
            views: 0,
            posted: '2 days ago'
        },
        {
            id: '5',
            jobTitle: 'Master Mariner',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'CAPTAIN',
            typeColor: 'text-blue-600',
            location: 'Dubai',
            status: 'Draft',
            statusColor: 'text-gray-600',
            applications: 0,
            views: 0,
            posted: '3 days ago'
        }
    ];

    // Determine current stats and data based on active tab
    const getCurrentStats = () => {
        return activeSubTab === 'Jobs' ? apiJobsStats : apiCoursesStats;
    };

    const getCurrentData = () => {
        let data;
        if (activeMainTab === 'Oversight') {
            data = activeSubTab === 'Training Courses' ? coursesList : oversightData;
        } else {
            if (activeSubTab === 'Jobs') {
                data = remoteJobs.filter(job => job.adminId);
            } else {
                data = myMaritimeCourses;
            }
        }

        const isOversightCourses = activeMainTab === 'Oversight' && activeSubTab === 'Training Courses';
        const onMaritimeLinkListings = activeMainTab === 'MaritimeLink Listings';

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter((record) => {
                if (onMaritimeLinkListings) {
                    if (activeSubTab === 'Jobs') {
                        return record.jobTitle?.toLowerCase().includes(query) ||
                            record.type?.toLowerCase().includes(query) ||
                            record.location?.toLowerCase().includes(query);
                    }
                    const loc = (record.location || '').toLowerCase();
                    const cat = (record.category || '').toLowerCase();
                    const title = (record.title || '').toLowerCase();
                    return title.includes(query) || cat.includes(query) || loc.includes(query);
                }
                if (isOversightCourses) {
                    const loc = (record.location || '').toLowerCase();
                    const cat = (record.category || '').toLowerCase();
                    const title = (record.title || '').toLowerCase();
                    const org = (record.recruiter?.organizationName || '').toLowerCase();
                    const email = (record.recruiter?.email || record.admin?.email || '').toLowerCase();
                    return title.includes(query) || cat.includes(query) || loc.includes(query) ||
                        org.includes(query) || email.includes(query);
                }
                if (activeMainTab === 'Oversight' && activeSubTab === 'Jobs') {
                    return true;
                }
                return record.name?.toLowerCase().includes(query) ||
                    record.company?.toLowerCase().includes(query) ||
                    record.email?.toLowerCase().includes(query);
            });
        }

        // Apply Status Filter
        if (statusFilter !== 'Status' && statusFilter !== 'All') {
            data = data.filter((record) => {
                if (activeMainTab === 'Oversight' && activeSubTab === 'Jobs') {
                    if (statusFilter === 'Active') return Number(record.totalActive || 0) > 0;
                    if (statusFilter === 'Flagged') return Number(record.flaggedCount || 0) > 0;
                    if (statusFilter === 'Draft') return Number(record.totalPosted || 0) === 0;
                    if (statusFilter === 'Paused') return false;
                    return true;
                }
                if (isOversightCourses || (onMaritimeLinkListings && activeSubTab === 'Training Courses')) {
                    if (statusFilter === 'Flagged') return record.isFlagged === true;
                    const map = { Active: 'ACTIVE', Draft: 'DRAFT', Paused: 'PAUSED' };
                    const want = (map[statusFilter] || statusFilter).toString().toUpperCase();
                    return (record.status || '').toUpperCase() === want;
                }
                return record.status === statusFilter;
            });
        }

        // Apply Risk Filter (Oversight + MaritimeLink Training API courses)
        if (riskFilter !== 'Risk Level' && riskFilter !== 'All') {
            const want = riskFilter.toUpperCase();
            data = data.filter((record) => (record.riskLevel || '').toUpperCase() === want);
        }

        // Apply Time Filter based on posted field (or createdAt for API courses)
        if (timeFilter !== '30 Days') {
            data = data.filter((record) => {
                if (record.createdAt) {
                    const daysAgo = Math.floor(
                        (Date.now() - new Date(record.createdAt).getTime()) / 86400000
                    );
                    if (timeFilter === 'Today') return daysAgo === 0;
                    if (timeFilter === '7 Days') return daysAgo <= 7;
                    return true;
                }
                const posted = record.posted?.toLowerCase() || '';
                let daysAgo = 0;

                if (posted.includes('today')) {
                    daysAgo = 0;
                } else if (posted.includes('yesterday')) {
                    daysAgo = 1;
                } else if (posted.includes('hour')) {
                    daysAgo = 0;
                } else if (posted.includes('day')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1], 10) : 1;
                } else if (posted.includes('week')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1], 10) * 7 : 7;
                } else if (posted.includes('month')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1], 10) * 30 : 30;
                }

                if (timeFilter === 'Today') {
                    return daysAgo === 0;
                }
                if (timeFilter === '7 Days') {
                    return daysAgo <= 7;
                }
                return true;
            });
        }

        return data;
    };

    const currentStats = getCurrentStats();
    const currentData = getCurrentData();
    const isMaritimeLinkTab = activeMainTab === 'MaritimeLink Listings';
    const isCoursesOversightApi = activeMainTab === 'Oversight' && activeSubTab === 'Training Courses';

    // Pagination Logic
    // For MaritimeLink Jobs and Oversight courses, totalPages comes from backend totals.
    // For everything else, use filtered local length.
    const isOversightJobs = activeMainTab === 'Oversight' && activeSubTab === 'Jobs';
    const totalPages = (activeSubTab === 'Jobs' && isMaritimeLinkTab)
        ? Math.max(1, Math.ceil(totalRemoteJobs / itemsPerPage))
        : isOversightJobs
            ? Math.max(1, Math.ceil(totalOversight / itemsPerPage))
        : isCoursesOversightApi
            ? Math.max(1, Math.ceil(totalCourses / itemsPerPage))
            : Math.max(1, Math.ceil(currentData.length / itemsPerPage));

    // Determine if backend correctly paginated, or if we need to manually slice it.
    const isBackendPaginated =
        (activeSubTab === 'Jobs' && isMaritimeLinkTab && currentData.length <= itemsPerPage) ||
        (isOversightJobs && currentData.length <= itemsPerPage) ||
        (isCoursesOversightApi && currentData.length <= itemsPerPage);
    const totalItems = (activeSubTab === 'Jobs' && isMaritimeLinkTab)
        ? totalRemoteJobs
        : isOversightJobs
            ? totalOversight
        : isCoursesOversightApi
            ? totalCourses
            : currentData.length;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = isBackendPaginated
        ? startIndex + currentData.length
        : startIndex + itemsPerPage;

    const paginatedData = isBackendPaginated
        ? currentData // Backend handled pagination correctly
        : currentData.slice(startIndex, startIndex + itemsPerPage); // Frontend handled pagination fallback

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex flex-col bg-gray-50 p-6">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Marketplace Management</h1>
                        <p className="text-sm text-gray-500">Oversee jobs and training listings</p>
                    </div>

                    {/* Time Filter */}
                    <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                        {timeFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timeFilter === filter
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveMainTab(tab);
                                setCurrentPage(1);
                            }}
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeMainTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeMainTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs (Jobs / Training Courses) */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => {
                            setActiveSubTab('Jobs');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'Jobs'
                            ? 'bg-[#1e5a8f] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Briefcase className="h-4 w-4" />
                        Jobs
                    </button>
                    <button
                        onClick={() => {
                            setActiveSubTab('Training Courses');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'Training Courses'
                            ? 'bg-[#1e5a8f] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <GraduationCap className="h-4 w-4" />
                        Training Courses
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {currentStats.map((stat, index) => (
                    <div key={index} className={`${stat.cardBg} rounded-xl border border-gray-100 p-5`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${stat.iconBg} flex-shrink-0`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                    {stat.label}
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                                </div>
                                <div className={`text-xs font-semibold ${stat.sublabelColor || 'text-green-600'}`}>
                                    {stat.sublabel}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MaritimeLink Manage Section */}
            {isMaritimeLinkTab && (
                <div className="flex-shrink-0 bg-[#DBEAFE] rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#003971] rounded-lg">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#003971]">Manage MaritimeLink Listings</h3>
                            <p className="text-xs text-blue-600">Create and manage internal listings for the platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef} // I need to verify if I have declared this ref
                            style={{ display: 'none' }}
                            accept=".csv"
                            onChange={handleBulkUploadFile}
                        />
                        <button
                            onClick={handleBulkUploadClick}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#003971] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Bulk Upload (CSV)
                        </button>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {activeSubTab === 'Jobs' ? 'Create New Job' : 'Create New Course'}
                        </button>
                    </div>
                </div>
            )}

            {/* Marketplace Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            {/* Status Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${statusFilter !== 'Status' ? 'border-[#1e5a8f] text-[#1e5a8f] bg-[#1e5a8f]/5' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {statusFilter}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {showStatusDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setStatusFilter(option === 'All' ? 'Status' : option);
                                                    setShowStatusDropdown(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === option || (statusFilter === 'Status' && option === 'All') ? 'text-[#1e5a8f] font-semibold bg-gray-50' : 'text-gray-700'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Risk: Oversight tabs + MaritimeLink Training (API courses) */}
                            {(!isMaritimeLinkTab || activeSubTab === 'Training Courses') && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRiskDropdown(!showRiskDropdown)}
                                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${riskFilter !== 'Risk Level' ? 'border-[#1e5a8f] text-[#1e5a8f] bg-[#1e5a8f]/5' : 'border-gray-200 text-gray-700'}`}
                                    >
                                        {riskFilter}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    {showRiskDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                            {riskOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setRiskFilter(option === 'All' ? 'Risk Level' : option);
                                                        setShowRiskDropdown(false);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${riskFilter === option || (riskFilter === 'Risk Level' && option === 'All') ? 'text-[#1e5a8f] font-semibold bg-gray-50' : 'text-gray-700'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
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

                {/* Table - Content */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {!isMaritimeLinkTab ? (
                                    activeSubTab === 'Jobs' ? (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Recruiter / Company
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Active
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Posted
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Interactions
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Flagged
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Risk Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Provider
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Flagged
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Risk Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    )
                                ) : activeSubTab === 'Jobs' ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Job Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Creator
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Risk Level
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Posted
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Bookings
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Risk
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Posted
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </>
                                )
                                }
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {!isMaritimeLinkTab ? (
                                activeSubTab === 'Jobs' ? (
                                    paginatedData.map((record) => {
                                        let riskColor = 'text-green-600';
                                        if (record.riskLevel === 'MEDIUM') riskColor = 'text-orange-600';
                                        if (record.riskLevel === 'HIGH') riskColor = 'text-red-600';

                                        return (
                                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{record.name}</div>
                                                    <div className="text-xs text-gray-500">{record.company}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-900">{record.totalActive}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-900">{record.totalPosted}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-semibold text-[#1e5a8f]">{record.totalInteractions}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm ${record.flaggedCount > 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                        {record.flaggedCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm font-semibold ${riskColor}`}>
                                                        {record.riskLevel || 'LOW'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Link
                                                        to={`/admin/marketplace/oversight/recruiter/${record.id}/jobs`}
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        View Jobs
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    paginatedData.map((course) => {
                                        const rl = (course.riskLevel || 'LOW').toUpperCase();
                                        let riskColor = 'text-green-600';
                                        if (rl === 'MEDIUM') riskColor = 'text-orange-600';
                                        if (rl === 'HIGH') riskColor = 'text-red-600';

                                        const formattedStatus = course.status === 'ACTIVE' ? 'Active'
                                            : course.status === 'DRAFT' ? 'Draft'
                                                : course.status === 'PAUSED' ? 'Paused'
                                                    : (course.status || '—').replace(/_/g, ' ');
                                        let statusColor = 'text-gray-600';
                                        if (formattedStatus === 'Active') statusColor = 'text-green-600';
                                        if (formattedStatus === 'Draft') statusColor = 'text-orange-600';
                                        if (formattedStatus === 'Paused') statusColor = 'text-orange-600';

                                        const provider =
                                            course.recruiter?.organizationName ||
                                            course.recruiter?.email ||
                                            course.admin?.email ||
                                            '—';
                                        const categoryLabel = (course.category || '—').replace(/_/g, ' ');
                                        const priceLabel = [course.currency, course.price].filter(Boolean).join(' ') || '—';

                                        return (
                                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{course.title}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[220px]">{course.description || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-900">{categoryLabel}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-900">{course.location || '—'}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-semibold text-[#1e5a8f]">{priceLabel}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-900">{provider}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm font-semibold ${statusColor}`}>
                                                        {formattedStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm ${course.isFlagged ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                        {course.isFlagged ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-sm font-semibold ${riskColor}`}>
                                                        {rl}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Link
                                                        to={`/admin/marketplace/oversight/courses/${course.id}`}
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )
                            ) : activeSubTab === 'Jobs' ? (
                                paginatedData.map((job) => {
                                    const creator = job.recruiter?.organizationName || job.admin?.email || (job.adminId ? 'MaritimeLink Admin' : 'Unknown');
                                    const formattedStatus = job.status === 'ACTIVE' ? 'Active' : (job.status === 'DRAFT' ? 'Draft' : 'Closed');
                                    let statusColor = 'text-gray-600';
                                    if (formattedStatus === 'Active') statusColor = 'text-green-600';
                                    if (formattedStatus === 'Draft') statusColor = 'text-orange-600';

                                    let riskColor = 'text-green-600';
                                    if (job.riskLevel === 'MEDIUM') riskColor = 'text-orange-600';
                                    if (job.riskLevel === 'HIGH') riskColor = 'text-red-600';

                                    const jobType = job.category ? job.category.replace(/_/g, ' ') : 'JOB';
                                    const postedDate = new Date(job.createdAt).toLocaleDateString();

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{job.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{job.description || 'No description'}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{creator}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-[#1e5a8f]">{jobType}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{job.location}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${statusColor}`}>
                                                    {formattedStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${riskColor}`}>
                                                    {job.riskLevel || 'LOW'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{postedDate}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {formattedStatus === 'Draft' ? (
                                                    <button
                                                        onClick={() => navigate('/admin/marketplace/create-job', {
                                                            state: {
                                                                dashboardType: 'admin',
                                                                isEdit: true,
                                                                jobData: job,
                                                                returnPath: '/admin/marketplace'
                                                            }
                                                        })}
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        Edit Draft
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to={job.recruiterId
                                                            ? `/admin/marketplace/oversight/jobs/${job.id}`
                                                            : `/admin/marketplace/internal/jobs/${job.id}`
                                                        }
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                paginatedData.map((course) => {
                                    const formattedStatus = course.status === 'ACTIVE' ? 'Active'
                                        : course.status === 'DRAFT' ? 'Draft'
                                            : course.status === 'PAUSED' ? 'Paused'
                                                : (course.status || '—').replace(/_/g, ' ');
                                    let statusColor = 'text-gray-600';
                                    if (formattedStatus === 'Active') statusColor = 'text-green-600';
                                    if (formattedStatus === 'Draft') statusColor = 'text-orange-600';
                                    if (formattedStatus === 'Paused') statusColor = 'text-orange-600';

                                    const rl = (course.riskLevel || 'LOW').toUpperCase();
                                    let riskColor = 'text-green-600';
                                    if (rl === 'MEDIUM') riskColor = 'text-orange-600';
                                    if (rl === 'HIGH') riskColor = 'text-red-600';

                                    const categoryLabel = (course.category || '—').replace(/_/g, ' ');
                                    const priceLabel = [course.currency, course.price].filter(Boolean).join(' ') || '—';
                                    const postedDate = course.createdAt
                                        ? new Date(course.createdAt).toLocaleDateString()
                                        : '—';
                                    const bookings = course.enrolledCount ?? 0;

                                    return (
                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{course.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                    {course.description || '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{categoryLabel}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{course.location || '—'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-[#1e5a8f]">{priceLabel}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{bookings}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${statusColor}`}>
                                                    {formattedStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${riskColor}`}>{rl}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{postedDate}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {course.status === 'DRAFT' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/admin/create-course', {
                                                            state: {
                                                                dashboardType: 'admin',
                                                                isEdit: true,
                                                                courseData: course,
                                                                returnPath: '/admin/marketplace'
                                                            }
                                                        })}
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        Edit Course
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to={`/admin/marketplace/internal/courses/${course.id}`}
                                                        className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</span> - <span className="font-semibold">{Math.min(startIndex + paginatedData.length, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Success Notification */}
            {showExportNotification && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Data exported successfully!</span>
                </div>
            )}
            {/* Bulk Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6 text-[#003971]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Bulk Upload {activeSubTab}</h3>
                            <p className="text-gray-500 text-sm mt-1">Upload a CSV file to import multiple listings at once</p>
                        </div>

                        {!uploadComplete ? (
                            <>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors ${uploadFile ? 'border-[#003971] bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                    />

                                    {uploadFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileEdit className="h-8 w-8 text-[#003971] mb-2" />
                                            <span className="font-semibold text-gray-900">{uploadFile.name}</span>
                                            <span className="text-xs text-gray-500">{(uploadFile.size / 1024).toFixed(2)} KB</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Download className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</span>
                                            <span className="text-xs text-gray-500 mt-1">CSV files only (max 10MB)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={!uploadFile || isUploading}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all ${!uploadFile || isUploading
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#003971] hover:bg-[#002855] shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>Uploading...</span>
                                            </div>
                                        ) : (
                                            'Upload File'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h4>
                                <p className="text-gray-500">Your listings have been queued for processing.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marketplace;
