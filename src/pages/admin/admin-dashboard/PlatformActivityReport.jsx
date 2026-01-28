import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Download,
    ChevronDown
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

function PlatformActivityReport() {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState('Last 7 Days');

    // Weekly Engagement Data
    const weeklyData = [
        { day: 'Mon', Applications: 45, JobsPosted: 25, Courses: 15 },
        { day: 'Tue', Applications: 60, JobsPosted: 10, Courses: 35 },
        { day: 'Wed', Applications: 75, JobsPosted: 15, Courses: 30 },
        { day: 'Thu', Applications: 85, JobsPosted: 20, Courses: 25 },
        { day: 'Fri', Applications: 70, JobsPosted: 40, Courses: 20 },
        { day: 'Sat', Applications: 35, JobsPosted: 20, Courses: 15 },
        { day: 'Sun', Applications: 30, JobsPosted: 25, Courses: 10 }
    ];

    // User Traffic Data (Today)
    const trafficData = [
        { time: '00:00', users: 150 },
        { time: '04:00', users: 100 },
        { time: '08:00', users: 450 },
        { time: '12:00', users: 850 },
        { time: '16:00', users: 950 },
        { time: '20:00', users: 600 },
        { time: '23:59', users: 250 }
    ];

    // Event Log Data
    const eventLogs = [
        {
            id: 1,
            eventType: 'Bulk Job Import',
            user: 'Admin System',
            timestamp: '10:42 AM',
            status: 'Success',
            statusColor: 'text-green-600 bg-green-50'
        },
        {
            id: 2,
            eventType: 'User Registration',
            user: 'New Recruiter',
            timestamp: '10:38 AM',
            status: 'Pending Review',
            statusColor: 'text-orange-600 bg-orange-50'
        },
        {
            id: 3,
            eventType: 'Course Purchase',
            user: 'John Doe',
            timestamp: '10:15 AM',
            status: 'Completed',
            statusColor: 'text-green-600 bg-green-50'
        },
        {
            id: 4,
            eventType: 'Login Attempt',
            user: 'Unknown IP',
            timestamp: '09:55 AM',
            status: 'Failed',
            statusColor: 'text-red-600 bg-red-50'
        },
        {
            id: 5,
            eventType: 'Document Upload',
            user: 'Sarah Smith',
            timestamp: '09:30 AM',
            status: 'Success',
            statusColor: 'text-green-600 bg-green-50'
        }
    ];

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

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Calendar className="h-4 w-4" />
                            {dateRange}
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1e5a8f] text-white rounded-xl text-sm font-bold hover:bg-[#164a7a] transition-colors shadow-sm">
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
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                                domain={[0, 100]}
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
                    <h2 className="text-lg font-bold text-gray-900 mb-6">User Traffic (Today)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                                domain={[0, 1000]}
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
                    <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                        View All Logs
                    </button>
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
                            {eventLogs.map((log) => (
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
                                        <button className="text-sm font-bold text-[#1e5a8f] hover:underline">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PlatformActivityReport;
