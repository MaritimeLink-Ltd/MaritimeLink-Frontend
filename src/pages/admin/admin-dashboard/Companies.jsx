import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Building, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import adminDashboardService from '../../../services/adminDashboardService';

function formatCompaniesRelativeTime(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '—';
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return '—';
    }
}

function mapApiCompany(c) {
    const typeLabel =
        c.type === 'TRAINING_AGENT'
            ? 'Training Provider'
            : c.type === 'RECRUITMENT_AGENT'
              ? 'Recruiting Agency'
              : c.type || '—';
    const site = (c.website || '').trim();
    const domain = (c.domain || '').trim();
    const displaySite = site || domain || '—';
    const href =
        site && /^https?:\/\//i.test(site)
            ? site
            : site
              ? `https://${site.replace(/^\/\//, '')}`
              : domain
                ? `https://${domain}`
                : '';
    const tierRaw = String(c.tier || '').toUpperCase();
    const tierLabel = tierRaw === 'PRO' ? 'Pro' : tierRaw === 'FREE' ? 'Free' : c.tier || '—';
    const verified = Boolean(c.isVerified);
    return {
        id: c.id,
        name: c.name || '—',
        type: typeLabel,
        rawType: c.type,
        website: displaySite,
        websiteHref: href,
        country: c.country || '—',
        claimed: Boolean(c.isClaimed),
        tier: tierLabel,
        profile: verified ? 'Complete' : 'Incomplete',
        profileColor: verified ? 'text-green-600' : 'text-orange-600',
        joinedAt: formatCompaniesRelativeTime(c.createdAt),
        lastActive: formatCompaniesRelativeTime(c.lastActive),
        members: Number(c._count?.members) || 0,
    };
}

function Companies() {
    const [activeTab, setActiveTab] = useState('All Companies');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [companyStats, setCompanyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const tabs = ['All Companies', 'Recruiters', 'Training Providers'];

    // Filter states (declared before loadCompanies so callbacks can depend on them)
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(''); // 'status', 'type', 'country' or ''

    const loadCompanies = useCallback(async () => {
        setIsRefreshing(true);
        setLoadError(null);
        try {
            const query = {};
            if (activeTab === 'Recruiters') query.type = 'RECRUITMENT_AGENT';
            else if (activeTab === 'Training Providers') query.type = 'TRAINING_AGENT';
            if (typeFilter === 'Claimed') query.status = 'CLAIMED';
            else if (typeFilter === 'Unclaimed') query.status = 'UNCLAIMED';

            const res = await adminDashboardService.getCompanies(query);
            const payload = res?.data?.data ?? res?.data ?? res;
            const list =
                payload?.companies ??
                res?.data?.companies ??
                res?.companies ??
                [];
            const stats = payload?.stats ?? res?.data?.stats ?? res?.stats ?? null;
            setCompanies(Array.isArray(list) ? list.map(mapApiCompany) : []);
            setCompanyStats(stats && typeof stats === 'object' ? stats : null);
        } catch (e) {
            console.error('Failed to load companies:', e);
            setLoadError(e?.message || 'Could not load companies');
            setCompanies([]);
            setCompanyStats(null);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [activeTab, typeFilter]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    /** Tab + Claimed/Unclaimed are applied via API query params; search/profile/country stay client-side */
    const filteredCompanies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return companies.filter((company) => {
            const matchesSearch =
                !q ||
                company.name.toLowerCase().includes(q) ||
                company.website.toLowerCase().includes(q) ||
                company.country.toLowerCase().includes(q);

            const matchesStatus = statusFilter ? company.profile === statusFilter : true;
            const matchesCountry = countryFilter ? company.country === countryFilter : true;

            return matchesSearch && matchesStatus && matchesCountry;
        });
    }, [companies, searchQuery, statusFilter, countryFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, statusFilter, typeFilter, countryFilter]);

    const totalCount = companyStats?.total?.count ?? companies.length;
    const totalToday = companyStats?.total?.today ?? 0;
    const claimedCount = companyStats?.claimed ?? companies.filter((c) => c.claimed).length;
    const unclaimedCount = companyStats?.unclaimed ?? companies.filter((c) => !c.claimed).length;

    const stats = [
        {
            value: String(totalCount),
            label: 'Total Companies',
            sublabel: totalToday > 0 ? `+${totalToday} today` : 'No new today',
            icon: Building,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: String(claimedCount),
            label: 'Claimed',
            sublabel: 'Verified organizations',
            icon: CheckCircle,
            iconColor: 'text-green-500',
            iconBg: 'bg-green-50',
            cardBg: 'bg-white'
        },
        {
            value: String(unclaimedCount),
            label: 'Unclaimed',
            sublabel: 'Action needed',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
    ];

    const itemsPerPage = 10;

    // Get unique values for filters
    const uniqueTypes = ['Claimed', 'Unclaimed'];
    const uniqueCountries = [...new Set(companies.map((c) => c.country).filter(Boolean))].sort();
    const uniqueStatuses = ['Complete', 'Incomplete']; // Based on profile field

    // Close dropdowns when clicking outside (simple implementation by detecting clicks on backdrop if needed, or just toggle)
    const toggleDropdown = (name) => {
        if (openDropdown === name) {
            setOpenDropdown('');
        } else {
            setOpenDropdown(name);
        }
    };

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

                {loadError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {loadError}
                    </div>
                )}

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
                <div className="grid grid-cols-3 divide-x divide-gray-100">
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
                                    setStatusFilter('');
                                    setTypeFilter('');
                                    setCountryFilter('');
                                    setSearchQuery('');
                                    setActiveTab('All Companies');
                                    setCurrentPage(1);
                                    loadCompanies();
                                }}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                title="Reset filters and reload"
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
                            {loading && companies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                                        Loading companies…
                                    </td>
                                </tr>
                            ) : currentCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No companies match your filters.
                                    </td>
                                </tr>
                            ) : (
                                currentCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{company.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{company.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {company.websiteHref ? (
                                            <a
                                                href={company.websiteHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 group cursor-pointer w-fit"
                                            >
                                                <span className="text-sm text-gray-700 group-hover:text-[#1e5a8f]">{company.website}</span>
                                                <svg className="w-3 h-3 text-gray-400 group-hover:text-[#1e5a8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-500">{company.website}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 font-medium">{company.country}</span>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-900">
                            {filteredCompanies.length === 0 ? 0 : indexOfFirstItem + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-gray-900">
                            {filteredCompanies.length === 0 ? 0 : Math.min(indexOfLastItem, filteredCompanies.length)}
                        </span>{' '}
                        of <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> entries
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
