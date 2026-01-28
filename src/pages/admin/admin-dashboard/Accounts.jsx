import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, UserCheck, AlertTriangle, Shield, RefreshCw, Download } from 'lucide-react';

function Accounts() {
    const [activeTab, setActiveTab] = useState('Recruiters');
    const [timeFilter, setTimeFilter] = useState('Today');

    const tabs = ['Recruiters', 'Training Providers', 'Professionals', 'KYC Status'];

    // Stats data
    const stats = [
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

    // Sample accounts data
    const accounts = [
        {
            id: '000001',
            name: 'Oceantire Agency',
            company: 'Oceantire Ltd',
            domain: 'oceantir e.com',
            country: 'United Kingdom',
            tier: 'Pro',
            lastActive: '2 hours ago',
            status: 'Pending',
            statusColor: 'text-orange-500'
        },
        {
            id: '000001',
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
            id: '000001',
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
            id: '000001',
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
            id: '000001',
            name: 'Maritime Workplace',
            company: 'Maritime Workplace',
            domain: 'mwp.us',
            country: 'USA',
            tier: 'Pro',
            lastActive: '3 days ago',
            status: 'Pending',
            statusColor: 'text-orange-500'
        },
        // Add more dummy entries to show scrolling
        ...Array(10).fill(null).map((_, i) => ({
            id: `00000${i + 2}`,
            name: `Company ${i + 6}`,
            company: `Company ${i + 6} Ltd`,
            domain: `company${i + 6}.com`,
            country: 'USA',
            tier: i % 2 === 0 ? 'Pro' : 'Free',
            lastActive: `${i + 4} days ago`,
            status: ['Pending', 'Approved', 'Rejected'][i % 3],
            statusColor: ['text-orange-500', 'text-green-500', 'text-red-500'][i % 3]
        }))
    ];

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
                            onClick={() => setActiveTab(tab)}
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

            {/* Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
                        <div className="text-xs text-gray-500">{stat.sublabel}</div>
                    </div>
                ))}
            </div>

            {/* Time Filter */}
            <div className="flex-shrink-0 flex justify-end mb-4">
                <div className="bg-white p-1 rounded-xl border border-gray-100 inline-flex shadow-sm">
                    {['Today', '7 Days', '30 Days'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timeFilter === filter
                                ? 'bg-[#1e5a8f] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accounts Table Card - Scrollable */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search accounts..."
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
                                Company
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Domain
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
                            {accounts.map((account, index) => (
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
                                            to={`/admin/accounts/${account.id}`}
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
                        Showing <span className="font-semibold">10</span> of <span className="font-semibold">412</span> entries
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
                            12
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Accounts;
