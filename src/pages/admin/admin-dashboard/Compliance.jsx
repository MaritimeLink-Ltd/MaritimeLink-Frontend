import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, FileText, CheckCircle, XCircle, AlertTriangle, RefreshCw, Download, Users } from 'lucide-react';

function Compliance() {
    const [activeTab, setActiveTab] = useState('All');
    const [timeFilter, setTimeFilter] = useState('Today');

    const tabs = ['All', 'Professionals', 'Recruiters', 'Training Providers'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Stats data
    const stats = [
        {
            value: '23',
            label: 'KYC Pending Review',
            sublabel: '+4 today',
            icon: FileText,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '431',
            label: 'KYC Verified',
            sublabel: '+8 today',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: '14',
            label: 'KYC Rejected',
            sublabel: 'Action needed',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        },
        {
            value: '8',
            label: 'High-Risk Alerts',
            sublabel: 'alerts',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        }
    ];

    // Sample compliance data
    const complianceRecords = [
        {
            id: '1',
            userName: 'David Turner',
            userRole: 'Professional',
            company: 'OceanhHire Agency',
            companySubtext: 'OceanhHire Agency Ltd',
            complianceType: 'KYC',
            riskLevel: 'New submission',
            riskColor: 'text-gray-600',
            submitted: '5 hours ago',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            slaDot: 'bg-green-500',
            status: 'Pending Review'
        },
        {
            id: '2',
            userName: 'Sarah Johnson',
            userRole: 'Recruiter',
            company: 'BlueWave Crewing',
            companySubtext: 'BlueWave Crewing Ltd',
            complianceType: 'KYC',
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            submitted: '7 hours ago',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            slaDot: 'bg-green-500',
            status: 'Verified'
        },
        {
            id: '3',
            userName: 'Peter White',
            userRole: 'Recruiter',
            company: 'OceanhHire Agency',
            companySubtext: 'OceanhHire Agency Ltd',
            complianceType: 'KYC',
            riskLevel: 'Low',
            riskColor: 'text-green-600',
            submitted: '1 day ago',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            slaDot: 'bg-green-500',
            status: 'Verified'
        },
        {
            id: '4',
            userName: 'Carlos Vega',
            userRole: 'Crew Member',
            company: 'Worldwide Crew Now',
            companySubtext: 'SeaCrew Recruiters',
            complianceType: 'KYC',
            riskLevel: 'High',
            riskColor: 'text-red-600',
            submitted: '1 day ago',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            slaDot: 'bg-green-500',
            status: 'Rejected'
        },
        {
            id: '5',
            userName: 'Anna Müller',
            userRole: 'Training',
            company: 'Sophia Turner',
            companySubtext: 'Global Marine Talent',
            complianceType: 'KYC',
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            submitted: '2 days ago',
            sla: 'Within SLA',
            slaColor: 'text-green-600',
            slaDot: 'bg-green-500',
            status: 'Pending Review'
        },
        {
            id: '6',
            userName: 'Daniel Martinez',
            userRole: 'Trainer',
            company: 'Elizabeth Fang',
            companySubtext: 'Global Marine Talent',
            complianceType: 'KYC',
            riskLevel: 'High',
            riskColor: 'text-red-600',
            submitted: '2 days ago',
            sla: 'Breaching soon',
            slaColor: 'text-red-600',
            slaDot: 'bg-red-500',
            status: 'Pending Review'
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
    const itemsPerPage = 5;

    // Filter Logic
    const filteredRecords = complianceRecords.filter(record => {
        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Professionals' && (record.userRole === 'Professional' || record.userRole === 'Crew Member')) ||
            (activeTab === 'Recruiters' && record.userRole === 'Recruiter') ||
            (activeTab === 'Training Providers' && (record.userRole === 'Training' || record.userRole === 'Trainer'));

        const matchesSearch = record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.company.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === '' || record.status === statusFilter;
        const matchesRisk = riskFilter === '' || record.riskLevel === riskFilter;
        const matchesSla = slaFilter === '' || record.sla === slaFilter;

        // Time filter - parse submitted field to determine days ago
        let matchesTime = true;
        if (timeFilter !== '30 Days') {
            const submitted = record.submitted?.toLowerCase() || '';
            let daysAgo = 0;

            if (submitted.includes('min')) {
                daysAgo = 0;
            } else if (submitted.includes('hour')) {
                daysAgo = 0;
            } else if (submitted.includes('day')) {
                const match = submitted.match(/(\d+)/);
                daysAgo = match ? parseInt(match[1]) : 1;
            } else if (submitted.includes('week')) {
                const match = submitted.match(/(\d+)/);
                daysAgo = match ? parseInt(match[1]) * 7 : 7;
            }

            if (timeFilter === 'Today') {
                matchesTime = daysAgo === 0;
            } else if (timeFilter === '7 Days') {
                matchesTime = daysAgo <= 7;
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
                            {currentRecords.map((record) => (
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
