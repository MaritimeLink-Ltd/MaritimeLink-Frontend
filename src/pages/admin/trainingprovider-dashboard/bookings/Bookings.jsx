import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Anchor, LifeBuoy, Users, Flame, UserCircle } from 'lucide-react';

export default function Bookings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Mock data for bookings
    const bookings = [
        {
            id: 'FRB-001',
            course: 'Fast Rescue Boat Operator',
            sessionCode: 'Test Session • FRB-001',
            date: '5-7 June',
            status: '13/12',
            location: 'Aberdeen',
            booked: 10,
            capacity: 12,
            bookingStatus: 'Pending',
            icon: LifeBuoy,
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-50',
            isUpcoming: true
        },
        {
            id: 'CSA-02',
            course: 'Confined Space Awareness',
            sessionCode: 'Afeit • CSA-02',
            date: 'No upcoming session',
            status: '',
            location: 'Aberdeen',
            booked: 20,
            capacity: 20,
            bookingStatus: 'Full',
            icon: Anchor,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            isUpcoming: false
        },
        {
            id: 'SBS-03',
            course: 'STCW Basic Safety',
            sessionCode: 'Trat Saten, MV Liverp...',
            date: '15-17 May',
            status: '14/16',
            location: 'Liverpool',
            booked: 14,
            capacity: 16,
            bookingStatus: 'Pending',
            icon: Users,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50',
            isUpcoming: true
        },
        {
            id: 'GWO-04',
            course: 'GWO Sea Survival',
            sessionCode: 'Hsit Saten, MV Aberd...',
            date: '10-12 May',
            status: '14/16',
            location: 'Aberdeen',
            booked: 4,
            capacity: 10,
            bookingStatus: 'Open',
            icon: Anchor,
            iconColor: 'text-teal-600',
            iconBg: 'bg-teal-50',
            isUpcoming: true
        },
        {
            id: 'AFF-05',
            course: 'Advanced Firefighting',
            sessionCode: 'Test • AFF-101',
            date: '7-9 May',
            status: '12/12',
            location: 'Aberdeen',
            booked: 12,
            capacity: 12,
            bookingStatus: 'Full',
            icon: Flame,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50',
            isUpcoming: true
        },
        {
            id: 'SSO-06',
            course: 'Ship Safety Officer',
            sessionCode: 'Tlait Saten, MV Aberd...',
            date: '15-17 April',
            status: '8/12',
            location: 'Aberdeen',
            booked: 8,
            capacity: 12,
            bookingStatus: 'Open',
            icon: UserCircle,
            iconColor: 'text-cyan-600',
            iconBg: 'bg-cyan-50',
            isUpcoming: false
        },
        {
            id: 'SBS-07',
            course: 'STCW Basic Safety',
            sessionCode: 'Test • SBS-201',
            date: '15-17 May',
            status: '14/16',
            location: 'Aberdeen',
            booked: 14,
            capacity: 16,
            bookingStatus: 'Pending',
            icon: Users,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50',
            isUpcoming: true
        },
        {
            id: 'MFA-08',
            course: 'Medical First Aid',
            sessionCode: 'MFA-004 • Aberdeen',
            date: '12-14 June',
            status: '5/12',
            location: 'Aberdeen',
            booked: 5,
            capacity: 12,
            bookingStatus: 'Open',
            icon: LifeBuoy,
            iconColor: 'text-pink-600',
            iconBg: 'bg-pink-50',
            isUpcoming: false
        }
    ];

    // Get upcoming count for tab display
    const upcomingCount = bookings.filter(b => b.isUpcoming).length;

    // Filter bookings based on search, tab, and filters
    const filteredBookings = bookings.filter(booking => {
        // Tab filter
        if (activeTab === 'upcoming') {
            if (!booking.isUpcoming) return false;
        } else if (activeTab === 'past') {
            if (booking.isUpcoming) return false;
        }
        // 'all' tab shows everything

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesCourse = booking.course.toLowerCase().includes(query);
            const matchesSession = booking.sessionCode.toLowerCase().includes(query);
            const matchesLocation = booking.location.toLowerCase().includes(query);
            const matchesId = booking.id.toLowerCase().includes(query);
            if (!matchesCourse && !matchesSession && !matchesLocation && !matchesId) return false;
        }

        // Region filter
        if (regionFilter) {
            if (regionFilter === 'aberdeen' && booking.location !== 'Aberdeen') return false;
            if (regionFilter === 'liverpool' && booking.location !== 'Liverpool') return false;
        }

        // Status filter
        if (statusFilter) {
            if (statusFilter === 'full' && booking.bookingStatus !== 'Full') return false;
            if (statusFilter === 'pending' && booking.bookingStatus !== 'Pending') return false;
            if (statusFilter === 'open' && booking.bookingStatus !== 'Open') return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const getProgressColor = (current, total) => {
        const percentage = (current / total) * 100;
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 70) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getStatusColor = (status) => {
        if (status === 'Full') return 'text-red-500';
        if (status === 'Pending') return 'text-orange-500';
        return 'text-green-500';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage course session bookings and respond to candidate enquiries</p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
                {/* Filters Row */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
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

                        {/* Tab Buttons & Filters */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
                                    { key: 'past', label: 'Past' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Region Filter */}
                            <div className="relative">
                                <select
                                    value={regionFilter}
                                    onChange={(e) => {
                                        setRegionFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer">
                                    <option value="">My Region</option>
                                    <option value="aberdeen">Aberdeen</option>
                                    <option value="liverpool">Liverpool</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer">
                                    <option value="">Status</option>
                                    <option value="full">Full</option>
                                    <option value="pending">Pending</option>
                                    <option value="open">Open</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
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
                                    {/* Course */}
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

                                    {/* Session */}
                                    <td className="px-6 py-4">
                                        {booking.date !== 'No upcoming session' ? (
                                            <div className="w-32">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{booking.date}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getProgressColor(booking.booked, booking.capacity)}`}
                                                        style={{ width: `${(booking.booked / booking.capacity) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-[10px] text-gray-400">{booking.status}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">No upcoming session</span>
                                        )}
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{booking.location}</span>
                                    </td>

                                    {/* Capacity */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600 min-w-[40px]">
                                                {booking.booked} / {booking.capacity}
                                            </span>
                                            {booking.bookingStatus && booking.bookingStatus !== 'Open' && (
                                                <span className={`text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                    {booking.bookingStatus}
                                                </span>
                                            )}
                                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getProgressColor(booking.booked, booking.capacity)} rounded-full transition-all`}
                                                    style={{ width: `${(booking.booked / booking.capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Actions */}
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
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredBookings.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredBookings.length)}</span> of <span className="font-semibold">{filteredBookings.length}</span> entries
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="h-11 w-12 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                        >
                            ←
                        </button>
                        <button className="h-11 w-11 rounded-xl bg-[#1e5a8f] text-white font-semibold">
                            {currentPage}
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
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
