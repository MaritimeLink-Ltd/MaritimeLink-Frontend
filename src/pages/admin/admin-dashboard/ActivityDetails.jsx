import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, CheckCircle, Monitor, MapPin, Globe } from 'lucide-react';

function ActivityDetails() {
    const { id } = useParams();

    const navigate = useNavigate();

    // Sample activity detail data (in real app, this would be fetched based on id)
    const activityDetail = {
        id: id,
        logId: 'ID#1',
        event: 'Job Posted',
        description: 'Published new job listing "Chief Engineer"',
        status: 'SUCCESS',
        statusColor: 'text-green-600',
        statusBg: 'bg-green-50',
        timestamp: 'Oct 24, 10:42:15',
        category: 'User',
        actor: {
            name: 'Sarah Jenkins',
            role: 'Recruiter',
            avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="%230D8ABC" width="40" height="40"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="16" text-anchor="middle">SJ</text></svg>'
        },
        session: {
            ip: '192.168.1.42',
            device: 'Chrome / Windows',
            location: 'London, UK'
        },
        rawLog: {
            id: '1',
            timestamp: '2026-01-24T10:42:15.012Z',
            event: 'Job Posted',
            status: 'Success',
            actor: {
                name: 'Sarah Jenkins',
                avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="%230D8ABC" width="40" height="40"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="16" text-anchor="middle">SJ</text></svg>',
                role: 'Recruiter'
            },
            meta: {
                ip: '192.168.1.42',
                device: 'Chrome / Windows',
                location: 'London, UK'
            }
        }
    };

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
                    <p className="text-sm text-gray-500">Log {activityDetail.logId}</p>
                </div>
            </div>

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
                                    <h2 className="text-xl font-bold text-gray-900">{activityDetail.event}</h2>
                                    <p className="text-sm text-gray-500">{activityDetail.description}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activityDetail.statusColor} ${activityDetail.statusBg} uppercase`}>
                                {activityDetail.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-2">
                                    <Clock className="h-4 w-4" />
                                    Timestamp
                                </div>
                                <p className="text-sm font-medium text-gray-900">{activityDetail.timestamp}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase mb-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Category
                                </div>
                                <p className="text-sm font-medium text-gray-900">{activityDetail.category}</p>
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
                                {JSON.stringify(activityDetail.rawLog, null, 2)}
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
                                src={activityDetail.actor.avatar}
                                alt={activityDetail.actor.name}
                                className="w-12 h-12 rounded-full"
                            />
                            <div>
                                <p className="font-semibold text-gray-900">{activityDetail.actor.name}</p>
                                <p className="text-sm text-gray-500">{activityDetail.actor.role}</p>
                            </div>
                        </div>

                        <Link
                            to={`/admin/accounts/1`}
                            className="w-full px-4 py-2 bg-blue-50 text-[#1e5a8f] rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors text-center block"
                        >
                            View User Profile
                        </Link>
                    </div>

                    {/* Session Metadata */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Session Metadata</h3>

                        <div className="space-y-4">
                            {/* IP Address */}
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                    <Globe className="h-4 w-4" />
                                    <span>IP Address</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{activityDetail.session.ip}</p>
                            </div>

                            {/* Device / User Agent */}
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                    <Monitor className="h-4 w-4" />
                                    <span>Device / User Agent</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{activityDetail.session.device}</p>
                            </div>

                            {/* Location */}
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>Location</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{activityDetail.session.location}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityDetails;
