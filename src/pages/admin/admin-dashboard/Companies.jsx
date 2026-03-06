import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Building, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

function Companies() {
    const [activeTab, setActiveTab] = useState('All Companies');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const tabs = ['All Companies', 'Recruiters', 'Training Providers'];

    // Stats data
    const stats = [
        {
            value: '401',
            label: 'Total Companies',
            sublabel: '+6 today',
            icon: Building,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '368',
            label: 'Claimed',
            sublabel: '+8 today',
            icon: CheckCircle,
            iconColor: 'text-green-500',
            iconBg: 'bg-green-50',
            cardBg: 'bg-white'
        },
        {
            value: '29',
            label: 'Unclaimed',
            sublabel: 'Action needed',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '4',
            label: 'Merge Requests',
            sublabel: 'Pending review',
            icon: () => (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        }
    ];

    // Sample companies data
    const companies = [
        {
            id: '1',
            name: 'OceanhHire Agency',
            type: 'Recruiting Agency',
            website: 'oceanhire.com',
            country: 'UK',
            countryFlag: '🇬🇧',
            claimed: true,
            tier: 'Pro',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '5 hours ago',
            lastActive: '15 mins ago'
        },
        {
            id: '2',
            name: 'BlueWave Crewing',
            type: 'Recruiting Agency',
            website: 'bluewavecrew.com',
            country: 'Canada',
            countryFlag: '🇨🇦',
            claimed: true,
            tier: 'Pro',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '2 days ago',
            lastActive: '2 days ago'
        },
        {
            id: '3',
            name: 'Global Marine Talent',
            type: 'Recruiting Agency',
            website: 'managitalent.com',
            country: 'Italy',
            countryFlag: '🇮🇹',
            claimed: false,
            tier: 'Free',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '5 days ago',
            lastActive: '5 days ago'
        },
        {
            id: '4',
            name: 'SeaCrew Recruiters',
            type: 'Recruiting Agency',
            website: 'managitalent.com',
            country: 'Sweden',
            countryFlag: '🇸🇪',
            claimed: false,
            tier: 'Free',
            profile: 'Incomplete',
            profileColor: 'text-orange-600',
            joinedAt: '3 days ago',
            lastActive: '3 weeks ago'
        },
        {
            id: '5',
            name: 'SeamanShip Recruiting',
            type: 'Training Provider',
            website: 'managitalent.com',
            country: 'Japan',
            countryFlag: '🇯🇵',
            claimed: true,
            tier: 'Pro',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '1 week ago',
            lastActive: '2 weeks ago'
        },
        {
            id: '6',
            name: 'Worldwide Crew Now',
            type: 'Recruiting Agency',
            website: 'managitalent.com',
            country: 'Philippines',
            countryFlag: '🇵🇭',
            claimed: true,
            tier: 'Pro',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '6 days ago',
            lastActive: '2 weeks ago'
        }
    ];

    // Filter companies based on active tab and search query
    // Filter states
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dropdown visibility states
    const [openDropdown, setOpenDropdown] = useState(''); // 'status', 'type', 'country' or ''

    // Get unique values for filters
    const uniqueTypes = ['Claimed', 'Unclaimed'];
    const uniqueCountries = [...new Set(companies.map(c => c.country))];
    const uniqueStatuses = ['Complete', 'Incomplete']; // Based on profile field

    // Close dropdowns when clicking outside (simple implementation by detecting clicks on backdrop if needed, or just toggle)
    const toggleDropdown = (name) => {
        if (openDropdown === name) {
            setOpenDropdown('');
        } else {
            setOpenDropdown(name);
        }
    };

    // Filter companies based on active tab, search query, and dropdown filters
    const filteredCompanies = companies.filter(company => {
        const matchesTab =
            activeTab === 'All Companies' ||
            (activeTab === 'Recruiters' && company.type === 'Recruiting Agency') ||
            (activeTab === 'Training Providers' && company.type === 'Training Provider');

        const matchesSearch =
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.country.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter ? company.profile === statusFilter : true;
        const matchesType = typeFilter
            ? (typeFilter === 'Claimed' ? company.claimed === true : company.claimed === false)
            : true;
        const matchesCountry = countryFilter ? company.country === countryFilter : true;

        return matchesTab && matchesSearch && matchesStatus && matchesType && matchesCountry;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleExportCSV = () => {
        const headers = ['Name', 'Type', 'Website', 'Country', 'Tier', 'Profile', 'Joined At', 'Last Active'];
        const csvContent = [
            headers.join(','),
            ...filteredCompanies.map(c => [
                c.name,
                c.type,
                c.website,
                c.country,
                c.tier,
                c.profile,
                c.joinedAt,
                c.lastActive
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'companies_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2">Companies Overview</h1>
                <p className="text-sm text-gray-500 mb-6">Manage organizations and company profiles</p>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200">
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
            </div>

            {/* Unified Stats Card */}
            <div className="flex-shrink-0 bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
                <div className="grid grid-cols-4 divide-x divide-gray-100">
                    {/* Total Companies - Special Style */}
                    <div className="p-6 bg-blue-50/50 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600">
                            <Building className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-900 mb-0.5 whitespace-nowrap">
                                Total Companies <span className="text-gray-500 font-normal">({stats[0].value})</span>
                            </div>
                            <div className="text-sm font-bold text-blue-500">{stats[0].sublabel}</div>
                        </div>
                    </div>

                    {/* Other Stats */}
                    {stats.slice(1).map((stat, index) => (
                        <div key={index} className="p-6 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.iconBg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900 mb-0.5 whitespace-nowrap">
                                    {stat.label} <span className="text-gray-500 font-normal">({stat.value})</span>
                                </div>
                                <div className="text-sm text-gray-400 font-medium">{stat.sublabel}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Companies Table Card - Scrollable */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search companies..."
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
                                    onClick={() => toggleDropdown('status')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${statusFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    Status {statusFilter && `(${statusFilter})`}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'status' && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown('')} />
                                        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                onClick={() => { setStatusFilter(''); setOpenDropdown(''); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === '' ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                            >
                                                All Statuses
                                            </button>
                                            {uniqueStatuses.map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => { setStatusFilter(status); setOpenDropdown(''); }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === status ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Type Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('type')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${typeFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    Type {typeFilter && `(Selected)`}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'type' && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown('')} />
                                        <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                onClick={() => { setTypeFilter(''); setOpenDropdown(''); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${typeFilter === '' ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                            >
                                                All Types
                                            </button>
                                            {uniqueTypes.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => { setTypeFilter(type); setOpenDropdown(''); }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${typeFilter === type ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Country Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('country')}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${countryFilter ? 'border-[#1e5a8f] text-[#1e5a8f] bg-blue-50' : 'border-gray-200 text-gray-700'}`}
                                >
                                    Country {countryFilter && `(${countryFilter})`}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openDropdown === 'country' && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown('')} />
                                        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                            <button
                                                onClick={() => { setCountryFilter(''); setOpenDropdown(''); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${countryFilter === '' ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                            >
                                                All Countries
                                            </button>
                                            {uniqueCountries.map(country => (
                                                <button
                                                    key={country}
                                                    onClick={() => { setCountryFilter(country); setOpenDropdown(''); }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${countryFilter === country ? 'font-bold text-[#1e5a8f]' : 'text-gray-700'}`}
                                                >
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setIsRefreshing(true);
                                    setTimeout(() => setIsRefreshing(false), 1000);
                                    setStatusFilter('');
                                    setTypeFilter('');
                                    setCountryFilter('');
                                    setSearchQuery('');
                                    setActiveTab('All Companies');
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
                <div className="overflow-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Website/Domain
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Tier
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Profile
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Joined At
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {currentCompanies.map((company, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{company.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{company.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a
                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 group cursor-pointer w-fit"
                                        >
                                            <span className="text-sm text-gray-700 group-hover:text-[#1e5a8f]">{company.website}</span>
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-[#1e5a8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{company.countryFlag}</span>
                                            <span className="text-sm text-gray-700 font-medium">{company.country}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${company.tier === 'Pro'
                                            ? 'text-[#1e5a8f]'
                                            : 'text-gray-500'
                                            }`}>
                                            {company.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${company.profileColor}`}>
                                            {company.profile}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">{company.joinedAt}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500">{company.lastActive}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/admin/companies/${company.id}`}
                                            className="text-sm font-bold text-[#1e5a8f] hover:underline"
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
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastItem, filteredCompanies.length)}</span> of <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number
                                    ? 'bg-[#1e5a8f] text-white'
                                    : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Companies;
