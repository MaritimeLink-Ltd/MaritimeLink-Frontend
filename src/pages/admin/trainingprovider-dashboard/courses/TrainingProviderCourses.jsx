import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Calendar,
    Users,
    DollarSign,
    Search,
    ChevronDown
} from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const statusStyles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    neutral: 'bg-gray-100 text-gray-600'
};

const PAGE_SIZE = 8;

function getSessionBookingMetrics(session) {
    const bookings = Array.isArray(session?.bookings) ? session.bookings : [];
    if (bookings.length === 0) {
        return {
            booked: Number(session?.bookedCount ?? session?.confirmedBookings ?? 0) || 0,
            revenue: Number(session?.revenue ?? session?.paidRevenue ?? 0) || 0,
        };
    }

    const activeBookings = bookings.filter((booking) =>
        ['CONFIRMED', 'COMPLETED'].includes(String(booking.bookingStatus || '').toUpperCase())
    );
    const paidBookings = bookings.filter(
        (booking) => String(booking.paymentStatus || '').toUpperCase() === 'SUCCEEDED'
    );

    return {
        booked: activeBookings.length,
        revenue: paidBookings.reduce((sum, booking) => sum + (Number(booking.amountPaid) || 0), 0),
    };
}

function TrainingProviderCourses() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [coursesList, setCoursesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const dynamicOverviewCards = useMemo(() => {
        const totalCourses = coursesList.length;
        const totalSessions = coursesList.reduce((acc, course) => acc + course.sessions, 0);
        const totalBookings = coursesList.reduce((acc, course) => acc + course.bookings, 0);
        const totalRevenue = coursesList.reduce((acc, course) => acc + (course.revenueValue || 0), 0);
        const currencySymbol = coursesList.find((course) => course.currencySymbol)?.currencySymbol || '$';

        return [
            {
                id: 1,
                label: 'Course Management',
                value: totalCourses.toString(),
                icon: BookOpen,
                accent: 'bg-blue-50 text-blue-600'
            },
            {
                id: 2,
                label: 'Total Sessions',
                value: totalSessions.toString(),
                icon: Calendar,
                accent: 'bg-amber-50 text-amber-600'
            },
            {
                id: 3,
                label: 'Bookings',
                value: totalBookings.toString(),
                icon: Users,
                accent: 'bg-emerald-50 text-emerald-600'
            },
            {
                id: 4,
                label: 'Revenue',
                value: `${currencySymbol}${totalRevenue.toLocaleString()}`,
                icon: DollarSign,
                accent: 'bg-emerald-50 text-emerald-600'
            }
        ];
    }, [coursesList]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const response = await httpClient.get(API_ENDPOINTS.COURSES.MY);
                if (response.status === 'success' && response.data?.courses) {
                    const formattedCourses = response.data.courses.map(course => {
                        const sessions = course.sessions || [];
                        const sessionsCount = sessions.length;
                        
                        let totalSeats = course.capacity || 0;
                        if (totalSeats === 0 && sessionsCount > 0) {
                            totalSeats = sessions.reduce((sum, s) => sum + (Number(s.totalSeats) || 0), 0);
                        }

                        const sessionMetrics = sessions.reduce(
                            (acc, session) => {
                                const metrics = getSessionBookingMetrics(session);
                                return {
                                    bookings: acc.bookings + metrics.booked,
                                    revenue: acc.revenue + metrics.revenue,
                                };
                            },
                            { bookings: 0, revenue: 0 }
                        );

                        const numericPrice = Number(course.price || 0);
                        const bookings = sessionMetrics.bookings || course.enrolledCount || 0;
                        const revenueValue = sessionMetrics.revenue || numericPrice * bookings;
                        const currencySymbol =
                            course.currency === 'USD' ? '$' : course.currency === 'GBP' ? '£' : '';

                        return {
                            id: course.id,
                            name: course.title,
                            instructor: 'TBD',
                            certificateType: course.category || course.courseType,
                            sessions: sessionsCount,
                            totalSeats: totalSeats,
                            bookings: bookings,
                            createdAt: course.createdAt,
                            bookingsTag: null,
                            revenueValue: revenueValue,
                            currencySymbol,
                            revenue: `${currencySymbol}${revenueValue.toLocaleString()}`,
                            status: course.status === 'ACTIVE' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : course.status,
                            statusVariant: course.status === 'ACTIVE' ? 'success' : course.status === 'DRAFT' ? 'neutral' : 'warning',
                            icon: BookOpen,
                            iconBg: 'bg-blue-50 text-blue-600',
                            iconColor: 'fill-[#1e5a8f]'
                        };
                    });
                    // Sort by newest first
                    formattedCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setCoursesList(formattedCourses);
                }
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return coursesList.filter((course) => {
            const matchesSearch =
                !term ||
                course.name?.toLowerCase().includes(term) ||
                course.certificateType?.toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === 'all' ? true : course.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, coursesList]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, pageCount);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const visibleCourses = filteredCourses.slice(startIndex, endIndex);

    const handleChangePage = (page) => {
        if (page < 1 || page > pageCount || page === safeCurrentPage) return;
        setCurrentPage(page);
    };

    const paginationItems = useMemo(() => {
        if (pageCount <= 5) {
            return Array.from({ length: pageCount }, (_, idx) => idx + 1);
        }

        return [1, 2, 'ellipsis', pageCount];
    }, [pageCount]);

    const handleExportCSV = (courses = filteredCourses) => {
        if (!courses.length) return;

        const headers = [
            'Course Name',
            'Certificate Type',
            'Sessions',
            'Total Seats',
            'Bookings',
            'Revenue',
            'Status'
        ];

        const rows = courses.map((course) => [
            course.name,
            course.certificateType,
            course.sessions,
            course.totalSeats,
            course.bookings,
            course.revenue,
            course.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `training_provider_courses_${new Date()
            .toISOString()
            .split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
                        Course Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your maritime training offerings at a glance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
                        onClick={() => handleExportCSV(filteredCourses)}
                    >
                        <span>Export CSV</span>
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003971] text-white text-sm font-semibold shadow-sm hover:bg-[#002455]"
                        onClick={() => navigate('/trainingprovider/courses/create')}
                    >
                        <span className="text-lg leading-none">+</span>
                        <span>Create Course</span>
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {dynamicOverviewCards.map((card) => (
                    <div
                        key={card.id}
                        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm"
                    >
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {card.label}
                            </p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                                {card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Table */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                {/* Table Header Controls */}
                <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-full sm:max-w-md">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archived</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-5 py-3">Course Name</th>
                                <th className="px-4 py-3 whitespace-nowrap">Certificate Type</th>
                                <th className="px-4 py-3 text-right">Sessions</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Total Seats</th>
                                <th className="px-4 py-3 text-right">Bookings</th>
                                <th className="px-4 py-3 text-right">Revenue</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCourses.map((course, index) => {
                                const isLast = index === visibleCourses.length - 1;
                                const StatusIcon = course.icon;

                                return (
                                    <tr
                                        key={course.id}
                                        className={`text-sm ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${course.iconBg}`}>
                                                    <StatusIcon className={`h-5 w-5 ${course.iconColor}`} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {course.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {course.instructor}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-middle">
                                            <p className="text-sm text-gray-700">
                                                {course.certificateType}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right text-gray-700 font-medium">
                                            {course.sessions}
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right text-gray-700 font-medium">
                                            {course.totalSeats}
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right text-gray-700 font-medium">
                                            <div className="inline-flex items-center justify-end gap-2 min-w-[72px]">
                                                <span>{course.bookings}</span>
                                                {course.bookingsTag && (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${course.bookingsTag.className}`}
                                                    >
                                                        {course.bookingsTag.label}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right text-gray-900 font-semibold">
                                            {course.revenue}
                                        </td>
                                        <td className="px-4 py-4 align-middle text-center">
                                            <span
                                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[course.statusVariant] || statusStyles.neutral}`}
                                            >
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/trainingprovider/courses/${course.id}`)}
                                                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-[#EBF3FF] text-[#003971] hover:bg-[#d7e6ff] transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredCourses.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-10 text-center text-sm text-gray-500"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-[#003971]" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading courses...
                                            </div>
                                        ) : (
                                            'No courses match your search or you have not created any courses.'
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
                    <p>
                        {filteredCourses.length > 0 ? (
                            <>
                                Showing{' '}
                                <span className="font-semibold">
                                    {startIndex + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-semibold">
                                    {Math.min(filteredCourses.length, endIndex)}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold">
                                    {filteredCourses.length}
                                </span>{' '}
                                courses
                            </>
                        ) : (
                            <>
                                Showing{' '}
                                <span className="font-semibold">0</span> of{' '}
                                <span className="font-semibold">0</span> courses
                            </>
                        )}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 disabled:opacity-50 disabled:cursor-default"
                            disabled={safeCurrentPage === 1}
                            onClick={() => handleChangePage(safeCurrentPage - 1)}
                        >
                            Prev
                        </button>
                        {paginationItems.map((item, idx) =>
                            item === 'ellipsis' ? (
                                <span key={`ellipsis-${idx}`} className="px-1">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => handleChangePage(item)}
                                    className={`h-8 px-3 rounded-lg text-xs font-semibold ${item === safeCurrentPage
                                        ? 'bg-[#003971] text-white'
                                        : 'border border-gray-200 bg-white text-gray-600'
                                        }`}
                                >
                                    {item}
                                </button>
                            )
                        )}
                        <button
                            type="button"
                            className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 disabled:opacity-50 disabled:cursor-default"
                            disabled={safeCurrentPage === pageCount || filteredCourses.length === 0}
                            onClick={() => handleChangePage(safeCurrentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrainingProviderCourses;
