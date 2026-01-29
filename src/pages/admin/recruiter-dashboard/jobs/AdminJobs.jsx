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
    ChevronRight
} from 'lucide-react';

function AdminJobs() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        status: 'Status',
        jobType: 'Job Type',
        vessel: 'Vessel'
    });

    const stats = [
        {
            icon: Briefcase,
            label: 'Active Jobs',
            value: '8',
            subtitle: 'Currently open',
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600',
            filterStatus: 'Active'
        },
        {
            icon: FileText,
            label: 'Draft Jobs',
            value: '3',
            subtitle: 'Draft Jobs',
            color: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-600',
            filterStatus: 'Draft'
        },
        {
            icon: CheckCircle,
            label: 'Closed Jobs',
            value: '5',
            subtitle: 'Closed Jobs',
            color: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-600',
            filterStatus: 'Closed'
        },
        {
            icon: Users,
            label: 'Total Applications',
            value: '312',
            subtitle: 'Total applications',
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-600',
            filterStatus: 'Status'
        }
    ];

    const jobs = [
        {
            id: '000001',
            title: 'Chief Engineer',
            vessel: 'LNG Tanker',
            domain: 'lngtanker.com',
            location: 'Global',
            badge: 'Pro',
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
            badge: 'Free',
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
            badge: 'Pro',
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
            badge: 'Free',
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
            badge: 'Pro',
            posted: '3 days ago',
            status: 'Ends Soon',
            type: 'Contract'
        },
        {
            id: '000006',
            title: 'Master',
            vessel: 'Singapore',
            domain: 'bulkcarrier.com',
            location: 'USA',
            badge: 'Pro',
            posted: '3 days ago',
            status: 'Draft',
            type: 'Permanent'
        },
        {
            id: '000007',
            title: 'Chief Mate',
            vessel: 'Singapore',
            domain: 'offshoresupply.com',
            location: 'UK',
            badge: 'Pro',
            posted: '4 days ago',
            status: 'Active',
            type: 'Permanent'
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

        return true;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your job listings and applications</p>
                </div>
                <button className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors">
                    <Plus className="h-4 w-4" />
                    Create Job
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => setFilters({ ...filters, status: stat.filterStatus })}
                        className={`${stat.color} rounded-2xl p-5 border border-gray-100 transition-all cursor-pointer hover:shadow-md`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            <span className={`text-sm font-bold ${stat.textColor}`}>{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
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
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
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
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971] cursor-pointer"
                        >
                            <option>Vessel</option>
                            <option>LNG Tanker</option>
                            <option>Container Ship</option>
                            <option>Bulk Carrier</option>
                            <option>Offshore Supply</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                    </button>

                    <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Job Title</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Vessel / Type</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Location</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Badge</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Posted</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job, idx) => (
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
                                        <span className={`text-sm font-bold ${job.badge === 'Pro' ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {job.badge}
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
                                        <button
                                            onClick={() => navigate(`/admin/jobs/${job.id}/applicants`)}
                                            className="text-blue-600 font-bold hover:underline text-sm"
                                        >
                                            View Applicants
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-bold">10</span> of <span className="font-bold">412</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {[1, 2, 3, '...', 12].map((page, idx) => (
                            <button
                                key={idx}
                                className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-bold transition-colors ${page === 1
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
                        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminJobs;
