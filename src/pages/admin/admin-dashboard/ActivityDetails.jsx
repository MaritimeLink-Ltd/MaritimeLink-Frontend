import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, CheckCircle, Monitor, MapPin, Globe, Loader } from 'lucide-react';
import adminOperationsService from '../../../services/adminOperationsService';

const formatDetailsTimestamp = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

const statusBadgeClassMap = {
    SUCCESS: 'text-green-600 bg-green-50',
    WARNING: 'text-orange-600 bg-orange-50',
    FAILED: 'text-red-600 bg-red-50',
};

function ActivityDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activityDetail, setActivityDetail] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadActivity = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await adminOperationsService.getActivityLogById(id);
                if (!mounted) return;
                setActivityDetail(response?.data?.log || null);
            } catch (err) {
                if (!mounted) return;
                setError(err?.message || 'Failed to load activity details');
                setActivityDetail(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadActivity();

        return () => {
            mounted = false;
        };
    }, [id]);

    const actor = activityDetail?.actor || {};
    const meta = activityDetail?.meta || {};
    const statusKey = String(activityDetail?.status || '').toUpperCase();
    const profileLink =
        actor?.actorType === 'SYSTEM'
            ? null
            : `/admin/accounts/${actor.id}`;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to Operations</span>
                </button>

                <div>
                    <h1 className="text-[28px] font-bold text-gray-900">Activity Details</h1>
                    <p className="text-sm text-gray-500">Log {id}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-20">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">Loading activity details...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Activity Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <User className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{activityDetail?.event || 'Activity'}</h2>
                                        <p className="text-sm text-gray-500">{activityDetail?.description || 'No description available'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusBadgeClassMap[statusKey] || 'text-gray-700 bg-gray-50'}`}>
                                    {activityDetail?.status || 'SUCCESS'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-2">
                                        <Clock className="h-4 w-4" />
                                        Timestamp
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{formatDetailsTimestamp(activityDetail?.timestamp)}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Event
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{activityDetail?.event || '—'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Raw Log Data */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-gray-400">&lt;/&gt;</span>
                                <h3 className="text-lg font-bold text-gray-900">Raw Log Data</h3>
                            </div>
                            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                <pre className="text-sm text-green-400 font-mono">
                                    {JSON.stringify(activityDetail?.rawLog || {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Actor Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Actor Details</h3>

                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={actor.avatar}
                                    alt={actor.name || 'Actor'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{actor.name || 'Unknown actor'}</p>
                                    <p className="text-sm text-gray-500">{actor.role || 'Unknown role'}</p>
                                </div>
                            </div>

                            {profileLink ? (
                                <Link
                                    to={profileLink}
                                    className="w-full px-4 py-2 bg-blue-50 text-[#1e5a8f] rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors text-center block"
                                >
                                    View User Profile
                                </Link>
                            ) : (
                                <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold text-center">
                                    No profile link available
                                </div>
                            )}
                        </div>

                        {/* Session Metadata */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Session Metadata</h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <Globe className="h-4 w-4" />
                                        <span>IP Address</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{meta.ip || 'Unknown'}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <Monitor className="h-4 w-4" />
                                        <span>Device / User Agent</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{meta.device || 'Unknown'}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>Location</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{meta.location || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ActivityDetails;
