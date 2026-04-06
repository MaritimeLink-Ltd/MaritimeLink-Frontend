import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, FileText, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download, Users } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function Compliance() {
    const [activeTab, setActiveTab] = useState('All');
    const [timeFilter, setTimeFilter] = useState('30 Days');

    const tabs = ['All', 'Professionals', 'Recruiters', 'Training Providers'];
    const timeFilters = ['Today', '7 Days', '30 Days', 'All'];

    const [complianceRecords, setComplianceRecords] = useState([]);
    const [apiStats, setApiStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    useEffect(() => {
        const fetchSubmissions = async () => {
            setIsLoading(true);
            try {
                const [submissionsResponse, statsResponse] = await Promise.all([
                    httpClient.get(API_ENDPOINTS.ADMIN.KYC_SUBMISSIONS),
                    httpClient.get(API_ENDPOINTS.ADMIN.KYC_STATS)
                ]);
                
                const data = submissionsResponse?.data?.submissions || [];
                const statsData = statsResponse?.data || null;
                setApiStats(statsData);
                
                const mappedRecords = data.map(item => {
                    let statusLabel = 'Pending Review';
                    if (item.status === 'APPROVED') statusLabel = 'Verified';
                    else if (item.status === 'REJECTED') statusLabel = 'Rejected';

                    let riskColor = 'text-gray-600';
                    if (item.riskLevel === 'LOW') riskColor = 'text-green-600';
                    else if (item.riskLevel === 'MEDIUM') riskColor = 'text-orange-600';
                    else if (item.riskLevel === 'HIGH') riskColor = 'text-red-600';

                    let slaColor = 'text-green-600';
                    let slaDot = 'bg-green-500';
                    if (item.slaStatus?.toLowerCase().includes('breach')) {
                        slaColor = 'text-red-600';
                        slaDot = 'bg-red-500';
                    }

                    return {
                        id: item.id,
                        originalId: item.id,
                        userName: item.name || 'Unknown',
                        userRole: item.roleLabel || item.userType,
                        company: item.companyName || 'N/A',
                        companySubtext: item.email || '',
                        complianceType: 'KYC',
                        riskLevel: item.riskLevel || 'Unknown',
                        riskColor: riskColor,
                        submitted: getTimeAgo(item.submittedAt),
                        rawSubmittedDate: item.submittedAt,
                        sla: item.slaStatus || 'Within SLA',
                        slaColor: slaColor,
                        slaDot: slaDot,
                        status: statusLabel,
                        rawUserType: item.userType
                    };
                });
                setComplianceRecords(mappedRecords);
            } catch (err) {
                console.error("Failed to fetch kyc submissions:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [fetchTrigger]);

    // Stats data from API
    const stats = [
        {
            value: apiStats?.pendingReview?.count?.toString() || '0',
            label: 'KYC Pending Review',
            sublabel: apiStats?.pendingReview?.today ? `+${apiStats.pendingReview.today} today` : 'Action needed',
            icon: FileText,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: apiStats?.verified?.toString() || '0',
            label: 'KYC Verified',
            sublabel: 'Good standing',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: apiStats?.rejected?.toString() || '0',
            label: 'KYC Rejected',
            sublabel: 'Action needed',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        },
        {
            value: apiStats?.highRisk?.toString() || '0',
            label: 'High-Risk Alerts',
            sublabel: 'alerts',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        }
    ];

    // State for Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [slaFilter, setSlaFilter] = useState('');
    const [openDropdown, setOpenDropdown] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredRecords = complianceRecords.filter(record => {
        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Professionals' && record.rawUserType === 'PROFESSIONAL') ||
            (activeTab === 'Recruiters' && record.rawUserType === 'RECRUITER') ||
            (activeTab === 'Training Providers' && record.rawUserType === 'TRAINING_PROVIDER');

        const matchesSearch = record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.company.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === '' || record.status === statusFilter;
        const matchesRisk = riskFilter === '' || record.riskLevel === riskFilter;
        const matchesSla = slaFilter === '' || record.sla === slaFilter;

        let matchesTime = true;
        if (record.rawSubmittedDate) {
            const submittedDate = new Date(record.rawSubmittedDate);
            const now = new Date();
            
            // Normalize to midnight to compute calendar days difference accurately
            const submittedDay = new Date(submittedDate.getFullYear(), submittedDate.getMonth(), submittedDate.getDate());
            const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = currentDay - submittedDay;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (timeFilter === 'All') {
                matchesTime = true;
            } else if (timeFilter === 'Today') {
                matchesTime = diffDays === 0;
            } else if (timeFilter === '7 Days') {
                matchesTime = diffDays <= 7;
            } else if (timeFilter === '30 Days') {
                matchesTime = diffDays <= 30;
            }
        }

        return matchesTab && matchesSearch && matchesStatus && matchesRisk && matchesSla && matchesTime;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    // Unique Values for Dropdowns
    const uniqueStatuses = [...new Set(complianceRecords.map(item => item.status))];
    const uniqueRisks = [...new Set(complianceRecords.map(item => item.riskLevel))];
    const uniqueSlas = [...new Set(complianceRecords.map(item => item.sla))];

    const toggleDropdown = (name) => {
        if (openDropdown === name) {
            setOpenDropdown('');
        } else {
            setOpenDropdown(name);
        }
    };

    const handleExportCSV = () => {
        const headers = ['User', 'Role', 'Company', 'Compliance Type', 'Risk Level', 'Status', 'Submitted', 'SLA'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(item => [
                item.userName,
                item.userRole,
                item.company,
                item.complianceType,
                item.riskLevel,
                item.status,
                item.submitted,
                item.sla
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'compliance_records.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-6">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2">Compliance</h1>
                <p className="text-sm text-gray-500 mb-6">Identity, documents, and platform risk</p>

                {/* Tabs and All Users Button */}
                <div className="flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab
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
                    <Link to="/admin/accounts" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 pb-3">
                        <Users className="h-4 w-4" />
                        All Users
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
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
                                <div className="text-xs text-green-600 font-semibold">{stat.sublabel}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Filter */}
            <div className="flex-shrink-0 flex justify-end mb-4">
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

            {/* Compliance Table Card - Scrollable */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            {/* Status Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('status')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${statusFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {statusFilter || 'Status'}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'status' && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20">
                                        <button
                                            onClick={() => { setStatusFilter(''); setOpenDropdown(''); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            All Statuses
                                        </button>
                                        {uniqueStatuses.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setOpenDropdown(''); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Risk Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('risk')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${riskFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {riskFilter || 'Risk Level'}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'risk' && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20">
                                        <button
                                            onClick={() => { setRiskFilter(''); setOpenDropdown(''); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            All Risk Levels
                                        </button>
                                        {uniqueRisks.map(risk => (
                                            <button
                                                key={risk}
                                                onClick={() => { setRiskFilter(risk); setOpenDropdown(''); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                {risk}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SLA Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('sla')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${slaFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {slaFilter || 'SLA'}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'sla' && (
                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20">
                                        <button
                                            onClick={() => { setSlaFilter(''); setOpenDropdown(''); }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            All SLA
                                        </button>
                                        {uniqueSlas.map(sla => (
                                            <button
                                                key={sla}
                                                onClick={() => { setSlaFilter(sla); setOpenDropdown(''); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                {sla}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setIsRefreshing(true);
                                    setFetchTrigger(prev => prev + 1);
                                    setTimeout(() => setIsRefreshing(false), 1000);
                                    setStatusFilter('');
                                    setRiskFilter('');
                                    setSlaFilter('');
                                    setSearchQuery('');
                                    setCurrentPage(1);
                                }}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                title="Reset Filters"
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

                {/* Table - Scrollable Content */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Compliance Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Risk Level
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    SLA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500 bg-gray-50/50">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <RefreshCw className="h-6 w-6 text-[#1e5a8f] animate-spin" />
                                            <span>Loading submissions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500 bg-gray-50/50">
                                        No compliance records found.
                                    </td>
                                </tr>
                            ) : currentRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{record.userName}</div>
                                        <div className="text-xs text-gray-500">{record.userRole}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{record.company}</div>
                                        <div className="text-xs text-gray-500">{record.companySubtext}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-semibold text-[#1e5a8f]">
                                            {record.complianceType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-sm font-semibold ${record.riskColor}`}>
                                            {record.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">{record.submitted}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${record.slaDot}`}></div>
                                            <span className={`text-sm font-semibold ${record.slaColor}`}>
                                                {record.sla}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Link
                                            to={`/admin/compliance/${record.id}`}
                                            state={{ userType: record.rawUserType }}
                                            className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{Math.min(indexOfFirstItem + 1, filteredRecords.length)}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, filteredRecords.length)}</span> of <span className="font-semibold">{filteredRecords.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === number
                                    ? 'bg-[#1e5a8f] text-white'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Compliance;
