import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Award,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import VerifyIdentityModal from '../../../components/modals/VerifyIdentityModal';

function RecruiterDashboard({ onNavigate }) {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('Today');
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const handleNavigate = (section) => {
        if (onNavigate) {
            onNavigate(section);
        } else {
            // Map sections to routes
            const routeMap = {
                'jobs': '/admin/jobs',
                'search': '/admin/search',
                'chats': '/admin/chats',
                'settings': '/admin/settings'
            };
            if (routeMap[section]) {
                navigate(routeMap[section]);
            }
        }
    };

    // Stats Data
    const stats = [
        {
            id: 1,
            title: 'Active Jobs',
            value: '7',
            subtext: 'Currently open',
            icon: Briefcase,
            gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#4a7ab8]',
            iconBg: 'bg-white/20 backdrop-blur-sm',
            section: 'jobs'
        },
        {
            id: 2,
            title: 'New Applications',
            value: '26',
            subtext: 'Since last login',
            icon: CheckCircle,
            gradient: 'from-[#059669] via-[#10b981] to-[#34d399]',
            iconBg: 'bg-white/20 backdrop-blur-sm',
            section: 'jobs'
        },
        {
            id: 3,
            title: 'Matched Professionals',
            value: '84',
            subtext: 'Not yet applied',
            icon: Award,
            gradient: 'from-[#d97706] via-[#f59e0b] to-[#fbbf24]',
            iconBg: 'bg-white/20 backdrop-blur-sm',
            section: 'search'
        },
        {
            id: 4,
            title: 'Jobs Needing Attention',
            value: '3',
            subtext: 'Expiring soon / Drafts',
            icon: AlertTriangle,
            gradient: 'from-[#dc2626] via-[#ef4444] to-[#f87171]',
            iconBg: 'bg-white/20 backdrop-blur-sm',
            topIcon: Calendar,
            section: 'jobs'
        },
    ];

    // Action Items Data
    const actionItems = [
        {
            id: 1,
            text: '5 new applicants awaiting review for Chief Engineer',
            type: 'applicants',
            icon: Briefcase,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-[#EBF3FF]',
            actionText: 'View Applicants',
            section: 'jobs'
        },
        {
            id: 2,
            text: '13 matched professionals ready to invite (Deck Officer)',
            type: 'matches',
            icon: Search,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-[#EBF3FF]',
            actionText: 'View Matches',
            section: 'search'
        },
        {
            id: 3,
            text: "Job '3rd Officer' expires in 2 days",
            type: 'expiring',
            icon: Calendar,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            actionText: 'Edit Job',
            secondaryAction: true,
            section: 'jobs'
        },
        {
            id: 4,
            text: "Job 'Master' has zero applicants",
            type: 'zero',
            icon: Briefcase,
            iconColor: 'text-[#003971]',
            iconBg: 'bg-[#EBF3FF]',
            actionText: 'View Job',
            section: 'jobs'
        }
    ];

    // Jobs Data
    const jobs = [
        {
            id: 1,
            title: 'Chief Engineer',
            type: 'Permanent / LNG Tanker',
            status: 'Active',
            matches: 18,
            image: '/images/login-image.png',
        },
        {
            id: 2,
            title: '3rd Officer',
            type: 'Permanent / DP Vessel',
            status: 'Ending Soon',
            matches: 6,
            image: '/images/login-image.png',
        },
        {
            id: 3,
            title: 'Deck Officer',
            type: 'Temporary / Container Ship',
            status: 'Draft',
            matches: 8,
            image: '/images/login-image.png',
        }
    ];

    // Popular Searches
    const popularSearches = [
        'Chief Engineer',
        '3rd Officer',
        'Offshore Supply Vessel'
    ];

    return (
        <div className="px-8 py-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-gray-600 text-sm">
                        Welcome back, John <span className="text-gray-400">Sunday, January 11, 2026</span>
                    </p>
                </div>

                {/* Time Filter */}
                <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex shadow-sm">
                    {['Today', '7 Days', '1 Month', 'Custom'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${timeFilter === filter
                                ? 'bg-[#003971] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        onClick={() => handleNavigate(stat.section)}
                        className={`bg-gradient-to-br ${stat.gradient} rounded-[28px] p-7 text-white shadow-xl relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <div className="relative z-10 flex flex-col h-full">
                            {/* Top Row: Icon + Optional Calendar */}
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${stat.iconBg}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                {stat.topIcon && (
                                    <stat.topIcon className="h-5 w-5 text-white/40" />
                                )}
                            </div>

                            {/* Bottom Content */}
                            <div className="mt-auto">
                                <div className="text-4xl font-extrabold mb-2 tracking-tight">{stat.value}</div>
                                <div className="font-bold text-base leading-snug mb-1">{stat.title}</div>
                                <div className="text-sm text-white/70 font-medium">{stat.subtext}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Action Required */}
                <div className="flex-1 space-y-5">
                    <h2 className="text-lg font-bold text-gray-900">Action Required</h2>

                    <div className="space-y-4">
                        {actionItems.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`p-3 rounded-xl ${item.iconBg} flex-shrink-0`}>
                                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                    </div>
                                    <span className="text-gray-900 font-medium text-sm">{item.text}</span>
                                </div>
                                <button
                                    onClick={() => handleNavigate(item.section)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${item.secondaryAction
                                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                        : 'bg-[#003971] text-white hover:bg-[#002855]'
                                        } flex items-center gap-2`}>
                                    {item.actionText}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Insights */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50/70 rounded-2xl p-6 h-full border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="text-orange-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-bold text-gray-900">Insight: Popular Searches</h2>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                            {popularSearches.map((search, index) => (
                                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 font-bold text-sm w-4">{index + 1}.</span>
                                        <span className="text-gray-900 font-bold text-sm">{search}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs at a Glance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Your Jobs at a Glance</h2>
                    <button
                        onClick={() => handleNavigate('jobs')}
                        className="text-sm font-bold text-[#003971] hover:underline flex items-center gap-1"
                    >
                        View All Jobs &gt;
                    </button>
                </div>

                <div className="divide-y divide-gray-50">
                    <div className="grid grid-cols-12 px-8 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-6">Job Title</div>
                        <div className="col-span-3">Status / Applicants</div>
                        <div className="col-span-3 text-right">Matches (Not Applied)</div>
                    </div>

                    {jobs.map((job) => (
                        <div key={job.id} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-6 flex items-center gap-4">
                                <img
                                    src={job.image}
                                    alt={job.title}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                                />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{job.title}</h3>
                                    <p className="text-xs text-gray-500 font-medium">{job.type}</p>
                                </div>
                            </div>
                            <div className="col-span-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${job.status === 'Active'
                                    ? 'bg-teal-50 text-teal-600'
                                    : job.status === 'Ending Soon'
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                            <div className="col-span-3 flex justify-end">
                                {job.status === 'Draft' ? (
                                    <button
                                        onClick={() => handleNavigate('jobs')}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-700 transition-colors"
                                    >
                                        Edit Draft
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavigate('search')}
                                        className="bg-[#003971] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#002855] transition-colors flex items-center gap-2"
                                    >
                                        {job.matches} <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-8 py-5 border-t border-gray-100 text-center">
                    <button
                        onClick={() => handleNavigate('jobs')}
                        className="text-sm font-bold text-[#003971] hover:underline flex items-center justify-center gap-1 w-full"
                    >
                        View All Jobs <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecruiterDashboard;