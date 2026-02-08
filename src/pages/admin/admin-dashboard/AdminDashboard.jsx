import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    AlertTriangle,
    Shield,
    Briefcase,
    PlayCircle,
    FileText,
    Calendar,
    ChevronRight,
    CheckCircle,
    TrendingUp,
    Building,
    DollarSign,
    ArrowUpRight,
    MoreVertical,
    Search,
    ChevronDown,
    Link as LinkIcon,
    MoreHorizontal,
    ArrowRight,
    Filter,
    Menu,
    Settings,
    BookOpen
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('Today');

    // Time-based mock data
    const mockData = {
        'Today': {
            topStats: [
                { id: 1, icon: Users, value: '12', label: 'Pending Approvals', badge: '+4 today', gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8]', path: '/admin/compliance' },
                { id: 2, icon: AlertTriangle, value: '5', label: 'Flagged Issues', badge: 'Needs Attention', gradient: 'from-[#ef4444] via-[#f87171] to-[#fca5a5]', path: '/admin/flagged-accounts' },
                { id: 3, icon: Shield, value: '8', label: 'Expiring Compliance', badge: 'In next 48h', gradient: 'from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]', path: '/admin/compliance' }
            ],
            activityStats: [
                { icon: Briefcase, label: 'Jobs Posted', value: '24', iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { icon: PlayCircle, label: 'Courses', value: '12', iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
                { icon: FileText, label: 'Applications', value: '156', iconColor: 'text-green-500', iconBg: 'bg-green-50', badge: 'NEW' },
                { icon: Calendar, label: 'Bookings', value: '8', iconColor: 'text-orange-500', iconBg: 'bg-orange-50' }
            ],
            metrics: [
                { label: 'SUCCESS RATE', sublabel: '3 Days Avg.', value: '', icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50' },
                { label: 'Providers', value: '10' },
                { label: 'Recruiters', value: '8' },
                { label: 'Professionals', value: '142' }
            ],
            revenue: { subscriptions: '1,250', totalRevenue: '£45,200', change: '+12.5%' },
            revenueBreakdown: [
                { label: 'Professionals', revenue: '£125,000', users: '1,200 Active', change: '+8%', icon: Users, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { label: 'Recruiters', revenue: '£300,000', users: '50 Active', change: '+15%', icon: Building, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' }
            ],
            trainingSources: [
                { label: 'Course Sales', value: '£8,450' },
                { label: 'Pending Payouts', value: '£1,200' },
                { label: 'Refunds', value: '£0' }
            ]
        },
        '7 Days': {
            topStats: [
                { id: 1, icon: Users, value: '45', label: 'Pending Approvals', badge: '+18 this week', gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8]', path: '/admin/compliance' },
                { id: 2, icon: AlertTriangle, value: '12', label: 'Flagged Issues', badge: 'Needs Attention', gradient: 'from-[#ef4444] via-[#f87171] to-[#fca5a5]', path: '/admin/flagged-accounts' },
                { id: 3, icon: Shield, value: '24', label: 'Expiring Compliance', badge: 'This week', gradient: 'from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]', path: '/admin/compliance' }
            ],
            activityStats: [
                { icon: Briefcase, label: 'Jobs Posted', value: '156', iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { icon: PlayCircle, label: 'Courses', value: '48', iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
                { icon: FileText, label: 'Applications', value: '892', iconColor: 'text-green-500', iconBg: 'bg-green-50', badge: 'NEW' },
                { icon: Calendar, label: 'Bookings', value: '67', iconColor: 'text-orange-500', iconBg: 'bg-orange-50' }
            ],
            metrics: [
                { label: 'SUCCESS RATE', sublabel: '7 Days Avg.', value: '', icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50' },
                { label: 'Providers', value: '28' },
                { label: 'Recruiters', value: '35' },
                { label: 'Professionals', value: '456' }
            ],
            revenue: { subscriptions: '3,450', totalRevenue: '£125,800', change: '+18.2%' },
            revenueBreakdown: [
                { label: 'Professionals', revenue: '£340,000', users: '2,450 Active', change: '+12%', icon: Users, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { label: 'Recruiters', revenue: '£580,000', users: '120 Active', change: '+22%', icon: Building, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' }
            ],
            trainingSources: [
                { label: 'Course Sales', value: '£42,300' },
                { label: 'Pending Payouts', value: '£8,500' },
                { label: 'Refunds', value: '£450' }
            ]
        },
        '30 Days': {
            topStats: [
                { id: 1, icon: Users, value: '189', label: 'Pending Approvals', badge: '+67 this month', gradient: 'from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8]', path: '/admin/compliance' },
                { id: 2, icon: AlertTriangle, value: '34', label: 'Flagged Issues', badge: 'Needs Attention', gradient: 'from-[#ef4444] via-[#f87171] to-[#fca5a5]', path: '/admin/flagged-accounts' },
                { id: 3, icon: Shield, value: '78', label: 'Expiring Compliance', badge: 'This month', gradient: 'from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]', path: '/admin/compliance' }
            ],
            activityStats: [
                { icon: Briefcase, label: 'Jobs Posted', value: '567', iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { icon: PlayCircle, label: 'Courses', value: '145', iconColor: 'text-purple-500', iconBg: 'bg-purple-50' },
                { icon: FileText, label: 'Applications', value: '3,245', iconColor: 'text-green-500', iconBg: 'bg-green-50', badge: 'NEW' },
                { icon: Calendar, label: 'Bookings', value: '234', iconColor: 'text-orange-500', iconBg: 'bg-orange-50' }
            ],
            metrics: [
                { label: 'SUCCESS RATE', sublabel: '30 Days Avg.', value: '', icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50' },
                { label: 'Providers', value: '89' },
                { label: 'Recruiters', value: '124' },
                { label: 'Professionals', value: '1,567' }
            ],
            revenue: { subscriptions: '12,800', totalRevenue: '£456,000', change: '+24.8%' },
            revenueBreakdown: [
                { label: 'Professionals', revenue: '£890,000', users: '5,600 Active', change: '+18%', icon: Users, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
                { label: 'Recruiters', revenue: '£1,250,000', users: '280 Active', change: '+32%', icon: Building, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' }
            ],
            trainingSources: [
                { label: 'Course Sales', value: '£168,500' },
                { label: 'Pending Payouts', value: '£24,300' },
                { label: 'Refunds', value: '£2,100' }
            ]
        }
    };

    // Get current data based on time filter
    const currentData = mockData[timeFilter] || mockData['Today'];

    // Review Queue (static - not affected by time filter)
    const reviewQueue = [
        { id: 1, company: 'Ocean Hire Agency', issue: 'Domain Mismatch', time: '2h ago', type: 'error', icon: AlertTriangle, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
        { id: 2, company: 'Sarah Jenkin', issue: 'Blurry ID', time: '5h ago', type: 'warning', icon: AlertTriangle, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50' },
        { id: 3, company: 'Pacific Maritime', issue: 'Verification Pending', time: '1d ago', type: 'info', icon: AlertTriangle, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
        { id: 4, company: 'Blue Wave Shipping', issue: 'Expired License', time: '1d ago', type: 'error', icon: AlertTriangle, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
        { id: 5, company: 'John Doe', issue: 'Incomplete Profile', time: '2d ago', type: 'warning', icon: AlertTriangle, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50' }
    ];

    // System Alerts (static)
    const systemAlerts = [
        { id: 1, message: 'Multiple accounts flagged for', time: 'Just now', severity: 'high', color: 'bg-red-500' },
        { id: 2, message: 'Unusual spike in new', time: 'Just now', severity: 'medium', color: 'bg-orange-500' },
        { id: 3, message: 'System maintenance', time: 'Just now', severity: 'info', color: 'bg-blue-500' },
        { id: 4, message: 'Payment gateway latency', time: 'Just now', severity: 'medium', color: 'bg-orange-500' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#1e5a8f] text-sm font-bold tracking-wide">ADMIN VIEW</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500 text-sm">Overview</span>
                    </div>
                    <h1 className="text-[32px] font-bold text-gray-900">Analytics Overview</h1>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentData.topStats.map((stat) => (
                    <div
                        key={stat.id}
                        onClick={() => navigate(stat.path)}
                        className={`bg-gradient-to-br ${stat.gradient} rounded-[24px] p-7 text-white shadow-lg relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <div className="relative z-10">
                            {/* Icon and Badge */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    {stat.badge}
                                </span>
                            </div>

                            {/* Value and Label */}
                            <div className="mt-auto">
                                <div className="text-5xl font-extrabold mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-base font-semibold leading-snug">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Filter */}
            <div className="flex justify-end">
                <div className="bg-white p-1 rounded-2xl border border-gray-100 inline-flex shadow-sm">
                    {['Today', '7 Days', '30 Days'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${timeFilter === filter
                                ? 'bg-[#1e5a8f] text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Platform Activity & Review Queue */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Platform Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Platform Activity</h2>
                                <p className="text-sm text-gray-500 mt-1">Real-time overview of system events</p>
                            </div>
                            <Link
                                to="/admin/platform-activity"
                                className="text-sm font-bold text-[#1e5a8f] hover:underline flex items-center gap-1"
                            >
                                View Full Report
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Activity Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {currentData.activityStats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className={`p-2.5 rounded-lg ${stat.iconBg} inline-flex mb-3`}>
                                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                        {stat.badge && (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {stat.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Additional Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {currentData.metrics.map((metric, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-4">
                                    {metric.icon ? (
                                        <>
                                            <div className={`p-2.5 rounded-lg ${metric.iconBg} inline-flex mb-3`}>
                                                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold mb-0.5">{metric.label}</p>
                                            <p className="text-sm font-bold text-gray-900">{metric.sublabel}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500 font-medium mb-1">{metric.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Queue & System Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Review Queue */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Review Queue</h2>
                                <span className="text-xs font-bold text-[#1e5a8f] bg-blue-50 px-3 py-1.5 rounded-full">
                                    4 Pending
                                </span>
                            </div>

                            <div className="space-y-3">
                                {reviewQueue.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate('/admin/compliance')}
                                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                                    >
                                        <div className={`p-2 rounded-lg ${item.iconBg} flex-shrink-0`}>
                                            <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900">{item.company}</p>
                                            <p className="text-xs text-red-500 font-medium">{item.issue}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/admin/compliance')}
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-4 py-2"
                            >
                                View All Reviews
                            </button>
                        </div>

                        {/* System Alerts */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">System Alerts</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {systemAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        onClick={() => navigate('/admin/notifications')}
                                        className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
                                    >
                                        <div className={`w-8 h-8 rounded-full ${alert.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                            {alert.id}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                                            <span className="text-xs text-gray-400">{alert.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-4 py-2"
                            >
                                View All Alerts
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Review Approval - Dark Blue Card */}
                        <button
                            onClick={() => navigate('/admin/compliance')}
                            className="bg-[#0f385c] text-white rounded-2xl p-6 text-left hover:shadow-lg transition-all hover:bg-[#0a2742]"
                        >
                            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm inline-flex mb-8">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-base font-bold mb-1">Review Approval</h3>
                            <p className="text-sm text-white/70">Start next pending item</p>
                        </button>

                        {/* Flagged Accounts - White Card */}
                        <button
                            onClick={() => navigate('/admin/flagged-accounts')}
                            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md transition-all hover:border-gray-200"
                        >
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 inline-flex mb-8">
                                <AlertTriangle className="h-5 w-5 text-gray-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Flagged Accounts</h3>
                            <p className="text-sm text-gray-500">View all 5 issues</p>
                        </button>

                        {/* Upload Job - White Card */}
                        <button
                            onClick={() => navigate('/admin/marketplace/create-job', {
                                state: { dashboardType: 'admin', returnPath: '/admin-dashboard' }
                            })}
                            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md transition-all hover:border-gray-200"
                        >
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 inline-flex mb-8">
                                <ArrowUpRight className="h-5 w-5 text-gray-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">Upload Job</h3>
                            <p className="text-sm text-gray-500">Import external listing</p>
                        </button>
                    </div>
                </div>

                {/* Right Column - Revenue */}
                <div className="space-y-6">
                    {/* Revenue Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Revenue</h2>
                                <p className="text-xs text-gray-500">Overview</p>
                            </div>
                            <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                                <TrendingUp className="h-4 w-4" />
                                {currentData.revenue.change}
                            </div>
                        </div>

                        {/* Main Revenue Display */}
                        <div className="bg-gradient-to-br from-[#1e4c7a] via-[#2563a8] to-[#3b7ab8] rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4 text-white/80" />
                                <span className="text-xs font-bold text-white/80 tracking-wide">ACTIVE SUBSCRIPTIONS</span>
                            </div>
                            <div className="text-4xl font-extrabold text-white mb-4">{currentData.revenue.subscriptions}</div>

                            <div className="pt-4 border-t border-white/20">
                                <span className="text-xs font-bold text-white/80 tracking-wide block mb-2">TOTAL REVENUE</span>
                                <div className="text-3xl font-extrabold text-white">{currentData.revenue.totalRevenue}</div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-4">BREAKDOWN</h3>
                            <div className="space-y-4">
                                {currentData.revenueBreakdown.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.iconBg}`}>
                                                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.users}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{item.revenue}</p>
                                            <p className="text-xs font-bold text-green-500">{item.change}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Training Revenue Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Training Revenue</h2>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Net Revenue Display */}
                        <div className="bg-gradient-to-br from-[#1f2937] via-[#374151] to-[#4b5563] rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-white/80" />
                                    <span className="text-xs font-bold text-white/80 tracking-wide">NET REVENUE</span>
                                </div>
                                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                                    +5.2%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-4xl font-extrabold text-white">£14,250</div>
                                <span className="text-lg text-white/40">.00</span>
                            </div>
                            <span className="text-xs text-white/60">This Month</span>
                        </div>

                        {/* Sources */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-wide mb-4">SOURCES</h3>
                            <div className="space-y-3">
                                {currentData.trainingSources.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">{source.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{source.value}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/admin/transaction-history"
                                className="w-full text-center text-sm font-bold text-[#1e5a8f] hover:underline mt-6 py-2 flex items-center justify-center gap-1"
                            >
                                View Transaction History
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

