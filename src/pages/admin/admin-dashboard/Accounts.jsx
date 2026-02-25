import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ChevronDown, UserCheck, AlertTriangle, Shield, RefreshCw, Download, CheckCircle } from 'lucide-react';

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
    const [timeFilter, setTimeFilter] = useState('Today');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportNotification, setShowExportNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

    // Tab-specific data
    const recruitersData = [
        {
            id: 'REC001',
            name: 'Oceantire Agency',
            company: 'Oceantire Ltd',
            domain: 'oceantire.com',
            country: 'United Kingdom',
            tier: 'Pro',
            lastActive: '2 hours ago',
            status: 'Pending',
            statusColor: 'text-orange-500'
        },
        {
            id: 'REC002',
            name: 'BlueWave Crewing',
            company: 'BlueWave Inc',
            domain: 'bluewave.com',
            country: 'USA',
            tier: 'Free',
            lastActive: '5 hours ago',
            status: 'Approved',
            statusColor: 'text-green-500'
        },
        {
            id: 'REC003',
            name: 'Global Marine Talent',
            company: 'Global Marine',
            domain: 'gmt.com',
            country: 'Italy',
            tier: 'Pro',
            lastActive: '1 day ago',
            status: 'Stage 1 Approved',
            statusColor: 'text-blue-500'
        },
        {
            id: 'REC004',
            name: 'SeaCrew Recruiters',
            company: 'SeaCrew Pvt',
            domain: 'seacrew.org',
            country: 'India',
            tier: 'Free',
            lastActive: '2 days ago',
            status: 'Rejected',
            statusColor: 'text-red-500'
        },
        {
            id: 'REC005',
            name: 'Maritime Workplace',
            company: 'Maritime Workplace',
            domain: 'mwp.us',
            country: 'USA',
            tier: 'Pro',
            lastActive: '3 days ago',
            status: 'Pending',
            statusColor: 'text-orange-500'
        },
        ...Array(10).fill(null).map((_, i) => ({
            id: `REC${String(i + 6).padStart(3, '0')}`,
            name: `Recruiter ${i + 6}`,
            company: `Recruiter ${i + 6} Ltd`,
            domain: `recruiter${i + 6}.com`,
            country: ['USA', 'UK', 'India', 'Italy', 'Greece'][i % 5],
            tier: i % 2 === 0 ? 'Pro' : 'Free',
            lastActive: `${i + 4} days ago`,
            status: ['Pending', 'Approved', 'Rejected'][i % 3],
            statusColor: ['text-orange-500', 'text-green-500', 'text-red-500'][i % 3]
        }))
    ];

    const trainingProvidersData = [
        {
            id: 'TP001',
            name: 'Maritime Academy Pro',
            company: 'Maritime Academy',
            domain: 'maritimeacademy.com',
            country: 'United Kingdom',
            tier: 'Pro',
            lastActive: '1 hour ago',
            status: 'Approved',
            statusColor: 'text-green-500'
        },
        {
            id: 'TP002',
            name: 'Ocean Training Institute',
            company: 'Ocean Training',
            domain: 'oceantraining.com',
            country: 'USA',
            tier: 'Pro',
            lastActive: '3 hours ago',
            status: 'Approved',
            statusColor: 'text-green-500'
        },
        {
            id: 'TP003',
            name: 'Seafarer Skills Center',
            company: 'Seafarer Skills',
            domain: 'seafarerskills.org',
            country: 'Philippines',
            tier: 'Free',
            lastActive: '1 day ago',
            status: 'Pending',
            statusColor: 'text-orange-500'
        },
        {
            id: 'TP004',
            name: 'Marine Safety Training',
            company: 'Marine Safety',
            domain: 'marinesafety.com',
            country: 'Norway',
            tier: 'Pro',
            lastActive: '2 days ago',
            status: 'Approved',
            statusColor: 'text-green-500'
        },
        {
            id: 'TP005',
            name: 'Nautical Education Hub',
            company: 'Nautical Education',
            domain: 'nauticaledu.com',
            country: 'Singapore',
            tier: 'Free',
            lastActive: '4 days ago',
            status: 'Rejected',
            statusColor: 'text-red-500'
        },
        ...Array(8).fill(null).map((_, i) => ({
            id: `TP${String(i + 6).padStart(3, '0')}`,
            name: `Training Provider ${i + 6}`,
            company: `Training Provider ${i + 6}`,
            domain: `training${i + 6}.com`,
            country: ['USA', 'UK', 'Philippines', 'Norway', 'Singapore'][i % 5],
            tier: i % 3 === 0 ? 'Pro' : 'Free',
            lastActive: `${i + 5} days ago`,
            status: ['Pending', 'Approved', 'Rejected'][i % 3],
            statusColor: ['text-orange-500', 'text-green-500', 'text-red-500'][i % 3]
        }))
    ];

    const professionalsData = [
        {
            id: 'PRO001',
            name: 'Captain James Wilson',
            company: 'Self-Employed',
            domain: 'N/A',
            country: 'United Kingdom',
            tier: 'Pro',
            lastActive: '30 mins ago',
            status: 'Verified',
            statusColor: 'text-green-500'
        },
        {
            id: 'PRO002',
            name: 'Chief Engineer Maria Santos',
            company: 'Self-Employed',
            domain: 'N/A',
            country: 'Philippines',
            tier: 'Free',
            lastActive: '1 hour ago',
            status: 'Verified',
            statusColor: 'text-green-500'
        },
        {
            id: 'PRO003',
            name: 'Second Officer John Smith',
            company: 'Self-Employed',
            domain: 'N/A',
            country: 'USA',
            tier: 'Pro',
            lastActive: '2 hours ago',
            status: 'Expiring Soon',
            statusColor: 'text-orange-500'
        },
        {
            id: 'PRO004',
            name: 'AB Seaman Robert Chen',
            company: 'Self-Employed',
            domain: 'N/A',
            country: 'China',
            tier: 'Free',
            lastActive: '5 hours ago',
            status: 'Verified',
            statusColor: 'text-green-500'
        },
        {
            id: 'PRO005',
            name: 'Electrician Ahmed Hassan',
            company: 'Self-Employed',
            domain: 'N/A',
            country: 'Egypt',
            tier: 'Free',
            lastActive: '1 day ago',
            status: 'Flagged',
            statusColor: 'text-red-500'
        },
        ...Array(20).fill(null).map((_, i) => ({
            id: `PRO${String(i + 6).padStart(3, '0')}`,
            name: `Professional ${i + 6}`,
            company: 'Self-Employed',
            domain: 'N/A',
            country: ['USA', 'UK', 'Philippines', 'India', 'Greece', 'China'][i % 6],
            tier: i % 3 === 0 ? 'Pro' : 'Free',
            lastActive: `${i + 2} hours ago`,
            status: ['Verified', 'Pending Verification', 'Flagged', 'Expiring Soon'][i % 4],
            statusColor: ['text-green-500', 'text-orange-500', 'text-red-500', 'text-orange-500'][i % 4]
        }))
    ];

    const kycStatusData = [
        {
            id: 'KYC001',
            name: 'Pacific Shipping Co.',
            company: 'Pacific Shipping',
            domain: 'pacificship.com',
            country: 'USA',
            tier: 'Pro',
            lastActive: '1 hour ago',
            status: 'Documents Pending',
            statusColor: 'text-orange-500'
        },
        {
            id: 'KYC002',
            name: 'Atlantic Marine Services',
            company: 'Atlantic Marine',
            domain: 'atlanticmarine.com',
            country: 'UK',
            tier: 'Pro',
            lastActive: '3 hours ago',
            status: 'Under Review',
            statusColor: 'text-blue-500'
        },
        {
            id: 'KYC003',
            name: 'Mediterranean Crew',
            company: 'Med Crew Ltd',
            domain: 'medcrew.com',
            country: 'Greece',
            tier: 'Free',
            lastActive: '1 day ago',
            status: 'KYC Approved',
            statusColor: 'text-green-500'
        },
        {
            id: 'KYC004',
            name: 'Nordic Maritime',
            company: 'Nordic Maritime AS',
            domain: 'nordicmaritime.no',
            country: 'Norway',
            tier: 'Pro',
            lastActive: '2 days ago',
            status: 'Rejected',
            statusColor: 'text-red-500'
        },
        {
            id: 'KYC005',
            name: 'Asian Seafarers Hub',
            company: 'Asian Seafarers',
            domain: 'asianseafarers.com',
            country: 'Singapore',
            tier: 'Free',
            lastActive: '3 days ago',
            status: 'Documents Pending',
            statusColor: 'text-orange-500'
        },
        ...Array(12).fill(null).map((_, i) => ({
            id: `KYC${String(i + 6).padStart(3, '0')}`,
            name: `Company ${i + 6}`,
            company: `Company ${i + 6} Ltd`,
            domain: `company${i + 6}.com`,
            country: ['USA', 'UK', 'Singapore', 'Norway', 'Greece'][i % 5],
            tier: i % 2 === 0 ? 'Pro' : 'Free',
            lastActive: `${i + 4} days ago`,
            status: ['Documents Pending', 'Under Review', 'KYC Approved', 'Rejected'][i % 4],
            statusColor: ['text-orange-500', 'text-blue-500', 'text-green-500', 'text-red-500'][i % 4]
        }))
    ];

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
                        value: '412',
                        label: 'Total Recruiters',
                        sublabel: '+12 today',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: '6',
                        label: 'Pending',
                        sublabel: 'Today (6)',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: '385',
                        label: 'Verified',
                        sublabel: 'Last 7 days',
                        icon: Shield,
                        iconColor: 'text-yellow-500',
                        iconBg: 'bg-yellow-50'
                    },
                    {
                        value: '7',
                        label: 'Flagged',
                        sublabel: 'Older',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'Training Providers':
                return [
                    {
                        value: '156',
                        label: 'Total Providers',
                        sublabel: '+5 today',
                        icon: UserCheck,
                        iconColor: 'text-purple-500',
                        iconBg: 'bg-purple-50'
                    },
                    {
                        value: '3',
                        label: 'Pending',
                        sublabel: 'Today (3)',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: '148',
                        label: 'Approved',
                        sublabel: 'Last 7 days',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: '2',
                        label: 'Rejected',
                        sublabel: 'Older',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'Professionals':
                return [
                    {
                        value: '2,847',
                        label: 'Total Professionals',
                        sublabel: '+45 today',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: '89',
                        label: 'Pending Verification',
                        sublabel: 'Today (89)',
                        icon: UserCheck,
                        iconColor: 'text-orange-500',
                        iconBg: 'bg-orange-50'
                    },
                    {
                        value: '2,721',
                        label: 'Verified',
                        sublabel: 'Last 7 days',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: '12',
                        label: 'Flagged',
                        sublabel: 'Older',
                        icon: AlertTriangle,
                        iconColor: 'text-red-500',
                        iconBg: 'bg-red-50'
                    }
                ];
            case 'KYC Status':
                return [
                    {
                        value: '245',
                        label: 'Total Submissions',
                        sublabel: '+18 today',
                        icon: UserCheck,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
                    },
                    {
                        value: '42',
                        label: 'Documents Pending',
                        sublabel: 'Awaiting upload',
                        icon: UserCheck,
                        iconColor: 'text-orange-500',
                        iconBg: 'bg-orange-50'
                    },
                    {
                        value: '178',
                        label: 'KYC Approved',
                        sublabel: 'Last 30 days',
                        icon: Shield,
                        iconColor: 'text-green-500',
                        iconBg: 'bg-green-50'
                    },
                    {
                        value: '15',
                        label: 'Under Review',
                        sublabel: 'In progress',
                        icon: AlertTriangle,
                        iconColor: 'text-blue-500',
                        iconBg: 'bg-blue-50'
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
                account.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.country?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'All' || account.status === statusFilter;

            // Company filter
            const matchesCompany = companyFilter === 'All' || account.company === companyFilter;

            // Domain filter
            const matchesDomain = domainFilter === 'All' || account.domain === domainFilter;

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
        const headers = ['ID', 'Name', 'Company', 'Domain', 'Country', 'Tier', 'Last Active', 'Status'];
        const csvRows = [headers.join(',')];

        currentData.forEach(account => {
            const row = [
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
        <div className="h-screen flex flex-col overflow-hidden">
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
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
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
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Company Domain
                                </th>
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
                            {paginatedAccounts.length > 0 ? (
                                paginatedAccounts.map((account, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{account.name}</div>
                                            <div className="text-xs text-gray-500">ID: {account.id}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{account.company}</div>
                                            <div className="text-xs text-gray-500">{account.domain}</div>
                                        </td>
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
                                            <Link
                                                to={
                                                    account.id.toString().startsWith('PRO')
                                                        ? `/admin/candidate/${account.id}`
                                                        : account.id.toString().startsWith('KYC')
                                                            ? `/admin/accounts/compliance/${account.id}`
                                                            : `/admin/accounts/${account.id}`
                                                }
                                                className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
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
