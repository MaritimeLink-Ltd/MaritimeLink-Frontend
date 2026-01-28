import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Download, Activity as ActivityIcon, LifeBuoy, Server, Sliders, ChevronDown, User, Shield, Globe, XCircle, AlertTriangle, MessageSquare, Clock, CheckCircle, Users, AlertOctagon, ChevronLeft, ChevronRight, Layers, Database, Mail, FileText, PauseCircle, PlayCircle, Store, FileCheck } from 'lucide-react';

function Operations() {
    const [activeMainTab, setActiveMainTab] = useState('Support Cases');
    const [activeSubTab, setActiveSubTab] = useState('All Activity');
    const [activeSupportSubTab, setActiveSupportSubTab] = useState('Open');
    const [activeSystemJobSubTab, setActiveSystemJobSubTab] = useState('All');
    const [activeManualActionSubTab, setActiveManualActionSubTab] = useState('Accounts');
    const [timeFilter, setTimeFilter] = useState('Today');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const mainTabs = [
        { name: 'Activity', icon: ActivityIcon },
        { name: 'Support Cases', icon: LifeBuoy },
        { name: 'System Jobs', icon: Server },
        { name: 'Manual Actions', icon: Sliders }
    ];

    const subTabs = ['All Activity', 'User Actions', 'Admin Actions', 'System Actions', 'Security'];
    const supportSubTabs = [
        { name: 'All', count: null },
        { name: 'Open', count: 12 },
        { name: 'In Progress', count: null },
        { name: 'Waiting', count: null },
        { name: 'Resolved', count: null },
        { name: 'Closed', count: null }
    ];
    const systemJobSubTabs = ['All', 'Running', 'Completed', 'Failed', 'Queued', 'Paused'];
    const manualActionsSubTabs = [
        { name: 'Accounts', icon: Users },
        { name: 'Compliance', icon: FileCheck },
        { name: 'Support', icon: LifeBuoy },
        { name: 'Marketplace', icon: Store }
    ];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Activity Stats data
    const activityStats = [
        {
            value: '24,592',
            label: 'Total Activities',
            sublabel: 'Today',
            icon: ActivityIcon,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-purple-50'
        },
        {
            value: '842',
            label: 'Active Users',
            sublabel: 'Online now',
            sublabelColor: 'text-green-600',
            icon: Globe,
            iconColor: 'text-teal-500',
            iconBg: 'bg-teal-50',
            cardBg: 'bg-white'
        },
        {
            value: '142',
            label: 'Failed Actions',
            sublabel: 'Requires attention',
            sublabelColor: 'text-red-600',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        },
        {
            value: '5',
            label: 'Security Alerts',
            sublabel: '3 Unresolved',
            sublabelColor: 'text-orange-600',
            icon: Shield,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        }
    ];

    // Support Cases Stats data
    const supportStats = [
        {
            value: '12',
            label: 'Open Cases',
            sublabel: '+4 new today',
            icon: MessageSquare,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        },
        {
            value: '1h 42m',
            label: 'Avg Response',
            sublabel: '↓ 12% vs last week',
            sublabelColor: 'text-green-600',
            icon: Clock,
            iconColor: 'text-yellow-500',
            iconBg: 'bg-yellow-50',
            cardBg: 'bg-white'
        },
        {
            value: '28',
            label: 'Resolved Today',
            sublabel: 'Target: 30',
            icon: CheckCircle,
            iconColor: 'text-green-500',
            iconBg: 'bg-green-50',
            cardBg: 'bg-white'
        },
        {
            value: '94%',
            label: 'Satisfaction',
            sublabel: 'Based on feedback',
            icon: Users,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '3',
            label: 'Overdue',
            sublabel: '> 48h unanswered',
            sublabelColor: 'text-red-600',
            icon: AlertOctagon,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        }
    ];

    // Sample activity data
    const activityData = [
        {
            id: '1',
            timestamp: 'Oct 24\n10:42:15',
            actor: 'Sarah Jenkins',
            actorRole: 'Recruiter',
            actorIcon: User,
            action: 'Job Posted',
            actionDetail: 'Published new job listing "Chief',
            ipDevice: '192.168.1.42\nChrome / Windows',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '2',
            timestamp: 'Oct 24\n10:15:00',
            actor: 'Mike Ross',
            actorRole: 'Seafarer',
            actorIcon: User,
            action: 'Profile Update',
            actionDetail: 'Updated certifications and sea ser',
            ipDevice: '192.168.1.45\nSafari / iOS',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '3',
            timestamp: 'Oct 24\n10:30:55',
            actor: 'Admin User',
            actorRole: 'Super Admin',
            actorIcon: User,
            action: 'User Ban',
            actionDetail: 'Banned user "John Smith" for polic',
            ipDevice: '10.0.0.5\nFirefox / Mac',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '4',
            timestamp: 'Oct 24\n09:45:22',
            actor: 'Sarah Connor',
            actorRole: 'Compliance Officer',
            actorIcon: User,
            action: 'Document Verification',
            actionDetail: 'Manually verified "Captain License',
            ipDevice: '10.0.0.12\nChrome / Windows',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '5',
            timestamp: 'Oct 24\n10:38:22',
            actor: 'System Automation',
            actorRole: 'System',
            actorIcon: Server,
            action: 'Auto-Expiry',
            actionDetail: 'Expired 9 listings exceeding durati',
            ipDevice: 'Server\nBot',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '6',
            timestamp: 'Oct 24\n04:00:00',
            actor: 'Backup Service',
            actorRole: 'System',
            actorIcon: Server,
            action: 'Database Backup',
            actionDetail: 'Daily incremental backup complete',
            ipDevice: 'Server\nBot',
            status: 'Success',
            statusColor: 'text-green-600'
        },
        {
            id: '7',
            timestamp: 'Oct 24\n10:35:01',
            actor: 'Mark Weber',
            actorRole: 'Seafarer',
            actorIcon: AlertTriangle,
            action: 'Login Failed',
            actionDetail: 'Invalid password attempt (3rd retr-',
            ipDevice: '45.22.19.112\nSafari / iPhone',
            status: 'Warning',
            statusColor: 'text-orange-600'
        },
        {
            id: '8',
            timestamp: 'Oct 24\n10:15:12',
            actor: 'Unknown',
            actorRole: 'Guest',
            actorIcon: AlertTriangle,
            action: 'API Access',
            actionDetail: 'Unauthorized API access attempt i',
            ipDevice: '185.220.101.44\nCurl / Linux',
            status: 'Failed',
            statusColor: 'text-red-600'
        },
        {
            id: '9',
            timestamp: 'Oct 24\n08:20:11',
            actor: 'Bot Net',
            actorRole: 'Malicious',
            actorIcon: Shield,
            action: 'DDoS Attempt',
            actionDetail: 'High volume traffic detected from',
            ipDevice: 'Multiple\nBotnet',
            status: 'Failed',
            statusColor: 'text-red-600'
        }
    ];

    // Support Cases data
    const supportCasesData = [
        {
            id: '#SC-2436',
            user: 'Mark Bennett',
            userRole: 'Seafarer',
            issueType: 'Account Access Problem - Password',
            issueCategory: 'Account Access',
            priority: 'High',
            priorityColor: 'text-red-500',
            opened: '14 mins ago',
            assignedTo: 'James T.',
            status: 'Open',
            statusColor: 'text-blue-600'
        },
        {
            id: '#SC-2456',
            user: 'Seafarer LLC',
            userRole: 'Company',
            issueType: 'Document Upload Issue - Bulk CSV',
            issueCategory: 'Technical',
            priority: 'High',
            priorityColor: 'text-red-500',
            opened: '20 mins ago',
            assignedTo: 'Sarah M.',
            status: 'Open',
            statusColor: 'text-blue-600'
        },
        {
            id: '#SC-2438',
            user: 'BrightSail Ltd',
            userRole: 'Recruiter',
            issueType: 'Recruiter Complaint regarding',
            issueCategory: 'Dispute',
            priority: 'Medium',
            priorityColor: 'text-orange-500',
            opened: '30 mins ago',
            assignedTo: 'Admin',
            status: 'In Progress',
            statusColor: 'text-yellow-600'
        },
        {
            id: '#SC-2432',
            user: 'John Doe',
            userRole: 'Seafarer',
            issueType: 'How to update profile picture?',
            issueCategory: 'General',
            priority: 'Low',
            priorityColor: 'text-gray-500',
            opened: '2 hours ago',
            assignedTo: 'Bot',
            status: 'Resolved',
            statusColor: 'text-green-600'
        }
    ];

    // System Jobs Stats data
    const systemJobsStats = [
        {
            value: '124',
            label: 'Total Jobs',
            sublabel: 'Today',
            icon: Layers,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        },
        {
            value: '2',
            label: 'Running Now',
            sublabel: 'Healthy',
            sublabelColor: 'text-green-600',
            icon: RefreshCw,
            iconColor: 'text-green-500',
            iconBg: 'bg-green-50',
            cardBg: 'bg-white'
        },
        {
            value: '5',
            label: 'Failed Jobs',
            sublabel: '3 Retrying',
            sublabelColor: 'text-red-600',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        },
        {
            value: '96.2%',
            label: 'Success Rate',
            sublabel: 'Last 24h',
            icon: CheckCircle,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        },
        {
            value: '18',
            label: 'Queued',
            sublabel: 'Next: 2 mins',
            icon: Clock,
            iconColor: 'text-gray-500',
            iconBg: 'bg-gray-100',
            cardBg: 'bg-white'
        }
    ];

    // System Jobs Data
    const systemJobsData = [
        {
            id: 'JOB-9021',
            name: 'Daily Database Backup',
            icon: Database,
            status: 'Running',
            statusColor: 'text-blue-600',
            progress: 45,
            progressColor: 'bg-blue-600',
            timing: '10:00:00',
            duration: '-',
            stats: '14,050 items'
        },
        {
            id: 'JOB-9020',
            name: 'User Activation Emails Batch',
            icon: Mail,
            status: 'Completed',
            statusColor: 'text-green-600',
            progress: 100,
            progressColor: 'bg-green-600',
            timing: '09:30:00',
            duration: '5m 12s',
            stats: '142 items'
        },
        {
            id: 'JOB-9019',
            name: 'Compliance Document Sync',
            icon: Layers,
            status: 'Failed',
            statusColor: 'text-red-600',
            progress: 12,
            progressColor: 'bg-red-500',
            timing: '09:00:00',
            duration: '2m 45s',
            stats: '56 items',
            statsSub: '3 errors',
            statsSubColor: 'text-red-500'
        },
        {
            id: 'JOB-9018',
            name: 'Monthly Analytics Report',
            icon: FileText,
            status: 'Queued',
            statusColor: 'text-gray-600',
            progress: 0,
            progressColor: 'bg-gray-200',
            timing: 'Scheduled: 11:00:00',
            duration: '-',
            stats: '0 items'
        },
        {
            id: 'JOB-9017',
            name: 'Legacy Data Archival',
            icon: Database,
            status: 'Paused',
            statusColor: 'text-orange-500',
            progress: 78,
            progressColor: 'bg-orange-500',
            timing: '08:00:00',
            duration: '-',
            stats: '89,002 items'
        }
    ];

    // Manual Actions Data - Accounts
    const accountsData = [
        {
            id: 'MA-001',
            type: 'Password Reset',
            target: 'user_882910',
            initiatedBy: 'System Admin',
            reason: 'User request via support ticket',
            riskLevel: 'Low',
            riskColor: 'text-gray-600',
            status: 'Completed',
            statusColor: 'text-green-600'
        },
        {
            id: 'MA-002',
            type: 'Account Suspension',
            target: 'org_5521',
            initiatedBy: 'Compliance Officer',
            reason: 'Suspicious activity detected',
            riskLevel: 'High',
            riskColor: 'text-red-600',
            status: 'Pending',
            statusColor: 'text-orange-600'
        },
        {
            id: 'MA-003',
            type: 'Role Update',
            target: 'user_123456',
            initiatedBy: 'Manager',
            reason: 'Promotion to Team Lead',
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            status: 'In Progress',
            statusColor: 'text-blue-600'
        }
    ];

    // Manual Actions Data - Compliance
    const complianceData = [
        {
            id: 'CP-001',
            type: 'Document Verification',
            target: 'doc_99881',
            initiatedBy: 'Automated System',
            reason: 'Routine quarterly check',
            riskLevel: 'Low',
            riskColor: 'text-gray-600',
            status: 'Pending',
            statusColor: 'text-orange-600'
        },
        {
            id: 'CP-002',
            type: 'Risk Assessment',
            target: 'vendor_772',
            initiatedBy: 'Risk Team',
            reason: 'New vendor onboarding',
            riskLevel: 'High',
            riskColor: 'text-red-600',
            status: 'In Progress',
            statusColor: 'text-blue-600'
        }
    ];

    // Manual Actions Data - Support
    const supportData = [
        {
            id: 'SP-001',
            type: 'Ticket Escalation',
            target: 'ticket_5510',
            initiatedBy: 'L1 Support',
            reason: 'Complex technical issue',
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            status: 'Completed',
            statusColor: 'text-green-600'
        },
        {
            id: 'SP-002',
            type: 'Refund Process',
            target: 'trans_9910',
            initiatedBy: 'Billing Dept',
            reason: 'Service outage compensation',
            riskLevel: 'Medium',
            riskColor: 'text-orange-600',
            status: 'Approved',
            statusColor: 'text-green-600'
        }
    ];

    // Manual Actions Data - Marketplace
    const marketplaceData = [
        {
            id: 'MK-001',
            type: 'Listing Removal',
            target: 'list_1120',
            initiatedBy: 'Moderator',
            reason: 'Policy violation',
            riskLevel: 'Low',
            riskColor: 'text-gray-600',
            status: 'Completed',
            statusColor: 'text-green-600'
        },
        {
            id: 'MK-002',
            type: 'Feature Promo',
            target: 'promo_881',
            initiatedBy: 'Marketing',
            reason: 'Seasonal campaign',
            riskLevel: 'Low',
            riskColor: 'text-gray-600',
            status: 'Pending',
            statusColor: 'text-orange-600'
        }
    ];

    const currentManualActions = activeManualActionSubTab === 'Compliance' ? complianceData
        : activeManualActionSubTab === 'Support' ? supportData
            : activeManualActionSubTab === 'Marketplace' ? marketplaceData
                : accountsData;

    const stats = activeMainTab === 'Support Cases' ? supportStats : activeMainTab === 'System Jobs' ? systemJobsStats : activityStats;

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Operations</h1>
                        <p className="text-sm text-gray-500">Platform health, support cases, and system activity</p>
                    </div>

                    {/* Time Filter + Settings */}
                    <div className="flex items-center gap-2">
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
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                            <Sliders className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-3 mb-6">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveMainTab(tab.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeMainTab === tab.name
                                ? 'bg-[#003971] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards - Hidden for Manual Actions */}
            {activeMainTab !== 'Manual Actions' && (
                <div className={`flex-shrink-0 grid grid-cols-1 gap-4 mb-6 ${activeMainTab === 'Support Cases' || activeMainTab === 'System Jobs' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
                    {stats.map((stat, index) => (
                        <div key={index} className={`${stat.cardBg} rounded-xl border border-gray-100 p-5`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${stat.iconBg} flex-shrink-0`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-600 mb-1">
                                        {stat.label}
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                                    </div>
                                    <div className={`text-xs font-medium ${stat.sublabelColor || 'text-gray-500'}`}>
                                        {stat.sublabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sub Tabs - Different for Activity and Support Cases */}
            {activeMainTab === 'Activity' && (
                <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 pb-0 mb-4">
                    <div className="flex items-center gap-6">
                        {subTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveSubTab(tab)}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeSubTab === tab
                                    ? 'text-[#1e5a8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                                {activeSubTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Auto-refresh toggle */}
                    <div className="flex items-center gap-2 pb-3">
                        <span className="text-sm text-gray-600">Auto-refresh</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            )}

            {activeMainTab === 'Support Cases' && (
                <div className="flex-shrink-0 flex items-center border-b border-gray-200 pb-0 mb-4">
                    <div className="flex items-center gap-6">
                        {supportSubTabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveSupportSubTab(tab.name)}
                                className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${activeSupportSubTab === tab.name
                                    ? 'text-[#1e5a8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.name}
                                {tab.count && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeSupportSubTab === tab.name
                                        ? 'bg-[#1e5a8f] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                                {activeSupportSubTab === tab.name && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeMainTab === 'System Jobs' && (
                <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 pb-0 mb-4">
                    <div className="flex items-center gap-6">
                        {systemJobSubTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveSystemJobSubTab(tab)}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeSystemJobSubTab === tab
                                    ? 'text-[#1e5a8f]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                                {activeSystemJobSubTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Table Card - Scrollable */}
            {activeMainTab === 'Activity' && (
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Search and Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activity..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Priority
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Download className="h-4 w-4" />
                                    Export Log
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
                                        Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actor
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        IP / Device
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {activityData.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900 whitespace-pre-line">
                                                {record.timestamp}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <record.actorIcon className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{record.actor}</div>
                                                    <div className="text-xs text-gray-500">{record.actorRole}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{record.action}</div>
                                            <div className="text-xs text-gray-500">{record.actionDetail}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900 whitespace-pre-line">
                                                {record.ipDevice}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-sm font-semibold ${record.statusColor}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                to={`/admin/operations/activity/${record.id}`}
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
            )}

            {/* Support Cases Table */}
            {activeMainTab === 'Support Cases' && (
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Search and Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search cases..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Priority
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
                                        Case ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Issue Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Opened
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {supportCasesData.map((caseItem) => (
                                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {caseItem.id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{caseItem.user}</div>
                                                <div className="text-xs text-gray-500">{caseItem.userRole}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{caseItem.issueType}</div>
                                            <div className="text-xs text-gray-500">{caseItem.issueCategory}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-sm font-semibold ${caseItem.priorityColor}`}>
                                                {caseItem.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-600">
                                                {caseItem.opened}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900">
                                                {caseItem.assignedTo}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-sm font-semibold ${caseItem.statusColor}`}>
                                                {caseItem.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                to={`/admin/operations/case/${caseItem.id.replace('#', '')}`}
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
                            Showing <span className="font-semibold border border-gray-300 px-2 py-0.5 rounded">10</span> of <span className="font-semibold">12</span> entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button className="px-3 py-1.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-medium min-w-[36px]">
                                1
                            </button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[36px]">
                                2
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* System Jobs Table */}
            {activeMainTab === 'System Jobs' && (
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Search and Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Job ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Job Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Timing
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {systemJobsData.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-500">
                                                {job.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                    <job.icon className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{job.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${job.statusColor}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${job.progressColor}`}
                                                        style={{ width: `${job.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                                                    {job.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-gray-900">
                                                {job.timing}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {job.duration}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {job.stats}
                                            </div>
                                            {job.statsSub && (
                                                <div className={`text-xs ${job.statsSubColor}`}>
                                                    {job.statsSub}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                to={`/admin/operations/job/${job.id}`}
                                                className="text-sm font-medium text-[#1e5a8f] hover:underline"
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
                            Showing <span className="font-semibold border border-gray-300 px-2 py-0.5 rounded">10</span> of <span className="font-semibold">124</span> entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button className="px-3 py-1.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-medium min-w-[36px]">
                                1
                            </button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[36px]">
                                2
                            </button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[36px]">
                                3
                            </button>
                            <span className="px-2 text-gray-500">...</span>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[36px]">
                                12
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Actions Tab */}
            {activeMainTab === 'Manual Actions' && (
                <div className="flex-1 flex flex-col h-full">
                    {/* Sub Tabs */}
                    <div className="flex-shrink-0 flex items-center border-b border-gray-200 pb-0 mb-4">
                        <div className="flex items-center gap-6">
                            {manualActionsSubTabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveManualActionSubTab(tab.name)}
                                    className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${activeManualActionSubTab === tab.name
                                        ? 'text-[#1e5a8f]'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                    {activeManualActionSubTab === tab.name && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        {/* Search and Filters */}
                        <div className="flex-shrink-0 p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between gap-4">
                                {/* Search */}
                                <div className="relative flex-1 max-w-sm">
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
                                        Risk Level
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
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Action Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Target
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Initiated By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Risk Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {currentManualActions.map((action) => (
                                        <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {action.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                                                    {action.target}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {action.initiatedBy}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {action.reason}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${action.riskColor}`}>
                                                    {action.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${action.statusColor}`}>
                                                    {action.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link
                                                    to={`/admin/operations/manual-action/${action.id}`}
                                                    className="text-sm font-bold text-[#003971] hover:underline"
                                                >
                                                    Review
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
                                Showing <span className="font-semibold border border-gray-300 px-2 py-0.5 rounded">{currentManualActions.length}</span> results
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button className="px-3 py-1.5 bg-[#1e5a8f] text-white rounded-lg text-sm font-medium min-w-[36px]">
                                    1
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Operations;
