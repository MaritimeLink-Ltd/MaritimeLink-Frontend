import { useState } from 'react';
import {
    BookOpen,
    Calendar,
    TrendingUp,
    Users,
    Clock,
    ChevronRight,
    MoreVertical,
    AlertCircle,
    BookMarked
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

function TrainingProviderDashboard() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const statsCards = [
        {
            id: 1,
            title: 'Active Courses',
            value: '5',
            subtitle: 'Active Courses',
            icon: BookOpen,
            bgGradient: 'from-[#1E4976] to-[#2E6BA8]',
            iconBg: 'bg-white/20',
            path: '/trainingprovider/courses'
        },
        {
            id: 2,
            title: 'New Bookings',
            value: '18',
            subtitle: 'New Bookings',
            icon: Calendar,
            bgGradient: 'from-[#0FA968] to-[#1BC47D]',
            iconBg: 'bg-white/20',
            path: '/trainingprovider/bookings'
        },
        {
            id: 3,
            title: 'Demand Signals',
            value: '4',
            subtitle: 'Demand Signals',
            icon: TrendingUp,
            bgGradient: 'from-[#E86C5F] to-[#F28B7D]',
            iconBg: 'bg-white/20',
            path: '/trainingprovider/demand'
        }
    ];

    const actionItems = [
        {
            id: 1,
            icon: Users,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: '12 learners waiting for Advanced Engineering Courses',
            subtitle: 'Next session: 10-12 June, Aberdeen',
            hasButton: false,
            path: null
        },
        {
            id: 2,
            icon: BookMarked,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            title: 'Energy Efficiency Program is 90% full',
            subtitle: 'Next session: 24-26 May, Aberdeen',
            hasButton: true,
            buttonText: 'View Bookings',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            path: '/trainingprovider/bookings'
        },
        {
            id: 3,
            icon: Clock,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            title: '3 sessions need scheduling',
            subtitle: 'Marine Electricals • Offshore Safety > Energy Audits',
            hasButton: true,
            buttonText: 'Add Session',
            buttonStyle: 'bg-white text-orange-600 border-2 border-orange-200 hover:bg-orange-50',
            path: '/trainingprovider/courses'
        },
        {
            id: 4,
            icon: TrendingUp,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            title: 'High demand detected in Aberdeen',
            subtitle: '67 professionals need renewal in 30 days',
            hasButton: true,
            buttonText: 'View Bookings',
            buttonStyle: 'bg-[#003971] text-white hover:bg-[#002455]',
            path: '/trainingprovider/bookings'
        }
    ];

    const courses = [
        {
            id: 1,
            name: 'STCW Basic Safety',
            icon: Users,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            status: 'Nearly Full',
            statusColor: 'bg-orange-100 text-orange-700',
            capacity: '17 / 18'
        },
        {
            id: 2,
            name: 'Advanced Firefighting',
            icon: AlertCircle,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            status: 'Nearly Full',
            statusColor: 'bg-orange-100 text-orange-700',
            capacity: '17 / 18'
        },
        {
            id: 3,
            name: 'Energy Efficiency',
            icon: BookOpen,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-50',
            status: 'Open',
            statusColor: 'bg-green-100 text-green-700',
            capacity: '17 / 20'
        }
    ];

    return (
        <div className="overflow-y-auto lg:overflow-hidden h-full">
            <div className="lg:sticky lg:top-0 lg:z-10 bg-[#F5F7FA] pb-4">
                {/* Welcome Section */}
                <div className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[28px] font-bold text-gray-900 mb-1">Welcome Kingsley</h1>
                            <p className="text-gray-500 text-sm">Your training operations at a glance</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">Kingsley Osifo</p>
                                <p className="text-xs text-gray-500">Training Provider Manager</p>
                            </div>
                            <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                src="/images/login-image.png"
                                alt="User avatar"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto lg:h-[calc(100vh-220px)] scrollbar-hide">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {statsCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => navigate(card.path)}
                            className={`bg-gradient-to-br ${card.bgGradient} rounded-[20px] p-6 text-white shadow-md cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`${card.iconBg} p-3 rounded-xl`}>
                                    <card.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[40px] font-bold leading-none">{card.value}</h3>
                                <p className="text-white/95 text-base font-medium">{card.subtitle}</p>
                                <p className="text-white/70 text-xs">{card.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Required and Quick Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Action Required - 60% width (3 columns) */}
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Action Required</h2>
                    <div className="space-y-3">
                        {actionItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0`}>
                                            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    {item.hasButton && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(item.path);
                                            }}
                                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all flex-shrink-0 ${item.buttonStyle}`}
                                        >
                                            <span>{item.buttonText}</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Overview - 40% width (2 columns) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Quick Overview</h2>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Table Header */}
                        <div className="flex justify-between pb-3 mb-4 border-b border-gray-200">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                COURSE
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                STATUS / CAPACITY
                            </div>
                        </div>

                        {/* Course List */}
                        <div className="space-y-3">
                            {courses.map((course, index) => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(`/trainingprovider/courses/${course.id}`)}
                                    className={`flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2 ${index !== courses.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`${course.iconBg} p-2.5 rounded-lg`}>
                                            <course.icon className={`h-5 w-5 ${course.iconColor}`} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">
                                            {course.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${course.statusColor}`}>
                                            {course.status}
                                        </span>
                                        <span className="text-sm font-bold text-gray-700 min-w-[55px] text-right">
                                            {course.capacity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All Courses Link */}
                        <div className="mt-5 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => navigate('/trainingprovider/courses')}
                                className="w-full text-center text-sm font-bold text-[#003971] hover:text-[#002455] transition-colors"
                            >
                                View All Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default TrainingProviderDashboard;

