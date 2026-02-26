import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function AdminJobs({ onViewApplicants, onCreateJob }) {
    const navigate = useNavigate();
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
        // Simulate refresh
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleExportCSV = () => {
        // Prepare CSV data
        const headers = ['Job ID', 'Title', 'Vessel/Type', 'Location', 'Applicants', 'Posted', 'Status', 'Type'];
        const csvRows = [headers.join(',')];

        // Add job data
        jobs.forEach(job => {
            const row = [
                job.id,
                `"${job.title}"`,
                `"${job.vessel}"`,
                `"${job.location}"`,
                job.applicants,
                `"${job.posted}"`,
                job.status,
                job.type
            ];
            csvRows.push(row.join(','));
        });

        // Create CSV content
        const csvContent = csvRows.join('\\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `jobs_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show export notification
        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    const jobs = [
        {
            id: '000001',
            title: 'Chief Engineer',
            vessel: 'LNG Tanker',
            domain: 'lngtanker.com',
            location: 'Global',
            applicants: 12,
            posted: '2 hours ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000002',
            title: '3rd Officer',
            vessel: 'DP Vessel',
            domain: 'lngtanker.com',
            location: 'Singapore',
            applicants: 45,
            posted: '5 hours ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000003',
            title: 'Deck Officer',
            vessel: 'Container Ship',
            domain: 'containership.com',
            location: 'Italy',
            applicants: 8,
            posted: '1 day ago',
            status: 'Active',
            type: 'Contract'
        },
        {
            id: '000004',
            title: 'Master',
            vessel: 'Bulk Carrier',
            domain: 'bulkcarrier.com',
            location: 'India',
            applicants: 0,
            posted: '2 days ago',
            status: 'Draft',
            type: 'Permanent'
        },
        {
            id: '000005',
            title: 'Chief Mate',
            vessel: 'Offshore Supply',
            domain: 'offshoresupply.com',
            location: 'USA',
            applicants: 156,
            posted: '3 days ago',
            status: 'Closed',
            type: 'Contract'
        },
        {
            id: '000006',
            title: '2nd Engineer',
            vessel: 'Cruise Ship',
            domain: 'cruiseship.com',
            location: 'USA',
            applicants: 0,
            posted: '3 days ago',
            status: 'Draft',
            type: 'Permanent'
        },
        {
            id: '000007',
            title: 'Chief Mate',
            vessel: 'VLCC Tanker',
            domain: 'vlcctanker.com',
            location: 'UK',
            applicants: 34,
            posted: '4 days ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000008',
            title: 'Electrician (ETO)',
            vessel: 'Container Ship',
            domain: 'containership.com',
            location: 'Netherlands',
            applicants: 21,
            posted: '5 days ago',
            status: 'Active',
            type: 'Contract'
        },
        {
            id: '000009',
            title: '2nd Officer',
            vessel: 'RoRo Vessel',
            domain: 'roro.com',
            location: 'Germany',
            applicants: 67,
            posted: '6 days ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000010',
            title: 'Chief Engineer',
            vessel: 'Offshore Platform',
            domain: 'offshore.com',
            location: 'Norway',
            applicants: 89,
            posted: '1 week ago',
            status: 'Active',
            type: 'Contract'
        },
        {
            id: '000011',
            title: 'Bosun',
            vessel: 'General Cargo',
            domain: 'cargo.com',
            location: 'Philippines',
            applicants: 124,
            posted: '1 week ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000012',
            title: 'Fitter',
            vessel: 'Bulk Carrier',
            domain: 'bulkcarrier.com',
            location: 'India',
            applicants: 0,
            posted: '1 week ago',
            status: 'Draft',
            type: 'Contract'
        },
        {
            id: '000013',
            title: 'Pumpman',
            vessel: 'Chemical Tanker',
            domain: 'chemtanker.com',
            location: 'UAE',
            applicants: 42,
            posted: '2 weeks ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000014',
            title: 'AB Seaman',
            vessel: 'LNG Tanker',
            domain: 'lngtanker.com',
            location: 'Qatar',
            applicants: 215,
            posted: '2 weeks ago',
            status: 'Active',
            type: 'Permanent'
        },
        {
            id: '000015',
            title: 'Oiler',
            vessel: 'Offshore Supply',
            domain: 'offshoresupply.com',
            location: 'Australia',
            applicants: 88,
            posted: '2 weeks ago',
            status: 'Closed',
            type: 'Contract'
        }
    ];

    // Calculate dynamic counts based on job data
    const activeJobsCount = jobs.filter(job => job.status === 'Active').length;
    const draftJobsCount = jobs.filter(job => job.status === 'Draft').length;
    const closedJobsCount = jobs.filter(job => job.status === 'Closed').length;
    const totalApplications = jobs.length > 0 ? jobs.length * 22 : 0; // Mock calculation

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
            icon: FileText,
            label: 'Draft Jobs',
            value: draftJobsCount.toString(),
            subtitle: 'Draft Jobs',
            color: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600',
            filterStatus: 'Draft'
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

    const filteredJobs = jobs.filter(job => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!job.title.toLowerCase().includes(query) &&
                !job.vessel.toLowerCase().includes(query) &&
                !job.id.includes(query)) {
                return false;
            }
        }

        // Dropdown Filters
        if (filters.status !== 'Status' && job.status !== filters.status) return false;
        // Note: Mock data needs 'type' property added to support job type filtering properly, or we assume defaults.
        // I added 'type' property to the mock data above.
        if (filters.jobType !== 'Job Type' && job.type !== filters.jobType) return false;

        // Vessel Filter - Partial match or exact?
        // Using includes for vessel because 'vessel' field might be 'LNG Tanker' and filter might be 'LNG Tanker'
        if (filters.vessel !== 'Vessel' && !job.vessel.includes(filters.vessel)) return false;

        // Posted Time Filter
        if (filters.postedTime !== '') {
            const postedString = job.posted.toLowerCase();
            let postedDaysAgo = 0;

            if (postedString.includes('hour') || postedString.includes('minute')) {
                postedDaysAgo = 0;
            } else if (postedString.includes('day')) {
                postedDaysAgo = parseInt(postedString) || 1;
            } else if (postedString.includes('week')) {
                postedDaysAgo = (parseInt(postedString) || 1) * 7;
            } else if (postedString.includes('month')) {
                postedDaysAgo = (parseInt(postedString) || 1) * 30;
            } else if (postedString.includes('year')) {
                postedDaysAgo = (parseInt(postedString) || 1) * 365;
            }

            if (filters.postedTime === 'Today' && postedDaysAgo > 0) return false;
            if (filters.postedTime === '7 Days' && postedDaysAgo > 7) return false;
            if (filters.postedTime === '30 Days' && postedDaysAgo > 30) return false;
        }

        return true;
    });

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
                            onClick={() => onCreateJob ? onCreateJob() : navigate('/admin/upload-job', {
                                state: {
                                    dashboardType: 'recruiter',
                                    returnPath: '/admin/jobs'
                                }
                            })}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                                    {currentJobs.map((job, idx) => (
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
                                                                navigate(`/admin/jobs/${job.id}`, { state: { jobData: job } });
                                                            }
                                                        }}
                                                        className="text-[#003971] font-bold hover:underline text-sm"
                                                    >
                                                        View Detail
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate('/admin/upload-job', {
                                                            state: {
                                                                jobData: job,
                                                                isEdit: true,
                                                                dashboardType: 'recruiter',
                                                                returnPath: '/admin/jobs'
                                                            }
                                                        })}
                                                        className="text-gray-600 font-bold hover:underline text-sm"
                                                    >
                                                        Edit Draft
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 font-medium">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalJobs)} of {totalJobs} entries
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
