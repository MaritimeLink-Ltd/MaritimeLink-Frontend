import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Filter,
    CheckCircle,
    Shield,
    AlertTriangle,
    MoreVertical
} from 'lucide-react';

function FlaggedAccounts() {
    const navigate = useNavigate();

    // Summary Stats
    const summaryStats = [
        {
            id: 1,
            icon: Shield,
            value: '2',
            label: 'Critical Issues',
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50'
        },
        {
            id: 2,
            icon: AlertTriangle,
            value: '3',
            label: 'Warnings',
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50'
        },
        {
            id: 3,
            icon: CheckCircle,
            value: '12',
            label: 'Resolved this week',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50'
        }
    ];

    // Flagged Accounts Data
    const flaggedAccounts = [
        {
            id: 1,
            accountName: 'OceanHire Agency',
            accountType: 'Recruiter',
            issueType: 'Domain Mismatch',
            severity: 'CRITICAL',
            severityColor: 'text-red-600 bg-red-50',
            detected: '2h ago',
            status: 'Pending',
            statusColor: 'text-gray-600'
        },
        {
            id: 2,
            accountName: 'Sarah Jenkins',
            accountType: 'Professional',
            issueType: 'Blurry ID Document',
            severity: 'MEDIUM',
            severityColor: 'text-orange-600 bg-orange-50',
            detected: '5h ago',
            status: 'Under Review',
            statusColor: 'text-gray-600'
        },
        {
            id: 3,
            accountName: 'Blue Wave Shipping',
            accountType: 'Recruiter',
            issueType: 'Expired License',
            severity: 'CRITICAL',
            severityColor: 'text-red-600 bg-red-50',
            detected: '1d ago',
            status: 'Pending',
            statusColor: 'text-gray-600'
        },
        {
            id: 4,
            accountName: 'John Doe',
            accountType: 'Professional',
            issueType: 'Incomplete Profile',
            severity: 'LOW',
            severityColor: 'text-blue-600 bg-blue-50',
            detected: '2d ago',
            status: 'Resolved',
            statusColor: 'text-green-600',
            resolved: true
        },
        {
            id: 5,
            accountName: 'Pacific Maritime',
            accountType: 'Recruiter',
            issueType: 'Verification Pending',
            severity: 'LOW',
            severityColor: 'text-blue-600 bg-blue-50',
            detected: '3d ago',
            status: 'Pending',
            statusColor: 'text-gray-600'
        }
    ];

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[28px] font-bold text-gray-900">Flagged Accounts</h1>
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                5 Active Issues
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Review and resolve account alerts and compliance issues</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Button */}
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter className="h-4 w-4" />
                            Filter by Type
                        </button>

                        {/* Resolve All Button */}
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1e5a8f] text-white rounded-xl text-sm font-bold hover:bg-[#164a7a] transition-colors shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Resolve All
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {summaryStats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Flagged Accounts Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Account
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Issue Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Detected
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {flaggedAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{account.accountName}</div>
                                            <div className="text-xs text-gray-500">{account.accountType}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {account.issueType}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${account.severityColor}`}>
                                            {account.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {account.detected}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {account.resolved && (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            )}
                                            <span className={`text-sm font-medium ${account.statusColor}`}>
                                                {account.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-right">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default FlaggedAccounts;
