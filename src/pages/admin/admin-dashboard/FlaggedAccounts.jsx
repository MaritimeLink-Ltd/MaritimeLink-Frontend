import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Filter,
    CheckCircle,
    Shield,
    AlertTriangle,
    MoreVertical,
    Eye,
    X,
    XCircle,
    Clock,
    ChevronDown,
    User,
    Building,
    GraduationCap
} from 'lucide-react';

function FlaggedAccounts() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('30 Days');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Flagged Accounts Data with state
    const [flaggedAccounts, setFlaggedAccounts] = useState([
        {
            id: 1,
            accountName: 'OceanHire Agency',
            accountType: 'Recruiter',
            email: 'contact@oceanhire.com',
            phone: '+1 234 567 890',
            issueType: 'Domain Mismatch',
            issueDescription: 'The email domain does not match the company website domain provided during registration.',
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
            email: 'sarah.jenkins@email.com',
            phone: '+44 789 123 456',
            issueType: 'Blurry ID Document',
            issueDescription: 'The uploaded ID document is not clear enough for verification. The photo and text are not readable.',
            severity: 'MEDIUM',
            severityColor: 'text-orange-600 bg-orange-50',
            detected: '5h ago',
            status: 'Under Review',
            statusColor: 'text-blue-600'
        },
        {
            id: 3,
            accountName: 'Blue Wave Shipping',
            accountType: 'Recruiter',
            email: 'hr@bluewaveshipping.com',
            phone: '+1 555 987 654',
            issueType: 'Expired License',
            issueDescription: 'The company recruitment license has expired. New documentation is required.',
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
            email: 'john.doe@email.com',
            phone: '+1 444 555 666',
            issueType: 'Incomplete Profile',
            issueDescription: 'Required certification documents are missing from the profile.',
            severity: 'LOW',
            severityColor: 'text-blue-600 bg-blue-50',
            detected: '2d ago',
            status: 'Resolved',
            statusColor: 'text-green-600',
            resolved: true
        },
        {
            id: 5,
            accountName: 'Pacific Maritime Training',
            accountType: 'Training Provider',
            email: 'admin@pacificmaritime.com',
            phone: '+61 2 9876 5432',
            issueType: 'Verification Pending',
            issueDescription: 'Training center accreditation documents need verification.',
            severity: 'MEDIUM',
            severityColor: 'text-orange-600 bg-orange-50',
            detected: '3d ago',
            status: 'Pending',
            statusColor: 'text-gray-600'
        },
        {
            id: 6,
            accountName: 'Global Seafarer Academy',
            accountType: 'Training Provider',
            email: 'info@globalseafarer.edu',
            phone: '+65 6789 1234',
            issueType: 'Certificate Discrepancy',
            issueDescription: 'Mismatch between claimed certifications and verified records.',
            severity: 'CRITICAL',
            severityColor: 'text-red-600 bg-red-50',
            detected: '4h ago',
            status: 'Under Review',
            statusColor: 'text-blue-600'
        }
    ]);

    // Helper function to parse time strings and get days ago
    const getDaysAgo = (timeStr) => {
        const str = timeStr?.toLowerCase() || '';
        let daysAgo = 0;

        if (str.includes('min')) {
            daysAgo = 0;
        } else if (str.includes('h ago') || str.includes('hour')) {
            daysAgo = 0;
        } else if (str.includes('d ago') || str.includes('day')) {
            const match = str.match(/(\d+)/);
            daysAgo = match ? parseInt(match[1]) : 1;
        } else if (str.includes('week')) {
            const match = str.match(/(\d+)/);
            daysAgo = match ? parseInt(match[1]) * 7 : 7;
        }
        return daysAgo;
    };

    // Filter accounts based on active filters
    const filteredAccounts = flaggedAccounts.filter(account => {
        const typeMatch = activeFilter === 'all' || account.accountType === activeFilter;
        const severityMatch = severityFilter === 'all' || account.severity === severityFilter;

        // Time filter logic
        let timeMatch = true;
        if (timeFilter !== '30 Days') {
            const daysAgo = getDaysAgo(account.detected);
            if (timeFilter === 'Today') {
                timeMatch = daysAgo === 0;
            } else if (timeFilter === '7 Days') {
                timeMatch = daysAgo <= 7;
            }
        }

        return typeMatch && severityMatch && timeMatch;
    });

    // Account type icon helper
    const getAccountTypeIcon = (type) => {
        switch (type) {
            case 'Professional':
                return <User className="h-4 w-4" />;
            case 'Recruiter':
                return <Building className="h-4 w-4" />;
            case 'Training Provider':
                return <GraduationCap className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    // Handle review modal
    const openReviewModal = (account) => {
        setSelectedAccount(account);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedAccount(null);
    };

    // Handle status updates
    const updateAccountStatus = (accountId, newStatus, resolved = false) => {
        setFlaggedAccounts(prev => prev.map(account => {
            if (account.id === accountId) {
                let statusColor = 'text-gray-600';
                if (newStatus === 'Resolved') statusColor = 'text-green-600';
                if (newStatus === 'Rejected') statusColor = 'text-red-600';
                if (newStatus === 'Under Review') statusColor = 'text-blue-600';

                return {
                    ...account,
                    status: newStatus,
                    statusColor,
                    resolved: resolved
                };
            }
            return account;
        }));
        closeReviewModal();
    };

    // Filter options
    const filterOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'Professional', label: 'Professionals' },
        { value: 'Recruiter', label: 'Recruiters' },
        { value: 'Training Provider', label: 'Training Providers' }
    ];

    const severityOptions = [
        { value: 'all', label: 'All Severity' },
        { value: 'CRITICAL', label: 'Critical' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'LOW', label: 'Low' }
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
                                {flaggedAccounts.filter(a => !a.resolved).length} Active Issues
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">Review and resolve account alerts and compliance issues</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Time Filter */}
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
                        {/* Filter by Type Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                            >
                                <Filter className="h-4 w-4" />
                                {filterOptions.find(f => f.value === activeFilter)?.label}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Account Type</div>
                                    {filterOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setActiveFilter(option.value);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${activeFilter === option.value ? 'text-[#1e5a8f] font-semibold bg-blue-50' : 'text-gray-700'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase">Severity</div>
                                    {severityOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSeverityFilter(option.value);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${severityFilter === option.value ? 'text-[#1e5a8f] font-semibold bg-blue-50' : 'text-gray-700'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear Filters */}
                        {(activeFilter !== 'all' || severityFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setActiveFilter('all');
                                    setSeverityFilter('all');
                                }}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
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
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No accounts match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gray-100">
                                                    {getAccountTypeIcon(account.accountType)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{account.accountName}</div>
                                                    <div className="text-xs text-gray-500">{account.accountType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {account.issueType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${account.severityColor}`}>
                                                {account.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {account.detected}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {account.status === 'Resolved' && (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                )}
                                                {account.status === 'Rejected' && (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                                {account.status === 'Under Review' && (
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                )}
                                                <span className={`text-sm font-medium ${account.statusColor}`}>
                                                    {account.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {/* Eye Icon - Review Button */}
                                            <button
                                                onClick={() => openReviewModal(account)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-500 hover:text-[#1e5a8f]"
                                                title="Review Profile"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedAccount && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-xl">
                                    {getAccountTypeIcon(selectedAccount.accountType)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Review Account</h3>
                                    <p className="text-xs text-gray-500">{selectedAccount.accountType}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeReviewModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Account Info */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Account Name</p>
                                        <p className="text-sm font-bold text-gray-900">{selectedAccount.accountName}</p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${selectedAccount.severityColor}`}>
                                        {selectedAccount.severity}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                                        <p className="text-sm text-gray-800">{selectedAccount.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm text-gray-800">{selectedAccount.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Details */}
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800">{selectedAccount.issueType}</p>
                                        <p className="text-xs text-red-700 mt-1">{selectedAccount.issueDescription}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Current Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Current Status</p>
                                    <p className={`text-sm font-bold ${selectedAccount.statusColor}`}>{selectedAccount.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500">Detected</p>
                                    <p className="text-sm text-gray-800">{selectedAccount.detected}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Action Buttons */}
                        <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => updateAccountStatus(selectedAccount.id, 'Under Review')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                            >
                                <Clock className="h-4 w-4" />
                                Under Review
                            </button>
                            <button
                                onClick={() => updateAccountStatus(selectedAccount.id, 'Rejected', false)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                            >
                                <XCircle className="h-4 w-4" />
                                Reject
                            </button>
                            <button
                                onClick={() => updateAccountStatus(selectedAccount.id, 'Resolved', true)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Resolve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showFilterDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFilterDropdown(false)}
                />
            )}
        </div>
    );
}

export default FlaggedAccounts;
