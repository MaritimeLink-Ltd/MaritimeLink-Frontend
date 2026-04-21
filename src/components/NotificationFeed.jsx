import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    X,
    CheckCircle,
    Info,
    AlertTriangle,
    AlertCircle,
    ChevronLeft,
} from 'lucide-react';

const iconBySeverity = {
    announcement: Zap,
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
};

const colorBySeverity = {
    announcement: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-orange-50 text-orange-600',
    error: 'bg-red-50 text-red-600',
};

const titleBySeverity = {
    announcement: 'Announcement',
    success: 'Success Notification',
    info: 'Info Notification',
    warning: 'Warning Notification',
    error: 'Error Notification',
};

function NotificationFeed({ accent = '#1e5a8f', breadcrumbAccent = 'text-[#1e5a8f]', description = 'System alerts and platform updates', loadNotifications }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await loadNotifications();
                const list = response?.data?.notifications || [];
                if (!cancelled) setNotifications(list);
            } catch (err) {
                if (!cancelled) setError(err?.message || 'Could not load notifications.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchNotifications();

        return () => {
            cancelled = true;
        };
    }, [loadNotifications]);

    const closeNotification = (id) => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-[32px] font-bold text-gray-900">Notifications</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>Home</span>
                    <span>/</span>
                    <span className={`${breadcrumbAccent} font-semibold`}>Notifications</span>
                </div>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500">
                    No notifications right now.
                </div>
            ) : (
                <div className="space-y-6">
                    {notifications.map((notification) => {
                        const severity = notification.severity || notification.type || 'info';
                        const Icon = iconBySeverity[severity] || Info;
                        const color = colorBySeverity[severity] || colorBySeverity.info;

                        return (
                            <div key={notification.id}>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    {titleBySeverity[severity] || 'Notification'}
                                </h2>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                                    <button
                                        onClick={() => closeNotification(notification.id)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <div className="flex items-start gap-3 pr-8">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                <span className="font-bold">{notification.title}:</span> {notification.message}
                                            </p>
                                            {notification.createdAt && (
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {severity === 'announcement' && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors shadow-sm"
                                                style={{ backgroundColor: accent }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default NotificationFeed;
