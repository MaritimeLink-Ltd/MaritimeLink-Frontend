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
            slaDot: 'bg-green-500'
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
            slaDot: 'bg-green-500'
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
            slaDot: 'bg-green-500'
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
            slaDot: 'bg-green-500'
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
            slaDot: 'bg-green-500'
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
            slaDot: 'bg-red-500'
        }
    ];

    return (
        <div className="h-screen flex flex-col overflow-hidden">
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
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 pb-3">
                        <Users className="h-4 w-4" />
                        All Users
                    </button>
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
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
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
                                Pending Review
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                SLA
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
                            {complianceRecords.map((record) => (
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
                        Showing <span className="font-semibold">6</span> entries
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
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Compliance;
