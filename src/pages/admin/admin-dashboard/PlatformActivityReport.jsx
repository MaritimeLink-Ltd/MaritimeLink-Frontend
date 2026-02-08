import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Download,
    ChevronDown,
    CheckCircle,
    X,
    Eye,
    Clock,
    User,
    FileText,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Mock Data for different time ranges
const mockReportData = {
    'Today': {
        weekly: [
            { day: '00:00', Applications: 5, JobsPosted: 2, Courses: 1 },
            { day: '04:00', Applications: 8, JobsPosted: 3, Courses: 2 },
            { day: '08:00', Applications: 25, JobsPosted: 8, Courses: 5 },
            { day: '12:00', Applications: 45, JobsPosted: 12, Courses: 8 },
            { day: '16:00', Applications: 38, JobsPosted: 10, Courses: 6 },
            { day: '20:00', Applications: 20, JobsPosted: 5, Courses: 3 }
        ],
        traffic: [
            { time: '00:00', users: 150 }, { time: '04:00', users: 100 },
            { time: '08:00', users: 450 }, { time: '12:00', users: 850 },
            { time: '16:00', users: 950 }, { time: '20:00', users: 600 }
        ],
        logs: [
            { id: 1, eventType: 'Bulk Job Import', user: 'Admin System', timestamp: '10:42 AM', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 2, eventType: 'User Registration', user: 'New Recruiter', timestamp: '10:38 AM', status: 'Pending Review', statusColor: 'text-orange-600 bg-orange-50' },
            { id: 3, eventType: 'Course Purchase', user: 'John Doe', timestamp: '10:15 AM', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
            { id: 4, eventType: 'Login Attempt', user: 'Unknown IP', timestamp: '09:55 AM', status: 'Failed', statusColor: 'text-red-600 bg-red-50' },
            { id: 5, eventType: 'Document Upload', user: 'Sarah Smith', timestamp: '09:30 AM', status: 'Success', statusColor: 'text-green-600 bg-green-50' }
        ]
    },
    '7 Days': {
        weekly: [
            { day: 'Mon', Applications: 45, JobsPosted: 25, Courses: 15 },
            { day: 'Tue', Applications: 60, JobsPosted: 10, Courses: 35 },
            { day: 'Wed', Applications: 75, JobsPosted: 15, Courses: 30 },
            { day: 'Thu', Applications: 85, JobsPosted: 20, Courses: 25 },
            { day: 'Fri', Applications: 70, JobsPosted: 40, Courses: 20 },
            { day: 'Sat', Applications: 35, JobsPosted: 20, Courses: 15 },
            { day: 'Sun', Applications: 30, JobsPosted: 25, Courses: 10 }
        ],
        traffic: [
            { time: 'Mon', users: 1500 }, { time: 'Tue', users: 1800 },
            { time: 'Wed', users: 2200 }, { time: 'Thu', users: 2500 },
            { time: 'Fri', users: 2100 }, { time: 'Sat', users: 1200 },
            { time: 'Sun', users: 900 }
        ],
        logs: [
            { id: 1, eventType: 'Bulk Job Import', user: 'Admin System', timestamp: 'Today, 10:42 AM', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 2, eventType: 'User Registration', user: 'New Recruiter', timestamp: 'Today, 10:38 AM', status: 'Pending Review', statusColor: 'text-orange-600 bg-orange-50' },
            { id: 3, eventType: 'Course Purchase', user: 'John Doe', timestamp: 'Yesterday', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
            { id: 4, eventType: 'Login Attempt', user: 'Unknown IP', timestamp: '2 days ago', status: 'Failed', statusColor: 'text-red-600 bg-red-50' },
            { id: 5, eventType: 'Document Upload', user: 'Sarah Smith', timestamp: '3 days ago', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 6, eventType: 'System Update', user: 'DevOps', timestamp: '5 days ago', status: 'Success', statusColor: 'text-green-600 bg-green-50' }
        ]
    },
    '30 Days': {
        weekly: [
            { day: 'Week 1', Applications: 320, JobsPosted: 150, Courses: 80 },
            { day: 'Week 2', Applications: 450, JobsPosted: 200, Courses: 120 },
            { day: 'Week 3', Applications: 380, JobsPosted: 180, Courses: 95 },
            { day: 'Week 4', Applications: 500, JobsPosted: 220, Courses: 150 }
        ],
        traffic: [
            { time: 'Week 1', users: 5000 }, { time: 'Week 2', users: 7500 },
            { time: 'Week 3', users: 6200 }, { time: 'Week 4', users: 8900 }
        ],
        logs: [
            { id: 11, eventType: 'System Update', user: 'System Admin', timestamp: 'Oct 25', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 12, eventType: 'Bulk User Archive', user: 'Admin User', timestamp: 'Oct 22', status: 'Completed', statusColor: 'text-green-600 bg-green-50' },
            { id: 13, eventType: 'Security Alert', user: 'System', timestamp: 'Oct 18', status: 'Failed', statusColor: 'text-red-600 bg-red-50' },
            { id: 14, eventType: 'Plan Upgrade', user: 'Tech Corp', timestamp: 'Oct 15', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 15, eventType: 'Database Backup', user: 'DevOps', timestamp: 'Oct 10', status: 'Success', statusColor: 'text-green-600 bg-green-50' },
            { id: 16, eventType: 'User Registration', user: 'Bulk Import', timestamp: 'Oct 5', status: 'Success', statusColor: 'text-green-600 bg-green-50' }
        ]
    }
};

function PlatformActivityReport() {
    const navigate = useNavigate();
    const [timeFilter, setTimeFilter] = useState('Today');
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [selectedLog, setSelectedLog] = useState(null);

    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Event Log Filters
    const [eventTypeFilter, setEventTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const showToast = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    };

    // Get current data based on active time filter
    const currentData = mockReportData[timeFilter] || mockReportData['Today'];

    // Filter logs based on selected filters
    const filteredLogs = currentData.logs.filter(log => {
        const eventMatch = eventTypeFilter === 'all' || log.eventType === eventTypeFilter;
        const statusMatch = statusFilter === 'all' || log.status === statusFilter;
        return eventMatch && statusMatch;
    });

    // Get unique event types and statuses for filter dropdowns
    const allEventTypes = [...new Set(Object.values(mockReportData).flatMap(data => data.logs.map(log => log.eventType)))];
    const allStatuses = [...new Set(Object.values(mockReportData).flatMap(data => data.logs.map(log => log.status)))];

    const handleExport = () => {
        // Defines CSV headers
        const headers = ['Event Type', 'User / System', 'Timestamp', 'Status'];

        // Convert data to CSV format
        const csvContent = [
            headers.join(','),
            ...currentData.logs.map(log => [
                log.eventType,
                log.user,
                log.timestamp,
                log.status
            ].join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'platform_activity_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success notification
        showToast('Report exported successfully!');
    };

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[32px] font-bold text-gray-900">Platform Activity Report</h1>
                        <p className="text-gray-500 text-sm mt-1">Detailed breakdown of system events and user engagement</p>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* Success Notification */}
                        {notification.show && (
                            <div className="absolute top-12 right-0 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap animate-in slide-in-from-top-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium text-sm">{notification.message}</span>
                            </div>
                        )}

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

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e5a8f] text-white rounded-xl text-sm font-bold hover:bg-[#164a7a] transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Weekly Engagement Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Weekly Engagement</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={currentData.weekly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            // Auto adjust domain based on data if needed, or keep fixed if range is similar
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
                            />
                            <Bar dataKey="Applications" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="JobsPosted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Courses" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Traffic Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">User Traffic</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={currentData.traffic}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#1e5a8f"
                                strokeWidth={2}
                                fill="#bfdbfe"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Event Log Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Event Log</h2>

                    <div className="flex items-center gap-3">
                        {/* Event Type Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowEventTypeDropdown(!showEventTypeDropdown);
                                    setShowStatusDropdown(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                            >
                                {eventTypeFilter === 'all' ? 'All Events' : eventTypeFilter}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showEventTypeDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            setEventTypeFilter('all');
                                            setShowEventTypeDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${eventTypeFilter === 'all' ? 'text-[#1e5a8f] font-bold bg-blue-50' : 'text-gray-700'}`}
                                    >
                                        All Events
                                    </button>
                                    {allEventTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setEventTypeFilter(type);
                                                setShowEventTypeDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${eventTypeFilter === type ? 'text-[#1e5a8f] font-bold bg-blue-50' : 'text-gray-700'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowStatusDropdown(!showStatusDropdown);
                                    setShowEventTypeDropdown(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                            >
                                {statusFilter === 'all' ? 'All Status' : statusFilter}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showStatusDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('all');
                                            setShowStatusDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'all' ? 'text-[#1e5a8f] font-bold bg-blue-50' : 'text-gray-700'}`}
                                    >
                                        All Status
                                    </button>
                                    {allStatuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowStatusDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === status ? 'text-[#1e5a8f] font-bold bg-blue-50' : 'text-gray-700'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear Filters */}
                        {(eventTypeFilter !== 'all' || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setEventTypeFilter('all');
                                    setStatusFilter('all');
                                }}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Event Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    User / System
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No events match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {log.eventType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.user}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.timestamp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${log.statusColor}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-sm font-bold text-[#1e5a8f] hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Event Details
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event Type</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedLog.eventType}</p>
                                </div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${selectedLog.statusColor}`}>
                                    {selectedLog.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <User className="h-3 w-3" /> User / System
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">{selectedLog.user}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Timestamp
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">{selectedLog.timestamp}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Activity className="h-3 w-3" /> Additional Details
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    This event was recorded automatically by the system.
                                    {selectedLog.status === 'Failed'
                                        ? ' The operation encountered an error and could not complete. Check server logs for more information.'
                                        : ' The operation completed successfully without any reported issues.'}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}

export default PlatformActivityReport;
