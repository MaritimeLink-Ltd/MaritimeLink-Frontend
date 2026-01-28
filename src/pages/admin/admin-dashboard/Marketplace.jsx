import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Briefcase, GraduationCap, CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, Clock, Eye, FileEdit, PauseCircle, Upload, Plus } from 'lucide-react';

function Marketplace() {
    const [activeMainTab, setActiveMainTab] = useState('Oversight');
    const [activeSubTab, setActiveSubTab] = useState('Jobs');
    const [timeFilter, setTimeFilter] = useState('Today');

    const mainTabs = ['Oversight', 'MaritimeLink Listings'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

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

    // Oversight Training Data
    const oversightTrainingData = [
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
            posted: '1 month ago'
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
            posted: '2 weeks ago'
        }
    ];

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
        if (activeMainTab === 'Oversight') {
            return activeSubTab === 'Jobs' ? oversightJobsData : oversightTrainingData;
        } else {
            return activeSubTab === 'Jobs' ? maritimeLinkJobsData : maritimeLinkTrainingData;
        }
    };

    const currentStats = getCurrentStats();
    const currentData = getCurrentData();
    const isMaritimeLinkTab = activeMainTab === 'MaritimeLink Listings';

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
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#003971] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                            <Upload className="h-4 w-4" />
                            Bulk Upload (CSV)
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors">
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
                                    maritimeLinkJobsData.map((record) => (
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
                                    maritimeLinkTrainingData.map((record) => (
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
                                    oversightJobsData.map((record) => (
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
                                    oversightTrainingData.map((record) => (
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
                        Showing <span className="font-semibold">10</span> of <span className="font-semibold">124</span> entries
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

export default Marketplace;
