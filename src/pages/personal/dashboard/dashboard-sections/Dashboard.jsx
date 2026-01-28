import React from 'react';
import {
    FileText,
    Folder,
    Briefcase,
    GraduationCap,
    AlertCircle,
    CheckCircle,
    Calendar,
    Ship
} from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
    // Quick access cards data
    const quickAccessCards = [
        {
            id: 'resume',
            title: 'Resume',
            icon: FileText,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: '90% complete',
            statusType: 'progress',
            progress: 90,
            buttonText: 'Go To Resume',
            onClick: () => onNavigate('resume')
        },
        {
            id: 'documents',
            title: 'Document Wallet',
            icon: Folder,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: 'Fully Compliant',
            statusType: 'text',
            buttonText: 'Go To Documents',
            onClick: () => onNavigate('documents')
        },
        {
            id: 'jobs',
            title: 'Jobs',
            icon: Briefcase,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: '6 jobs matching your profile',
            statusType: 'text',
            statusLight: true,
            buttonText: 'Go To Jobs',
            onClick: () => onNavigate('jobs')
        },
        {
            id: 'courses',
            title: 'Courses',
            icon: GraduationCap,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: '2 recommended courses',
            statusType: 'text',
            statusLight: true,
            buttonText: 'Go To Training',
            onClick: () => onNavigate('training')
        }
    ];

    // Alerts data
    const alerts = [
        {
            id: 1,
            icon: AlertCircle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            message: '5 certificates expiring in the next 90 days',
            time: 'Today'
        },
        {
            id: 2,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        },
        {
            id: 3,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        },
        {
            id: 4,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        },
        {
            id: 5,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        },
        {
            id: 6,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        }
    ];

    // Recent activity data
    const recentActivity = [
        {
            id: 1,
            icon: AlertCircle,
            iconColor: 'text-orange-500',
            iconBg: 'bg-orange-50',
            message: '5 certificates expiring in the next 90 days',
            time: 'Today'
        },
        {
            id: 2,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Eng Medical certificate uploaded',
            time: '1d ago'
        },
        {
            id: 3,
            icon: Ship,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            message: 'Applied for Chief Engineer at Panama Flag',
            time: '1d ago'
        }
    ];

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden">
            {/* Sticky Header Section */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 bg-white">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm sm:text-base mt-1">View everything at a glance</p>
                </div>

                {/* Alert Banner */}
                <div className="bg-orange-50 rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle size={18} className="text-orange-600" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-800 font-medium">5 certificates expiring in the next 90 days</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium w-full sm:w-auto justify-center">
                        <CheckCircle size={16} />
                        Fully Compliant
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {quickAccessCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.id}
                                className="bg-gray-50 rounded-xl p-5 flex flex-col"
                            >
                                {/* Icon and Title */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                                        <Icon size={20} className={card.iconColor} />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-800">{card.title}</h3>
                                </div>

                                {/* Status */}
                                <div className="mb-4 flex-1">
                                    {card.statusType === 'progress' ? (
                                        <>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-[#003366] h-2 rounded-full"
                                                    style={{ width: `${card.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{card.status}</span>
                                        </>
                                    ) : (
                                        <span className={`text-sm font-medium ${card.statusLight ? 'text-gray-600' : 'text-gray-800'}`}>
                                            {card.status}
                                        </span>
                                    )}
                                </div>

                                {/* Button */}
                                <button
                                    onClick={card.onClick}
                                    className="w-full bg-[#003366] text-white py-2.5 rounded-full text-sm font-medium hover:bg-blue-900 transition-colors"
                                >
                                    {card.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Alerts and Recent Activity */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Alerts Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Alerts</h2>
                        <div className="space-y-3">
                            {alerts.map((alert) => {
                                const Icon = alert.icon;
                                return (
                                    <div
                                        key={alert.id}
                                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-3"
                                    >
                                        <div className={`w-8 h-8 ${alert.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                                            <Icon size={16} className={alert.iconColor} />
                                        </div>
                                        <span className="flex-1 text-sm text-gray-800">{alert.message}</span>
                                        <span className="text-xs text-gray-400">{alert.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={activity.id}
                                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-3"
                                    >
                                        <div className={`w-8 h-8 ${activity.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                                            <Icon size={16} className={activity.iconColor} />
                                        </div>
                                        <span className="flex-1 text-sm text-gray-800">{activity.message}</span>
                                        <span className="text-xs text-gray-400">{activity.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
