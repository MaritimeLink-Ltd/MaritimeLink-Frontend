import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Download, Activity as ActivityIcon, LifeBuoy, Server, ChevronDown, User, Shield, Globe, XCircle, AlertTriangle, MessageSquare, Clock, CheckCircle, Users, AlertOctagon, ChevronLeft, ChevronRight, Layers, Database, Mail, FileText, PauseCircle, PlayCircle, Store, FileCheck } from 'lucide-react';
import adminOperationsService from '../../../services/adminOperationsService';

const formatShortDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    return `${datePart}\n${timePart}`;
};

const getInitials = (name) => {
    if (!name) return 'S';
    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'S';
};

const statusClassMap = {
    SUCCESS: 'text-green-600',
    WARNING: 'text-orange-600',
    FAILED: 'text-red-600',
};

const statusBadgeClassMap = {
    SUCCESS: 'bg-green-50 text-green-700 border border-green-100',
    WARNING: 'bg-orange-50 text-orange-700 border border-orange-100',
    FAILED: 'bg-red-50 text-red-700 border border-red-100',
};

const mapActivityLog = (log) => {
    const actor = log?.actor || {};
    const meta = log?.meta || {};

    return {
        id: log?.id,
        timestamp: formatShortDateTime(log?.timestamp),
        timestampRaw: log?.timestamp,
        actor: actor?.name || 'Unknown',
        actorRole: actor?.role || actor?.actorType || 'Unknown',
        actorAvatar: actor?.avatar || '',
        action: log?.event || log?.action || 'Activity',
        actionDetail: log?.description || 'No description available',
        ipDevice: `${meta?.ip || 'Unknown'}\n${meta?.device || 'Unknown'}`,
        status: log?.status || 'SUCCESS',
        statusColor: statusClassMap[String(log?.status || 'SUCCESS').toUpperCase()] || 'text-gray-600',
    };
};

const normalizeActivityStats = (stats = {}) => [
    {
        value: Number.isFinite(Number(stats.activitiesToday)) ? Number(stats.activitiesToday).toLocaleString('en-US') : '0',
        label: 'Total Activities',
        sublabel: 'Today',
        icon: ActivityIcon,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50',
        cardBg: 'bg-purple-50',
    },
    {
        value: Number.isFinite(Number(stats.activeUsers)) ? Number(stats.activeUsers).toLocaleString('en-US') : '0',
        label: 'Active Users',
        sublabel: 'Online now',
        sublabelColor: 'text-green-600',
        icon: Globe,
        iconColor: 'text-teal-500',
        iconBg: 'bg-teal-50',
        cardBg: 'bg-white',
    },
    {
        value: Number.isFinite(Number(stats.failedActions)) ? Number(stats.failedActions).toLocaleString('en-US') : '0',
        label: 'Failed Actions',
        sublabel: 'Requires attention',
        sublabelColor: 'text-red-600',
        icon: XCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        cardBg: 'bg-white',
    },
    {
        value: Number.isFinite(Number(stats.securityAlerts)) ? Number(stats.securityAlerts).toLocaleString('en-US') : '0',
        label: 'Security Alerts',
        sublabel: 'Needs review',
        sublabelColor: 'text-orange-600',
        icon: Shield,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50',
        cardBg: 'bg-white',
    },
];

function Operations() {
    const [activeMainTab, setActiveMainTab] = useState('Activity');
    const [activeSubTab, setActiveSubTab] = useState('All Activity');
    const [activeSupportSubTab, setActiveSupportSubTab] = useState('Open');
    const [activeSystemJobSubTab, setActiveSystemJobSubTab] = useState('All');
    const [activeManualActionSubTab, setActiveManualActionSubTab] = useState('Accounts');
    const [timeFilter, setTimeFilter] = useState('Today');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activityStats, setActivityStats] = useState(normalizeActivityStats());
    const [activityData, setActivityData] = useState([]);
    const [activityError, setActivityError] = useState('');

    // New State for Search, Filter, Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // For generic status filtering
    const [filterPriority, setFilterPriority] = useState('All'); // For Support Cases
    const [filterRisk, setFilterRisk] = useState('All'); // For Manual Actions
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const mainTabs = [
        { name: 'Activity', icon: ActivityIcon },
        { name: 'Support Cases', icon: LifeBuoy },
        // { name: 'System Jobs', icon: Server },
        // { name: 'Manual Actions', icon: Sliders }
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

    // Support Cases Stats data
    const supportStats = [
        { value: '12', label: 'Open Cases', sublabel: '+4 new today', icon: MessageSquare, iconColor: 'text-blue-500', iconBg: 'bg-blue-50', cardBg: 'bg-white' },
        { value: '1h 42m', label: 'Avg Response', sublabel: '↓ 12% vs last week', sublabelColor: 'text-green-600', icon: Clock, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50', cardBg: 'bg-white' },
        { value: '28', label: 'Resolved Today', sublabel: 'Target: 30', icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50', cardBg: 'bg-white' },
        { value: '94%', label: 'Satisfaction', sublabel: 'Based on feedback', icon: Users, iconColor: 'text-orange-500', iconBg: 'bg-orange-50', cardBg: 'bg-white' },
        { value: '3', label: 'Overdue', sublabel: '> 48h unanswered', sublabelColor: 'text-red-600', icon: AlertOctagon, iconColor: 'text-red-500', iconBg: 'bg-red-50', cardBg: 'bg-white' }
    ];

    // Support Cases data
    const supportCasesData = [
        { id: '#SC-2436', user: 'Mark Bennett', userRole: 'Seafarer', issueType: 'Account Access Problem - Password', issueCategory: 'Account Access', priority: 'High', priorityColor: 'text-red-500', opened: '14 mins ago', assignedTo: 'James T.', status: 'Open', statusColor: 'text-blue-600' },
        { id: '#SC-2456', user: 'Seafarer LLC', userRole: 'Company', issueType: 'Document Upload Issue - Bulk CSV', issueCategory: 'Technical', priority: 'High', priorityColor: 'text-red-500', opened: '20 mins ago', assignedTo: 'Sarah M.', status: 'Open', statusColor: 'text-blue-600' },
        { id: '#SC-2438', user: 'BrightSail Ltd', userRole: 'Recruiter', issueType: 'Recruiter Complaint regarding', issueCategory: 'Dispute', priority: 'Medium', priorityColor: 'text-orange-500', opened: '30 mins ago', assignedTo: 'Admin', status: 'In Progress', statusColor: 'text-yellow-600' },
        { id: '#SC-2432', user: 'John Doe', userRole: 'Seafarer', issueType: 'How to update profile picture?', issueCategory: 'General', priority: 'Low', priorityColor: 'text-gray-500', opened: '2 hours ago', assignedTo: 'Bot', status: 'Resolved', statusColor: 'text-green-600' },
        { id: '#SC-2420', user: 'Emily White', userRole: 'Seafarer', issueType: 'Payment not reflecting', issueCategory: 'Billing', priority: 'High', priorityColor: 'text-red-500', opened: '5 hours ago', assignedTo: 'Finance', status: 'Waiting', statusColor: 'text-orange-600' },
        { id: '#SC-2415', user: 'Global Ship Co', userRole: 'Company', issueType: 'API Integration Access', issueCategory: 'Technical', priority: 'Medium', priorityColor: 'text-orange-500', opened: '1 day ago', assignedTo: 'Dev Team', status: 'Waiting', statusColor: 'text-orange-600' },
        { id: '#SC-2401', user: 'Alex Brown', userRole: 'Seafarer', issueType: 'Login Attempt Issue', issueCategory: 'Security', priority: 'High', priorityColor: 'text-red-500', opened: '2 days ago', assignedTo: 'Security', status: 'Closed', statusColor: 'text-gray-500' },
        { id: '#SC-2398', user: 'Sea Connect', userRole: 'Recruiter', issueType: 'Subscription Upgrade', issueCategory: 'Billing', priority: 'Low', priorityColor: 'text-gray-500', opened: '3 days ago', assignedTo: 'Sales', status: 'Closed', statusColor: 'text-gray-500' }
    ];

    // System Jobs Stats data
    const systemJobsStats = [
        { value: '124', label: 'Total Jobs', sublabel: 'Today', icon: Layers, iconColor: 'text-blue-500', iconBg: 'bg-blue-50', cardBg: 'bg-white' },
        { value: '2', label: 'Running Now', sublabel: 'Healthy', sublabelColor: 'text-green-600', icon: RefreshCw, iconColor: 'text-green-500', iconBg: 'bg-green-50', cardBg: 'bg-white' },
        { value: '5', label: 'Failed Jobs', sublabel: '3 Retrying', sublabelColor: 'text-red-600', icon: XCircle, iconColor: 'text-red-500', iconBg: 'bg-red-50', cardBg: 'bg-white' },
        { value: '96.2%', label: 'Success Rate', sublabel: 'Last 24h', icon: CheckCircle, iconColor: 'text-[#003971]', iconBg: 'bg-blue-50', cardBg: 'bg-white' },
        { value: '18', label: 'Queued', sublabel: 'Next: 2 mins', icon: Clock, iconColor: 'text-gray-500', iconBg: 'bg-gray-100', cardBg: 'bg-white' }
    ];

    // System Jobs Data
    const systemJobsData = [
        { id: 'JOB-9021', name: 'Daily Database Backup', icon: Database, status: 'Running', statusColor: 'text-blue-600', progress: 45, progressColor: 'bg-blue-600', timing: '10:00:00', duration: '-', stats: '14,050 items' },
        { id: 'JOB-9020', name: 'User Activation Emails Batch', icon: Mail, status: 'Completed', statusColor: 'text-green-600', progress: 100, progressColor: 'bg-green-600', timing: '09:30:00', duration: '5m 12s', stats: '142 items' },
        { id: 'JOB-9019', name: 'Compliance Document Sync', icon: Layers, status: 'Failed', statusColor: 'text-red-600', progress: 12, progressColor: 'bg-red-500', timing: '09:00:00', duration: '2m 45s', stats: '56 items', statsSub: '3 errors', statsSubColor: 'text-red-500' },
        { id: 'JOB-9018', name: 'Monthly Analytics Report', icon: FileText, status: 'Queued', statusColor: 'text-gray-600', progress: 0, progressColor: 'bg-gray-200', timing: 'Scheduled: 11:00:00', duration: '-', stats: '0 items' },
        { id: 'JOB-9017', name: 'Legacy Data Archival', icon: Database, status: 'Paused', statusColor: 'text-orange-500', progress: 78, progressColor: 'bg-orange-500', timing: '08:00:00', duration: '-', stats: '89,002 items' }
    ];

    // Manual Actions Data
    const accountsData = [
        { id: 'MA-001', type: 'Password Reset', target: 'user_882910', initiatedBy: 'System Admin', reason: 'User request via support ticket', riskLevel: 'Low', riskColor: 'text-gray-600', status: 'Completed', statusColor: 'text-green-600' },
        { id: 'MA-002', type: 'Account Suspension', target: 'org_5521', initiatedBy: 'Compliance Officer', reason: 'Suspicious activity detected', riskLevel: 'High', riskColor: 'text-red-600', status: 'Pending', statusColor: 'text-orange-600' },
        { id: 'MA-003', type: 'Role Update', target: 'user_123456', initiatedBy: 'Manager', reason: 'Promotion to Team Lead', riskLevel: 'Medium', riskColor: 'text-orange-600', status: 'In Progress', statusColor: 'text-blue-600' }
    ];

    const complianceData = [
        { id: 'CP-001', type: 'Document Verification', target: 'doc_99881', initiatedBy: 'Automated System', reason: 'Routine quarterly check', riskLevel: 'Low', riskColor: 'text-gray-600', status: 'Pending', statusColor: 'text-orange-600' },
        { id: 'CP-002', type: 'Risk Assessment', target: 'vendor_772', initiatedBy: 'Risk Team', reason: 'New vendor onboarding', riskLevel: 'High', riskColor: 'text-red-600', status: 'In Progress', statusColor: 'text-blue-600' }
    ];

    const supportData = [
        { id: 'SP-001', type: 'Ticket Escalation', target: 'ticket_5510', initiatedBy: 'L1 Support', reason: 'Complex technical issue', riskLevel: 'Medium', riskColor: 'text-orange-600', status: 'Completed', statusColor: 'text-green-600' },
        { id: 'SP-002', type: 'Refund Process', target: 'trans_9910', initiatedBy: 'Billing Dept', reason: 'Service outage compensation', riskLevel: 'Medium', riskColor: 'text-orange-600', status: 'Approved', statusColor: 'text-green-600' }
    ];

    const marketplaceData = [
        { id: 'MK-001', type: 'Listing Removal', target: 'list_1120', initiatedBy: 'Moderator', reason: 'Policy violation', riskLevel: 'Low', riskColor: 'text-gray-600', status: 'Completed', statusColor: 'text-green-600' },
        { id: 'MK-002', type: 'Feature Promo', target: 'promo_881', initiatedBy: 'Marketing', reason: 'Seasonal campaign', riskLevel: 'Low', riskColor: 'text-gray-600', status: 'Pending', statusColor: 'text-orange-600' }
    ];

    // --- LOGIC ---

    // Reset filters when main tab changes
    const handleTabChange = (newTab) => {
        setActiveMainTab(newTab);
        setSearchQuery('');
        setFilterStatus('All');
        setFilterPriority('All');
        setFilterRisk('All');
        setCurrentPage(1);

        // Reset subtabs
        if (newTab === 'Activity') setActiveSubTab('All Activity');
        if (newTab === 'Support Cases') setActiveSupportSubTab('Open');
        if (newTab === 'System Jobs') setActiveSystemJobSubTab('All');
        if (newTab === 'Manual Actions') setActiveManualActionSubTab('Accounts');
    };

    const loadActivityFeed = async () => {
        setIsRefreshing(true);
        setActivityError('');

        try {
            const [activityResponse, statsResponse] = await Promise.all([
                adminOperationsService.getActivityLogs({ page: 1, limit: 200 }),
                adminOperationsService.getSystemStats(),
            ]);

            const logs = activityResponse?.data?.logs || [];
            setActivityData(logs.map(mapActivityLog));
            setActivityStats(normalizeActivityStats(statsResponse?.data || {}));
        } catch (error) {
            console.error('Failed to load activity feed:', error);
            setActivityData([]);
            setActivityError(error?.message || 'Failed to load activity feed');
            setActivityStats(normalizeActivityStats());
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (activeMainTab === 'Activity') {
            void loadActivityFeed();
        }
    }, [activeMainTab]);

    useEffect(() => {
        if (!autoRefresh || activeMainTab !== 'Activity') {
            return undefined;
        }

        const timer = setInterval(() => {
            void loadActivityFeed();
        }, 30000);

        return () => clearInterval(timer);
    }, [autoRefresh, activeMainTab]);

    // Helper function to parse time strings and get days ago
    const getDaysAgo = (timeStr) => {
        const str = timeStr?.toLowerCase() || '';
        let daysAgo = 0;

        const parsedDate = new Date(timeStr);
        if (!Number.isNaN(parsedDate.getTime())) {
            const diffMs = Date.now() - parsedDate.getTime();
            if (diffMs <= 0) return 0;
            return Math.floor(diffMs / (24 * 60 * 60 * 1000));
        }

        if (str.includes('min')) {
            daysAgo = 0;
        } else if (str.includes('hour')) {
            daysAgo = 0;
        } else if (str.includes('day')) {
            const match = str.match(/(\d+)/);
            daysAgo = match ? parseInt(match[1]) : 1;
        } else if (str.includes('week')) {
            const match = str.match(/(\d+)/);
            daysAgo = match ? parseInt(match[1]) * 7 : 7;
        } else if (str.includes('oct 24') || str.includes('today')) {
            daysAgo = 0;
        } else if (str.includes('oct 23') || str.includes('yesterday')) {
            daysAgo = 1;
        }
        return daysAgo;
    };

    // Check if item matches time filter
    const matchesTimeFilter = (item) => {
        if (timeFilter === '30 Days') return true;

        // For Activity - use timestamp
        const timeField = item.timestampRaw || item.timestamp || item.opened || '';
        const daysAgo = getDaysAgo(timeField);

        if (timeFilter === 'Today') {
            return daysAgo === 0;
        } else if (timeFilter === '7 Days') {
            return daysAgo <= 7;
        }
        return true;
    };

    // Helper functions for data filtering
    const getFilteredData = () => {
        let data = [];

        if (activeMainTab === 'Activity') {
            data = activityData.filter(item => {
                const matchesSearch = item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.ipDevice.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesFilter = filterStatus === 'All' || item.status === filterStatus;

                const matchesTime = matchesTimeFilter(item);

                // Subtab Filtering Logic
                let matchesSubTab = true;
                if (activeSubTab === 'User Actions') {
                    matchesSubTab = ['Recruiter', 'Recruitment Agent', 'Training Agent', 'Professional', 'Seafarer', 'User', 'Guest'].includes(item.actorRole);
                } else if (activeSubTab === 'Admin Actions') {
                    matchesSubTab = ['Admin', 'Super Admin', 'Moderator', 'Compliance Officer', 'Compliance', 'Manager'].includes(item.actorRole);
                } else if (activeSubTab === 'System Actions') {
                    matchesSubTab = ['System'].includes(item.actorRole);
                } else if (activeSubTab === 'Security') {
                    matchesSubTab = ['Malicious'].includes(item.actorRole) ||
                        item.action.includes('Ban') ||
                        item.action.includes('Failed') ||
                        item.action.includes('Unauthorized') ||
                        item.action.includes('DDoS') ||
                        item.action.includes('Injection');
                }

                return matchesSearch && matchesFilter && matchesSubTab && matchesTime;
            });
        } else if (activeMainTab === 'Support Cases') {
            data = supportCasesData.filter(item => {
                const matchesSearch = item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.id.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
                // Filter by subtab (Status)
                const matchesStatus = activeSupportSubTab === 'All' || item.status === activeSupportSubTab || (activeSupportSubTab === 'Open' && item.status === 'Open');
                const matchesTime = matchesTimeFilter(item);

                return matchesSearch && matchesPriority && matchesStatus && matchesTime;
            });
        } else if (activeMainTab === 'System Jobs') {
            data = systemJobsData.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.id.toLowerCase().includes(searchQuery.toLowerCase());
                // Filter by subtab (Status)
                const matchesStatus = activeSystemJobSubTab === 'All' || item.status === activeSystemJobSubTab;
                return matchesSearch && matchesStatus;
            });
        } else if (activeMainTab === 'Manual Actions') {
            const rawData = activeManualActionSubTab === 'Compliance' ? complianceData
                : activeManualActionSubTab === 'Support' ? supportData
                    : activeManualActionSubTab === 'Marketplace' ? marketplaceData
                        : accountsData;

            data = rawData.filter(item => {
                const matchesSearch = item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.type.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesRisk = filterRisk === 'All' || item.riskLevel === filterRisk;
                const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
                return matchesSearch && matchesRisk && matchesStatus;
            });
        }

        return data;
    };

    const displayData = getFilteredData();
    const totalItems = displayData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleRefresh = () => {
        if (activeMainTab === 'Activity') {
            void loadActivityFeed();
            setSearchQuery('');
            setFilterStatus('All');
            setCurrentPage(1);
            setActiveSubTab('All Activity');
            return;
        }

        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);

        // Reset all filters
        setSearchQuery('');
        setFilterStatus('All');
        setFilterPriority('All');
        setFilterRisk('All');
        setCurrentPage(1);

        // Reset Logic dependent on active tab
        if (activeMainTab === 'Support Cases') setActiveSupportSubTab('Open');
        if (activeMainTab === 'System Jobs') setActiveSystemJobSubTab('All');
        if (activeMainTab === 'Manual Actions') setActiveManualActionSubTab('Accounts');
    };

    const handleExport = () => {
        // Simple CSV Export Logic
        if (!displayData.length) return;

        const headers = Object.keys(displayData[0]).join(',');
        const csvContent = "data:text/csv;charset=utf-8," +
            headers + "\n" +
            displayData.map(e => Object.values(e).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeMainTab.replace(' ', '_')}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = activeMainTab === 'Support Cases' ? supportStats : activeMainTab === 'System Jobs' ? systemJobsStats : activityStats;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-6">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Operations</h1>
                        <p className="text-sm text-gray-500">Platform health, support cases, and system activity</p>
                    </div>

                    {/* Time Filter */}
                    <div className="bg-gray-50 p-1 rounded-xl inline-flex border border-gray-100">
                        {timeFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setTimeFilter(filter);
                                    setCurrentPage(1);
                                }}
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

                {/* Main Tabs */}
                <div className="flex items-center gap-3 mb-6">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => handleTabChange(tab.name)}
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
                    {/* Search and Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activity..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Success">Success</option>
                                        <option value="Warning">Warning</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Download className="h-4 w-4" />
                                    Export Log
                                </button>
                            </div>
                        </div>
                        {activityError && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {activityError}
                            </div>
                        )}
                    </div>

                    {/* Table - Scrollable Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
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
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900 whitespace-pre-line">
                                                    {record.timestamp}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {record.actorAvatar ? (
                                                        <img
                                                            src={record.actorAvatar}
                                                            alt={record.actor}
                                                            className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-[#1e5a8f] text-white flex items-center justify-center text-xs font-semibold">
                                                            {getInitials(record.actor)}
                                                        </div>
                                                    )}
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
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusBadgeClassMap[String(record.status || '').toUpperCase()] || 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            No activities found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &larr;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === page
                                        ? 'bg-[#1e5a8f] text-white'
                                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Support Cases Table */}
            {activeMainTab === 'Support Cases' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col mb-6">
                    {/* Search and Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search cases..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20"
                                    >
                                        <option value="All">All Priority</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleExport}
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
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((caseItem) => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                            No support cases found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${currentPage === page
                                        ? 'bg-[#1e5a8f] text-white'
                                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleExport}
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
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((job) => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No system jobs found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${currentPage === page
                                        ? 'bg-[#1e5a8f] text-white'
                                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
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
                                    onClick={() => {
                                        setActiveManualActionSubTab(tab.name);
                                        setCurrentPage(1); // Reset page on subtab change
                                    }}
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
                                        placeholder="Search actions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20"
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={filterRisk}
                                            onChange={(e) => setFilterRisk(e.target.value)}
                                            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20"
                                        >
                                            <option value="All">All Risk</option>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={handleRefresh}
                                        className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleExport}
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
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((action) => (
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No manual actions found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${currentPage === page
                                            ? 'bg-[#1e5a8f] text-white'
                                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
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
