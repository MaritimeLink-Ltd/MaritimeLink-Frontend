import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jobService from '../../../../services/jobService';
import {
    Plus,
    Search,
    ChevronDown,
    RefreshCw,
    Download,
    Briefcase,
    FileText,
    CheckCircle,
    Users,
    ChevronLeft,
    ChevronRight,
    Check
} from 'lucide-react';

const getSessionRole = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userType') || localStorage.getItem('adminUserType') || '';
};

function AdminJobs({ onViewApplicants, onCreateJob }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminContext = getSessionRole() === 'admin';
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState({
        status: 'Status',
        jobType: 'Job Type',
        vessel: 'Vessel',
        postedTime: '' // '' means all
    });
    const [showExportNotification, setShowExportNotification] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchJobs();
    };

    const csvEscape = (value) => {
        const s = value === null || value === undefined ? '' : String(value);
        return `"${s.replace(/"/g, '""')}"`;
    };

    const downloadCsv = (filename, csvContent) => {
        // Add UTF-8 BOM so Excel opens the file correctly (avoids “blank”/garbled display for some setups).
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Cleanup (avoid blob URL leak) — delay to avoid canceling the download in some browsers.
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    const handleExportCSV = () => {
        // Export what the user is currently seeing (filtered rows, not full list).
        const rowsToExport = filteredJobs;

        const headers = ['Job ID', 'Title', 'Category', 'Location', 'Applicants', 'Posted', 'Status', 'Contract Type'];
        const csvRows = [headers.map(csvEscape).join(',')];

        rowsToExport.forEach((job) => {
            const row = [
                job?.id,
                job?.title,
                job?.vessel,
                job?.location,
                job?.applicants,
                job?.posted,
                job?.status,
                job?.type,
            ].map(csvEscape);
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\r\n');
        downloadCsv(`jobs_export_${new Date().toISOString().split('T')[0]}.csv`, csvContent);

        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const response = isAdminContext
                ? await jobService.getAllAdminJobs(1, 500)
                : await jobService.getMyJobs();
            const rawJobs = response?.data?.jobs || [];
            if (Array.isArray(rawJobs)) {
                // Map API data to the format expected by the component
                const mappedJobs = rawJobs.map((job) => {
                    const createdAt = job?.createdAt ? new Date(job.createdAt) : null;
                    const now = new Date();
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const startOfCreated = createdAt
                        ? new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
                        : null;
                    const diffDays = startOfCreated
                        ? Math.max(0, Math.floor((startOfToday - startOfCreated) / (1000 * 60 * 60 * 24)))
                        : 0;
                    const isToday =
                        !!createdAt &&
                        now.getFullYear() === createdAt.getFullYear() &&
                        now.getMonth() === createdAt.getMonth() &&
                        now.getDate() === createdAt.getDate();

                    let postedString = `${diffDays} days ago`;
                    if (isToday) {
                        postedString = 'Today';
                    } else if (diffDays === 1) {
                        postedString = '1 day ago';
                    }

                    // Format contract type and category nicely
                    const formattedType = job.contractType ? 
                        job.contractType.charAt(0) + job.contractType.slice(1).toLowerCase() : 'Permanent';
                    
                    const formatCategory = (cat) => {
                        if (!cat) return '';
                        return cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
                    };

                    const formattedStatus = (() => {
                        const upper = String(job.status || '').toUpperCase();
                        if (upper === 'DRAFT') return 'Draft';
                        if (upper === 'EXPIRED') return 'Expired';
                        if (upper === 'FILLED') return 'Filled';
                        if (upper === 'REMOVED') return 'Closed';
                        return 'Active';
                    })();

                    return {
                        ...job, // Spread original data first
                        id: job.id,
                        title: job.title || 'Untitled',
                        vessel: formatCategory(job.category) || 'General',
                        domain: job.recruiter?.email || job.admin?.email || job.companyId || 'company.com',
                        location: job.location || 'Global',
                        applicants: Number(job?._count?.applications ?? job.applicantsCount ?? 0),
                        posted: postedString,
                        postedDaysAgo: diffDays,
                        createdAt,
                        closingDate: job.closingDate ? new Date(job.closingDate) : null,
                        status: formattedStatus,
                        type: formattedType
                    };
                });
                
                // Sort by newest first
                mappedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setJobs(mappedJobs);
            }
        } catch (error) {
            console.error('Failed to fetch my jobs:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false); // Reset refreshing state if called from handleRefresh
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [location.state?.refreshJobsAt]);

    // If user changes filters/search, keep them on page 1 (otherwise it looks like filters "don't work").
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters.status, filters.jobType, filters.vessel, filters.postedTime]);


    const activeJobsCount = jobs.filter(job => job.status === 'Active').length;
    const closedJobsCount = jobs.filter((job) =>
        ['Closed', 'Expired', 'Filled'].includes(job.status)
    ).length;
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applicants || 0), 0);

    const stats = [
        {
            icon: Briefcase,
            label: 'Active Jobs',
            value: activeJobsCount.toString(),
            subtitle: 'Currently open',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600',
            filterStatus: 'Active'
        },
        {
            icon: CheckCircle,
            label: 'Closed Jobs',
            value: closedJobsCount.toString(),
            subtitle: 'Closed Jobs',
            color: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-600',
            filterStatus: 'Closed'
        },
        {
            icon: Users,
            label: 'Total Applications',
            value: totalApplications.toString(),
            subtitle: 'Total applications',
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-600',
            filterStatus: 'Status'
        }
    ];

    const filteredJobs = useMemo(() => jobs.filter((job) => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const title = String(job?.title || '').toLowerCase();
            const vessel = String(job?.vessel || '').toLowerCase();
            const id = String(job?.id || '').toLowerCase();
            const location = String(job?.location || '').toLowerCase();
            if (!title.includes(query) && !vessel.includes(query) && !id.includes(query) && !location.includes(query)) {
                return false;
            }
        }

        // Dropdown Filters
        if (filters.status !== 'Status') {
            if (filters.status === 'Closed') {
                if (!['Closed', 'Expired', 'Filled'].includes(job.status)) return false;
            } else if (filters.status === 'Ends Soon') {
                if (!job.closingDate) return false;
                const daysUntilClosing = (job.closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                if (daysUntilClosing < 0 || daysUntilClosing > 7 || job.status !== 'Active') return false;
            } else if (job.status !== filters.status) {
                return false;
            }
        }
        // Note: Mock data needs 'type' property added to support job type filtering properly, or we assume defaults.
        // I added 'type' property to the mock data above.
        if (filters.jobType !== 'Job Type' && job.type !== filters.jobType) return false;

        // Vessel Filter - Partial match or exact?
        // Using includes for vessel because 'vessel' field might be 'LNG Tanker' and filter might be 'LNG Tanker'
        if (filters.vessel !== 'Vessel' && !job.vessel.includes(filters.vessel)) return false;

        // Posted Time Filter
        if (filters.postedTime !== '') {
            const postedDaysAgo = job.postedDaysAgo !== undefined ? job.postedDaysAgo : 0;
            const createdAt = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt);
            const isToday =
                createdAt.getFullYear() === new Date().getFullYear() &&
                createdAt.getMonth() === new Date().getMonth() &&
                createdAt.getDate() === new Date().getDate();

            if (filters.postedTime === 'Today' && !isToday) return false;
            if (filters.postedTime === '7 Days' && postedDaysAgo > 7) return false;
            if (filters.postedTime === '30 Days' && postedDaysAgo > 30) return false;
        }

        return true;
    }), [jobs, searchQuery, filters.status, filters.jobType, filters.vessel, filters.postedTime]);

    // Pagination logic
    const totalJobs = filteredJobs.length;
    const totalPages = Math.ceil(totalJobs / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-8 pt-4 pb-3 bg-[#FAFBFC]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                        <p className="text-gray-600 mt-1 text-sm font-medium">Manage your job listings and applications</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Segmented Control for Posted Time */}
                        <div className="flex bg-[#F8F9FA] p-1 rounded-xl border border-gray-200">
                            {['Today', '7 Days', '30 Days'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setFilters({
                                        ...filters,
                                        postedTime: filters.postedTime === period ? '' : period
                                    })}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filters.postedTime === period
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                if (isAdminContext) {
                                    navigate('/admin/marketplace/create-job', {
                                        state: {
                                            dashboardType: 'admin',
                                            returnPath: '/admin/jobs',
                                        },
                                    });
                                    return;
                                }

                                if (onCreateJob) {
                                    onCreateJob();
                                    return;
                                }

                                navigate('/recruiter/upload-job', {
                                    state: {
                                        dashboardType: 'recruiter',
                                        returnPath: '/recruiter/jobs'
                                    }
                                });
                            }}
                            className="bg-[#003971] text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-4">
                <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                onClick={() => setFilters({ ...filters, status: stat.filterStatus })}
                                className={`${stat.color} rounded-xl p-4 border border-gray-100 transition-all cursor-pointer hover:shadow-md`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                    <span className={`text-sm font-bold ${stat.textColor}`}>{stat.label}</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600 font-medium">{stat.subtitle}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                                >
                                    <option>Status</option>
                                    <option>Active</option>
                                    <option>Draft</option>
                                    <option>Closed</option>
                                    <option>Ends Soon</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.jobType}
                                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                                >
                                    <option>Job Type</option>
                                    <option>Permanent</option>
                                    <option>Contract</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.vessel}
                                    onChange={(e) => setFilters({ ...filters, vessel: e.target.value })}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                                >
                                    <option>Vessel</option>
                                    <option>LNG Tanker</option>
                                    <option>Container Ship</option>
                                    <option>Bulk Carrier</option>
                                    <option>Offshore Supply</option>
                                    <option>DP Vessel</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                                onClick={handleExportCSV}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Jobs Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Job Title</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Vessel / Type</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Location</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Applicants</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Posted</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                Loading jobs...
                                            </td>
                                        </tr>
                                    ) : currentJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No jobs found. Apply filters or create a new job.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentJobs.map((job, idx) => (
                                        <tr key={job.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{job.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    ID:<br />
                                                    {job.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{job.vessel}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{job.domain}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-700">{job.location}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold text-gray-900`}>
                                                    {job.applicants}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-700 text-sm">{job.posted}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${job.status === 'Active' ? 'text-green-600' :
                                                    job.status === 'Draft' ? 'text-orange-600' :
                                                        'text-orange-600'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {job.status !== 'Draft' ? (
                                                    <button
                                                        onClick={() => {
                                                            if (onViewApplicants) {
                                                                // Use internal callback for embedded dashboard
                                                                onViewApplicants(job.id);
                                                            } else {
                                                                // Use navigation for standalone route
                                                                navigate(
                                                                    isAdminContext
                                                                        ? `/admin/jobs/${job.id}`
                                                                        : `/recruiter/jobs/${job.id}`,
                                                                    { state: { jobData: job } }
                                                                );
                                                            }
                                                        }}
                                                        className="text-[#003971] font-bold hover:underline text-sm"
                                                    >
                                                        View Detail
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(
                                                            isAdminContext
                                                                ? '/admin/marketplace/create-job'
                                                                : '/recruiter/upload-job',
                                                            {
                                                                state: {
                                                                    jobData: job,
                                                                    isEdit: true,
                                                                    dashboardType: isAdminContext ? 'admin' : 'recruiter',
                                                                    returnPath: isAdminContext ? '/admin/jobs' : '/recruiter/jobs',
                                                                }
                                                            }
                                                        )}
                                                        className="text-gray-600 font-bold hover:underline text-sm"
                                                    >
                                                        Edit Draft
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 font-medium">
                                {totalJobs === 0
                                    ? 'Showing 0-0 of 0 entries'
                                    : `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalJobs)} of ${totalJobs} entries`}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {getPageNumbers().map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => page !== '...' && handlePageChange(page)}
                                        className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === currentPage
                                            ? 'bg-[#003971] text-white'
                                            : page === '...'
                                                ? 'text-gray-400 cursor-default'
                                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        disabled={page === '...'}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Notification */}
            {showExportNotification && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up z-50">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Jobs exported successfully!</span>
                </div>
            )}
        </div>
    );
}

export default AdminJobs;
