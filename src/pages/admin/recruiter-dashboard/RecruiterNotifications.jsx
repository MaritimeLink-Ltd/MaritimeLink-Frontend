import { useState } from 'react';
import {
    Zap,
    X,
    CheckCircle,
    Info,
    AlertTriangle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function RecruiterNotifications() {
    const navigate = useNavigate();
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
            {/* Back Icon */}
            <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-[32px] font-bold text-gray-900">Notifications</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-[#003971] font-semibold">Notifications</span>
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
                                            Recruiter Dashboard Update v2.4
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            New features include enhanced candidate matching, bulk job posting, and automated compliance
                                            tracking for maritime certifications.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                                        Later
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-[#003971] hover:bg-[#002855] rounded-xl transition-colors shadow-sm">
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
                                    You are about to <span className="font-bold">close job posting</span> for{' '}
                                    <span className="font-bold text-gray-900">Chief Engineer Position</span>. This will stop accepting new applications.
                                    Are you sure you want to proceed?
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                        Review Job
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm">
                                        Confirm Close
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
                                    <span className="font-bold">Success!</span> Job posting "3rd Officer - DP Vessel" has been published successfully. 18 matching candidates found.
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
                                    <span className="font-bold">New Feature:</span> You can now export candidate profiles to PDF format directly from the dashboard.
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
                                    <span className="font-bold">Expiring Soon:</span> Your job posting "Master - LNG Tanker" will expire in 2 days. Renew to keep receiving applications.
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
                                    <span className="font-bold">Error:</span> Failed to send invitation emails to 3 candidates. Please check your email settings and try again.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecruiterNotifications;
