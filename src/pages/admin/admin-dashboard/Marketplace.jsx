import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Briefcase, GraduationCap, CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, Clock, Eye, FileEdit, PauseCircle, Upload, Plus } from 'lucide-react';

function Marketplace() {
    const [activeMainTab, setActiveMainTab] = useState('Oversight');
    const [activeSubTab, setActiveSubTab] = useState('Jobs');
    const [timeFilter, setTimeFilter] = useState('30 Days');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Status');
    const [riskFilter, setRiskFilter] = useState('Risk Level');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportNotification, setShowExportNotification] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Updated to 10 per page

    // Dropdown Visibility State
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showRiskDropdown, setShowRiskDropdown] = useState(false);
    const fileInputRef = useRef(null);

    // Bulk Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const navigate = useNavigate();

    // Handlers
    const handleCreateNew = () => {
        if (activeSubTab === 'Jobs') {
            navigate('/admin/marketplace/create-job', {
                state: {
                    dashboardType: 'admin',
                    returnPath: '/admin/marketplace'
                }
            });
        } else {
            navigate('/admin/create-course');
        }
    };

    const handleBulkUploadClick = () => {
        setShowUploadModal(true);
        setUploadFile(null);
        setUploadComplete(false);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadSubmit = () => {
        if (!uploadFile) return;

        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);
            // Close modal after brief success message
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadComplete(false);
                setUploadFile(null);
            }, 2000);
        }, 1500);
    };

    const handleBulkUploadFile = (event) => {
        // Kept for backward compatibility if needed, but handleFileSelect is preferred
        handleFileSelect(event);
    };

    const mainTabs = ['Oversight', 'MaritimeLink Listings'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Filter Options
    const statusOptions = ['All', 'Active', 'Draft', 'Paused', 'Flagged'];
    const riskOptions = ['All', 'High', 'Medium', 'Low'];

    // Refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        // Reset filters
        setSearchQuery('');
        setStatusFilter('Status');
        setRiskFilter('Risk Level');
        setCurrentPage(1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    // Export CSV handler
    const handleExportCSV = () => {
        const currentData = getCurrentData();
        const headers = isMaritimeLinkTab
            ? (activeSubTab === 'Jobs'
                ? ['ID', 'Job Title', 'Type', 'Location', 'Status', 'Applications', 'Views', 'Posted']
                : ['ID', 'Course Name', 'Type', 'Location', 'Status', 'Bookings', 'Views', 'Posted'])
            : (activeSubTab === 'Jobs'
                ? ['ID', 'Recruiter/Company', 'Total Live Jobs', 'Jobs Posted', 'Total Applications', 'Flagged Jobs', 'Risk Level']
                : ['ID', 'Course Name', 'Type', 'Company/Provider', 'Status', 'Bookings', 'Posted']);

        const csvRows = [headers.join(',')];

        currentData.forEach(record => {
            let row;
            if (isMaritimeLinkTab) {
                if (activeSubTab === 'Jobs') {
                    row = [
                        record.id,
                        `"${record.jobTitle}"`,
                        `"${record.type}"`,
                        `"${record.location}"`,
                        record.status,
                        record.applications,
                        record.views,
                        `"${record.posted}"`
                    ];
                } else {
                    row = [
                        record.id,
                        `"${record.courseName}"`,
                        `"${record.type}"`,
                        `"${record.location}"`,
                        record.status,
                        record.bookings,
                        record.views,
                        `"${record.posted}"`
                    ];
                }
            } else {
                if (activeSubTab === 'Jobs') {
                    row = [
                        record.id,
                        `"${record.recruiterName}"`,
                        record.totalLiveJobs,
                        record.jobsPosted,
                        record.totalApplications,
                        record.flaggedJobs,
                        record.riskLevel
                    ];
                } else {
                    row = [
                        record.id,
                        `"${record.courseName}"`,
                        `"${record.type}"`,
                        `"${record.company}"`,
                        record.status,
                        record.bookings,
                        `"${record.posted}"`
                    ];
                }
            }
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `marketplace_${activeMainTab.toLowerCase()}_${activeSubTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    // Oversight - Jobs Stats
    const oversightJobsStats = [
        {
            value: '256',
            label: 'Live Jobs',
            sublabel: '+11 today',
            icon: Briefcase,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '1,203',
            label: 'Total Applications',
            sublabel: '+148 today',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: '19',
            label: 'Flagged Jobs',
            sublabel: 'Action required',
            sublabelColor: 'text-red-600',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '5',
            label: 'Removed Jobs',
            sublabel: 'Violations',
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
            cardBg: 'bg-white'
        }
    ];

    // Oversight - Training Stats
    const oversightTrainingStats = [
        {
            value: '85',
            label: 'Active Courses',
            sublabel: '+3 today',
            icon: GraduationCap,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '421',
            label: 'Total Bookings',
            sublabel: '+12 today',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: '3',
            label: 'Flagged Listings',
            sublabel: 'Action required',
            sublabelColor: 'text-red-600',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '12',
            label: 'Upcoming Sessions',
            sublabel: 'Next 7 days',
            icon: Clock,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        }
    ];

    // MaritimeLink - Jobs Stats
    const maritimeLinkJobsStats = [
        {
            value: '18',
            label: 'Active Listings',
            sublabel: '+2 today',
            icon: Briefcase,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '4',
            label: 'Drafts',
            sublabel: 'Pending publish',
            sublabelColor: 'text-gray-600',
            icon: FileEdit,
            iconColor: 'text-gray-500',
            iconBg: 'bg-gray-50',
            cardBg: 'bg-white'
        },
        {
            value: '5',
            label: 'Paused',
            sublabel: 'Inactive',
            sublabelColor: 'text-orange-600',
            icon: PauseCircle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '176',
            label: 'Views Today',
            sublabel: 'Across all listings',
            sublabelColor: 'text-gray-600',
            icon: Eye,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        }
    ];

    // MaritimeLink - Training Stats
    const maritimeLinkTrainingStats = [
        {
            value: '12',
            label: 'Active Listings',
            sublabel: '+3 today',
            icon: GraduationCap,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-blue-50'
        },
        {
            value: '156',
            label: 'Total Bookings',
            sublabel: '+2 today',
            icon: CheckCircle,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50',
            cardBg: 'bg-white'
        },
        {
            value: '0',
            label: 'Flagged Listings',
            sublabel: 'All clear',
            sublabelColor: 'text-gray-600',
            icon: AlertTriangle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            cardBg: 'bg-white'
        },
        {
            value: '4',
            label: 'Upcoming Sessions',
            sublabel: 'Next 7 days',
            icon: Clock,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50',
            cardBg: 'bg-white'
        }
    ];

    // Oversight Jobs Data
    const oversightJobsData = [
        {
            id: '1',
            recruiterName: 'OceanhHire Agency',
            recruiterSubtext: 'David Turner',
            totalLiveJobs: 12,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 2,
            riskLevel: 'Medium',
            riskColor: 'text-orange-600'
        },
        {
            id: '2',
            recruiterName: 'Worldwide Crew Now',
            recruiterSubtext: 'Sarah Müller',
            totalLiveJobs: 11,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 1,
            riskLevel: 'Low',
            riskColor: 'text-green-600'
        },
        {
            id: '3',
            recruiterName: 'BlueWave Crewing',
            recruiterSubtext: 'James Wilson',
            totalLiveJobs: 11,
            jobsPosted: 3,
            totalApplications: 148,
            flaggedJobs: 2,
            riskLevel: 'Low',
            riskColor: 'text-green-600'
        }
    ];

    // Oversight Training Data - Generated Dummy Data
    const generateTrainingData = () => {
        const baseData = [
            {
                id: '1',
                courseName: 'Basic Safety Training (BST)',
                courseProvider: 'by SeamanShip',
                type: 'STCW',
                typeColor: 'text-blue-600',
                company: 'SeamanShip',
                status: 'Active',
                statusColor: 'text-green-600',
                bookings: 24,
                posted: '1 month ago',
                riskLevel: 'Low',
                riskColor: 'text-green-600'
            },
            {
                id: '2',
                courseName: 'Advanced Fire Fighting',
                courseProvider: 'by Global Marine',
                type: 'SAFETY',
                typeColor: 'text-blue-600',
                company: 'Global Marine',
                status: 'Flagged',
                statusColor: 'text-red-600',
                bookings: 12,
                posted: '2 weeks ago',
                riskLevel: 'High',
                riskColor: 'text-red-600'
            }
        ];

        const courseTypes = ['STCW', 'SAFETY', 'REFRESHER', 'TECHNICAL', 'MEDICAL'];
        const companies = ['Maersk Training', 'V.Ships', 'Anglo-Eastern', 'Wilhelmsen', 'Bernhard Schulte', 'Columbia Shipmanagement'];
        const statuses = ['Active', 'Flagged', 'Draft', 'Paused'];
        const riskLevels = ['Low', 'Medium', 'High'];

        const dummyData = Array.from({ length: 122 }, (_, i) => {
            const type = courseTypes[Math.floor(Math.random() * courseTypes.length)];
            const company = companies[Math.floor(Math.random() * companies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];

            let statusColor = 'text-gray-600';
            if (status === 'Active') statusColor = 'text-green-600';
            if (status === 'Flagged') statusColor = 'text-red-600';
            if (status === 'Draft') statusColor = 'text-gray-400';
            if (status === 'Paused') statusColor = 'text-orange-600';

            let riskColor = 'text-green-600';
            if (risk === 'Medium') riskColor = 'text-orange-600';
            if (risk === 'High') riskColor = 'text-red-600';

            // Generate realistic posted times including "Today"
            const daysAgo = Math.floor(Math.random() * 30); // 0 to 29
            let postedTime;
            if (daysAgo === 0) {
                const hoursAgo = Math.floor(Math.random() * 23) + 1;
                postedTime = `${hoursAgo} hours ago`; // Counts as 'Today'
            } else if (daysAgo === 1) {
                postedTime = 'Yesterday';
            } else {
                postedTime = `${daysAgo} days ago`;
            }

            return {
                id: (i + 3).toString(),
                courseName: `${type} Course ${i + 1}`,
                courseProvider: `by ${company}`,
                type: type,
                typeColor: 'text-blue-600',
                company: company,
                status: status,
                statusColor: statusColor,
                bookings: Math.floor(Math.random() * 50) + 5,
                posted: postedTime,
                riskLevel: risk,
                riskColor: riskColor
            };
        });

        return [...baseData, ...dummyData];
    };

    const oversightTrainingData = generateTrainingData();

    // MaritimeLink Jobs Data
    const maritimeLinkJobsData = [
        {
            id: '1',
            jobTitle: 'Deck Officer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'MECHANICAL, ON OSV',
            typeColor: 'text-blue-600',
            location: 'UK',
            status: 'Active',
            statusColor: 'text-green-600',
            applications: 10,
            views: 176,
            posted: 'Today'
        },
        {
            id: '2',
            jobTitle: 'Chief Engineer',
            jobSubtext: 'Official MaritimeLink Listing',
            type: 'JOB',
            typeColor: 'text-blue-600',
            location: 'Norway',
            status: 'Draft',
            statusColor: 'text-orange-600',
            applications: 0,
            views: 0,
            posted: 'Today'
        }
    ];

    // MaritimeLink Training Data
    const maritimeLinkTrainingData = [
        {
            id: '1',
            courseName: 'OSHA Course for Mariners',
            courseSubtext: 'Official MaritimeLink Course',
            type: 'SAFETY',
            typeColor: 'text-blue-600',
            location: '2 Days',
            status: 'Active',
            statusColor: 'text-green-600',
            bookings: 61,
            views: '-',
            posted: '1 month ago'
        },
        {
            id: '2',
            courseName: 'Deck Cadet Training',
            courseSubtext: 'Official MaritimeLink Course',
            type: 'CADET',
            typeColor: 'text-blue-600',
            location: '6 Months',
            status: 'Paused',
            statusColor: 'text-orange-600',
            bookings: 73,
            views: '-',
            posted: '2 months ago'
        }
    ];

    // Determine current stats and data based on active tab
    const getCurrentStats = () => {
        if (activeMainTab === 'Oversight') {
            return activeSubTab === 'Jobs' ? oversightJobsStats : oversightTrainingStats;
        } else {
            return activeSubTab === 'Jobs' ? maritimeLinkJobsStats : maritimeLinkTrainingStats;
        }
    };

    const getCurrentData = () => {
        let data;
        if (activeMainTab === 'Oversight') {
            data = activeSubTab === 'Jobs' ? oversightJobsData : oversightTrainingData;
        } else {
            data = activeSubTab === 'Jobs' ? maritimeLinkJobsData : maritimeLinkTrainingData;
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter(record => {
                if (isMaritimeLinkTab) {
                    if (activeSubTab === 'Jobs') {
                        return record.jobTitle?.toLowerCase().includes(query) ||
                            record.type?.toLowerCase().includes(query) ||
                            record.location?.toLowerCase().includes(query);
                    } else {
                        return record.courseName?.toLowerCase().includes(query) ||
                            record.type?.toLowerCase().includes(query) ||
                            record.location?.toLowerCase().includes(query);
                    }
                } else {
                    if (activeSubTab === 'Jobs') {
                        return record.recruiterName?.toLowerCase().includes(query) ||
                            record.recruiterSubtext?.toLowerCase().includes(query);
                    } else {
                        return record.courseName?.toLowerCase().includes(query) ||
                            record.company?.toLowerCase().includes(query);
                    }
                }
            });
        }

        // Apply Status Filter
        if (statusFilter !== 'Status' && statusFilter !== 'All') {
            data = data.filter(record => record.status === statusFilter);
        }

        // Apply Risk Filter (Only valid for Oversight Jobs usually, but we implement generic check)
        if (riskFilter !== 'Risk Level' && riskFilter !== 'All') {
            data = data.filter(record => record.riskLevel === riskFilter);
        }

        // Apply Time Filter based on posted field
        if (timeFilter !== '30 Days') {
            data = data.filter(record => {
                const posted = record.posted?.toLowerCase() || '';
                let daysAgo = 0;

                if (posted.includes('today')) {
                    daysAgo = 0;
                } else if (posted.includes('yesterday')) {
                    daysAgo = 1;
                } else if (posted.includes('hour')) {
                    daysAgo = 0;
                } else if (posted.includes('day')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1]) : 1;
                } else if (posted.includes('week')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1]) * 7 : 7;
                } else if (posted.includes('month')) {
                    const match = posted.match(/(\d+)/);
                    daysAgo = match ? parseInt(match[1]) * 30 : 30;
                }

                if (timeFilter === 'Today') {
                    return daysAgo === 0;
                } else if (timeFilter === '7 Days') {
                    return daysAgo <= 7;
                }
                return true;
            });
        }

        return data;
    };

    const currentStats = getCurrentStats();
    const currentData = getCurrentData();
    const isMaritimeLinkTab = activeMainTab === 'MaritimeLink Listings';

    // Pagination Logic
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = currentData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-gray-900 mb-2">Marketplace Management</h1>
                        <p className="text-sm text-gray-500">Oversee jobs and training listings</p>
                    </div>

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
                </div>

                {/* Main Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveMainTab(tab)}
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeMainTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeMainTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs (Jobs / Training Courses) */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setActiveSubTab('Jobs')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'Jobs'
                            ? 'bg-[#1e5a8f] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Briefcase className="h-4 w-4" />
                        Jobs
                    </button>
                    <button
                        onClick={() => setActiveSubTab('Training Courses')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubTab === 'Training Courses'
                            ? 'bg-[#1e5a8f] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <GraduationCap className="h-4 w-4" />
                        Training Courses
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {currentStats.map((stat, index) => (
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
                                <div className={`text-xs font-semibold ${stat.sublabelColor || 'text-green-600'}`}>
                                    {stat.sublabel}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MaritimeLink Manage Section */}
            {isMaritimeLinkTab && (
                <div className="flex-shrink-0 bg-[#DBEAFE] rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#003971] rounded-lg">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#003971]">Manage MaritimeLink Listings</h3>
                            <p className="text-xs text-blue-600">Create and manage internal listings for the platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef} // I need to verify if I have declared this ref
                            style={{ display: 'none' }}
                            accept=".csv"
                            onChange={handleBulkUploadFile}
                        />
                        <button
                            onClick={handleBulkUploadClick}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#003971] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Bulk Upload (CSV)
                        </button>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {activeSubTab === 'Jobs' ? 'Create New Job' : 'Create New Course'}
                        </button>
                    </div>
                </div>
            )}

            {/* Marketplace Table Card - Scrollable */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Search and Filters */}
                <div className="flex-shrink-0 p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search listings..."
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
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${statusFilter !== 'Status' ? 'border-[#1e5a8f] text-[#1e5a8f] bg-[#1e5a8f]/5' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {statusFilter}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {showStatusDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setStatusFilter(option === 'All' ? 'Status' : option);
                                                    setShowStatusDropdown(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === option || (statusFilter === 'Status' && option === 'All') ? 'text-[#1e5a8f] font-semibold bg-gray-50' : 'text-gray-700'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Risk Level Dropdown - Now active for both Jobs and Training in Oversight */}
                            {(!isMaritimeLinkTab) && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRiskDropdown(!showRiskDropdown)}
                                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 ${riskFilter !== 'Risk Level' ? 'border-[#1e5a8f] text-[#1e5a8f] bg-[#1e5a8f]/5' : 'border-gray-200 text-gray-700'}`}
                                    >
                                        {riskFilter}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    {showRiskDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                            {riskOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setRiskFilter(option === 'All' ? 'Risk Level' : option);
                                                        setShowRiskDropdown(false);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${riskFilter === option || (riskFilter === 'Risk Level' && option === 'All') ? 'text-[#1e5a8f] font-semibold bg-gray-50' : 'text-gray-700'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                {isMaritimeLinkTab ? (
                                    // MaritimeLink columns
                                    activeSubTab === 'Jobs' ? (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Job Title
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Applications
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Views
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Posted
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Course Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Bookings
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Views
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Posted
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    )
                                ) : (
                                    // Oversight columns
                                    activeSubTab === 'Jobs' ? (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Recruiter / Company
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Live Jobs
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Jobs Posted
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Applications
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Flagged Jobs
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Risk Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Course Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Company / Provider
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Bookings
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Posted
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isMaritimeLinkTab ? (
                                // MaritimeLink table rows
                                activeSubTab === 'Jobs' ? (
                                    paginatedData.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{record.jobTitle}</div>
                                                <div className="text-xs text-gray-500">{record.jobSubtext}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.typeColor}`}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.location}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.statusColor}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.applications}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.views}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{record.posted}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/internal/jobs/${record.id}`}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    paginatedData.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{record.courseName}</div>
                                                <div className="text-xs text-gray-500">{record.courseSubtext}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.typeColor}`}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.location}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.statusColor}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.bookings}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{record.views}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{record.posted}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/internal/courses/${record.id}`}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                // Oversight table rows
                                activeSubTab === 'Jobs' ? (
                                    paginatedData.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{record.recruiterName}</div>
                                                <div className="text-xs text-gray-500">{record.recruiterSubtext}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.totalLiveJobs}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.jobsPosted}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.totalApplications}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.flaggedJobs}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.riskColor}`}>
                                                    {record.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/oversight/jobs/${record.id}`}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Jobs
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    paginatedData.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{record.courseName}</div>
                                                <div className="text-xs text-gray-500">{record.courseProvider}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.typeColor}`}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.company}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${record.statusColor}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{record.bookings}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{record.posted}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/oversight/courses/${record.id}`}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{Math.min(startIndex + 1, currentData.length)}</span> - <span className="font-semibold">{Math.min(endIndex, currentData.length)}</span> of <span className="font-semibold">{currentData.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Success Notification */}
            {showExportNotification && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Data exported successfully!</span>
                </div>
            )}
            {/* Bulk Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6 text-[#003971]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Bulk Upload {activeSubTab}</h3>
                            <p className="text-gray-500 text-sm mt-1">Upload a CSV file to import multiple listings at once</p>
                        </div>

                        {!uploadComplete ? (
                            <>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-colors ${uploadFile ? 'border-[#003971] bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                    />

                                    {uploadFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileEdit className="h-8 w-8 text-[#003971] mb-2" />
                                            <span className="font-semibold text-gray-900">{uploadFile.name}</span>
                                            <span className="text-xs text-gray-500">{(uploadFile.size / 1024).toFixed(2)} KB</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Download className="h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</span>
                                            <span className="text-xs text-gray-500 mt-1">CSV files only (max 10MB)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={!uploadFile || isUploading}
                                        className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all ${!uploadFile || isUploading
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#003971] hover:bg-[#002855] shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>Uploading...</span>
                                            </div>
                                        ) : (
                                            'Upload File'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h4>
                                <p className="text-gray-500">Your listings have been queued for processing.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marketplace;
