import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ChevronDown,
    Anchor,
    LifeBuoy,
    Users,
    Flame,
    UserCircle,
    Loader2,
} from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const iconOptions = [
    { icon: LifeBuoy, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
    { icon: Anchor, iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
    { icon: Users, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    { icon: Flame, iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
    { icon: UserCircle, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50' },
];

function formatDateRange(sessions, bookedAt) {
    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
    const startRaw = session?.startDate || bookedAt;
    if (!startRaw) return 'No session date';
    const start = new Date(startRaw);
    if (Number.isNaN(start.getTime())) return 'No session date';
    const end = session?.endDate ? new Date(session.endDate) : null;
    const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!end || Number.isNaN(end.getTime()) || end.toDateString() === start.toDateString()) {
        return startLabel;
    }
    return `${startLabel} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function statusLabel(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CONFIRMED') return 'Pending Approval';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'PENDING') return 'Pending Approval';
    return status || 'Unknown';
}

function mapBooking(booking, index) {
    const session = Array.isArray(booking.sessions) && booking.sessions.length > 0 ? booking.sessions[0] : null;
    const capacity = Number(session?.totalSeats || booking.course?.capacity || 1) || 1;
    const available = Number(session?.availableSeats);
    const booked = Number.isFinite(available) ? Math.max(0, capacity - available) : 1;
    const startDate = session?.startDate ? new Date(session.startDate) : null;
    const isUpcoming = startDate && !Number.isNaN(startDate.getTime()) ? startDate >= new Date() : false;
    const iconMeta = iconOptions[index % iconOptions.length];

    return {
        id: booking.id,
        course: booking.course?.title || 'Untitled course',
        sessionCode: session?.id ? `Session ${session.id.slice(0, 8)}` : `Booking ${String(booking.id || '').slice(0, 8)}`,
        date: formatDateRange(booking.sessions, booking.bookedAt || booking.createdAt),
        location: session?.location || booking.course?.location || 'Location not set',
        booked,
        capacity,
        bookingStatus: statusLabel(booking.bookingStatus),
        statusRaw: booking.bookingStatus,
        isUpcoming,
        ...iconMeta,
    };
}

export default function Bookings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        async function loadBookings() {
            setIsLoading(true);
            setError('');
            try {
                const res = await httpClient.get(API_ENDPOINTS.TRAINER.BOOKINGS);
                const rows = res.data?.data?.bookings || res.data?.bookings || [];
                if (mounted) setBookings(Array.isArray(rows) ? rows.map(mapBooking) : []);
            } catch (err) {
                if (mounted) {
                    setError(err.response?.data?.message || 'Unable to load bookings.');
                    setBookings([]);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadBookings();
        return () => {
            mounted = false;
        };
    }, []);

    const regions = useMemo(
        () => Array.from(new Set(bookings.map((b) => b.location).filter(Boolean))),
        [bookings]
    );

    const upcomingCount = bookings.filter((b) => b.isUpcoming).length;

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === 'upcoming' && !booking.isUpcoming) return false;
        if (activeTab === 'past' && booking.isUpcoming) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches =
                booking.course.toLowerCase().includes(query) ||
                booking.sessionCode.toLowerCase().includes(query) ||
                booking.location.toLowerCase().includes(query) ||
                booking.id.toLowerCase().includes(query);
            if (!matches) return false;
        }

        if (regionFilter && booking.location !== regionFilter) return false;
        if (statusFilter && String(booking.statusRaw || '').toUpperCase() !== statusFilter) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const safePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    const getProgressColor = (current, total) => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 70) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getStatusColor = (status) => {
        if (status === 'Cancelled') return 'text-red-500';
        if (status === 'Pending') return 'text-orange-500';
        if (status === 'Completed' || status === 'Confirmed') return 'text-green-600';
        return 'text-gray-600';
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage course session bookings and respond to candidate enquiries</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
                                    { key: 'past', label: 'Past' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            activeTab === tab.key
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <select
                                    value={regionFilter}
                                    onChange={(e) => {
                                        setRegionFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="">My Region</option>
                                    {regions.map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="">Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Loading bookings...
                        </div>
                    ) : error ? (
                        <div className="h-64 flex items-center justify-center text-sm text-red-600">{error}</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming Session</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bookings & Capacity</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${booking.iconBg} flex items-center justify-center`}>
                                                    <booking.icon className={`h-5 w-5 ${booking.iconColor}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{booking.course}</p>
                                                    <p className="text-xs text-gray-400">{booking.sessionCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-32">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{booking.date}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getProgressColor(booking.booked, booking.capacity)}`}
                                                        style={{ width: `${Math.min(100, (booking.booked / booking.capacity) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{booking.location}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 min-w-[40px]">
                                                    {booking.booked} / {booking.capacity}
                                                </span>
                                                <span className={`text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                    {booking.bookingStatus}
                                                </span>
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getProgressColor(booking.booked, booking.capacity)} rounded-full transition-all`}
                                                        style={{ width: `${Math.min(100, (booking.booked / booking.capacity) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/trainingprovider/bookings/${booking.id}`)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredBookings.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredBookings.length)}</span> of <span className="font-semibold">{filteredBookings.length}</span> entries
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={safePage === 1}
                            className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                        >
                            ←
                        </button>
                        <button className="h-11 w-11 rounded-xl bg-[#1e5a8f] text-white font-semibold">
                            {safePage}
                        </button>
                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={safePage === totalPages || totalPages === 0}
                            className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
