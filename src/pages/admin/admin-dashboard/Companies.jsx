import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Building, CheckCircle, AlertTriangle, RefreshCw, Download } from 'lucide-react';

function Companies() {
    const [activeTab, setActiveTab] = useState('All Companies');

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
            tier: 'Pro',
            profile: 'Complete',
            profileColor: 'text-green-600',
            joinedAt: '6 days ago',
            lastActive: '2 weeks ago'
        }
    ];

    return (
        <div className="h-screen flex flex-col overflow-hidden">
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

            {/* Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`${stat.cardBg} rounded-xl border border-gray-100 p-5`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.iconBg} flex-shrink-0`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold text-gray-900 mb-0.5">
                                    {stat.label}
                                    <span className="text-gray-900">({stat.value})</span>
                                </div>
                                <div className="text-xs text-blue-600 font-semibold">{stat.sublabel}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Companies Table Card - Scrollable */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Status
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Type
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Country
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                                    Website/Domain
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tier
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Profile
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Joined At
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {companies.map((company, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                                        <div className="text-xs text-gray-500">{company.type}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm text-gray-700">{company.website}</span>
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{company.countryFlag}</span>
                                            <span className="text-sm text-gray-700">{company.country}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${company.tier === 'Pro'
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-600 bg-gray-100'
                                            }`}>
                                            {company.tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-sm font-semibold ${company.profileColor}`}>
                                            {company.profile}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">{company.joinedAt}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-600">{company.lastActive}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Link
                                            to={`/admin/companies/${company.id}`}
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
                        Showing <span className="font-semibold">10</span> of <span className="font-semibold">401</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            &larr;
                        </button>
                        <button className="px-3 py-1.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-medium">
                            1
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            2
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            3
                        </button>
                        <span className="px-2 text-gray-500">...</span>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Companies;
