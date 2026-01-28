import { useState } from 'react';
import {
    Zap,
    X,
    CheckCircle,
    Info,
    AlertTriangle,
    AlertCircle,
    ChevronRight
} from 'lucide-react';

function Notifications() {
    const [notifications, setNotifications] = useState({
        announcement: true,
        toast: true,
        success: true,
        info: true,
        warning: true,
        error: true
    });

    const closeNotification = (type) => {
        setNotifications(prev => ({
            ...prev,
            [type]: false
        }));
    };

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-[32px] font-bold text-gray-900">Notifications</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-[#1e5a8f] font-semibold">Notifications</span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm">System alerts and platform updates</p>
            </div>

            <div className="space-y-8">
                {/* Announcement Bar */}
                {notifications.announcement && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Announcement Bar</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                                        <Zap className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">
                                            Admin Dashboard Update v2.4
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            New features include bulk KYC processing, advanced recruiter analytics, and automated compliance
                                            flagging for expired certifications.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                                        Later
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-[#1e5a8f] hover:bg-[#164a7a] rounded-xl transition-colors shadow-sm">
                                        Update Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {notifications.toast && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Toast Notification</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                            <button
                                onClick={() => closeNotification('toast')}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="pr-8">
                                <p className="text-sm text-gray-900 mb-6 leading-relaxed">
                                    You are about to <span className="font-bold">suspend access</span> for{' '}
                                    <span className="font-bold text-gray-900">Ocean Hire Agency</span>. This will immediately revoke their access to the platform.
                                    Are you sure you want to proceed?
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                        Review Account
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm">
                                        Confirm Suspension
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Notification */}
                {notifications.success && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Success Notification</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                            <button
                                onClick={() => closeNotification('success')}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3 pr-8">
                                <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-bold">Success!</span> KYC Verification batch #8821 completed. 15 new professionals have been approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Notification */}
                {notifications.info && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Info Notification</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                            <button
                                onClick={() => closeNotification('info')}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3 pr-8">
                                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Info className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-bold">Marketplace Alert:</span> 5 new job postings flagged for manual review by the automated oversight system.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning Notification */}
                {notifications.warning && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Warning Notification</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                            <button
                                onClick={() => closeNotification('warning')}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3 pr-8">
                                <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-bold">SLA Breach Warning:</span> 3 High-Priority support cases are approaching their 4-hour resolution deadline.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Notification */}
                {notifications.error && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Error Notification</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                            <button
                                onClick={() => closeNotification('error')}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-3 pr-8">
                                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-bold">Error:</span> System Job 'Daily Revenue Aggregation' failed to execute at 00:00 UTC. Retry triggered.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;
