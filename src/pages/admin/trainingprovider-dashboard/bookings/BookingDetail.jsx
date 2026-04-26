import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronDown,
    Calendar,
    MapPin,
    Search,
    Download,
    Printer,
    Mail,
    X,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

function fullName(professional = {}) {
    return professional.fullname || [professional.firstName, professional.middleName, professional.lastName].filter(Boolean).join(' ') || 'Unknown trainee';
}

function initials(name) {
    return String(name || 'T')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'T';
}

function formatDate(raw, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
    if (!raw) return 'Not set';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString(undefined, options);
}

function formatSessionDate(sessions, bookedAt) {
    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
    if (!session?.startDate) return formatDate(bookedAt);
    const start = new Date(session.startDate);
    const end = session.endDate ? new Date(session.endDate) : null;
    if (!end || Number.isNaN(end.getTime()) || end.toDateString() === start.toDateString()) {
        return formatDate(session.startDate);
    }
    return `${formatDate(session.startDate, { month: 'short', day: 'numeric' })} - ${formatDate(session.endDate)}`;
}

function statusLabel(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CONFIRMED') return 'Pending Approval';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'PENDING') return 'Pending Approval';
    return status || 'Unknown';
}

function paymentLabel(payment) {
    const p = String(payment || '').toUpperCase();
    if (p === 'SUCCEEDED' || p === 'PAID') return 'Paid';
    if (p === 'REFUNDED') return 'Refunded';
    if (p === 'FAILED') return 'Failed';
    if (p === 'PENDING') return 'Pending';
    return payment || 'N/A';
}

function statusColor(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'CONFIRMED') return 'text-green-600';
    if (s === 'CANCELLED') return 'text-red-500';
    return 'text-orange-500';
}

function paymentDot(payment) {
    const p = String(payment || '').toUpperCase();
    if (p === 'SUCCEEDED' || p === 'PAID') return 'bg-green-400';
    if (p === 'FAILED' || p === 'REFUNDED') return 'bg-red-400';
    return 'bg-gray-300';
}

function mapBookingToView(booking) {
    const session = Array.isArray(booking.sessions) && booking.sessions.length > 0 ? booking.sessions[0] : null;
    const capacity = Number(session?.totalSeats || booking.course?.capacity || 1) || 1;
    const availableSeats = Number(session?.availableSeats);
    const bookedSeats = Number.isFinite(availableSeats) ? Math.max(0, capacity - availableSeats) : 1;
    const docs = Array.isArray(booking.attachedDocuments) ? booking.attachedDocuments : [];
    const professional = booking.professional || {};
    const name = fullName(professional);

    return {
        sessionInfo: {
            course: booking.course?.title || 'Course booking',
            sessionCode: session?.id ? `Session #${session.id.slice(0, 8)}` : `Booking #${String(booking.id || '').slice(0, 8)}`,
            date: formatSessionDate(booking.sessions, booking.bookedAt || booking.createdAt),
            location: session?.location || booking.course?.location || 'Location not set',
            totalBookings: bookedSeats,
            totalSeats: capacity,
            confirmed: ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(String(booking.bookingStatus || '').toUpperCase()) ? 1 : 0,
            confirmedLabel: 'Paid & verified',
            pending: String(booking.bookingStatus || '').toUpperCase() === 'PENDING' ? 1 : 0,
            pendingLabel: 'Action required',
            waitlist: String(booking.bookingStatus || '').toUpperCase() === 'CANCELLED' ? 1 : 0,
            waitlistLabel: 'Cancelled bookings',
        },
        trainees: [
            {
                id: booking.id,
                bookingId: booking.id,
                professionalId: professional.id || booking.professionalId,
                name,
                email: professional.email || '',
                initials: initials(name),
                company: professional.companyName || 'Independent',
                role: professional.profession || professional.subcategory || 'Maritime professional',
                dateBooked: formatDate(booking.bookedAt || booking.createdAt),
                status: statusLabel(booking.bookingStatus),
                payment: paymentLabel(booking.paymentStatus),
                statusColor: statusColor(booking.bookingStatus),
                paymentDot: paymentDot(booking.paymentStatus),
                documentCount: docs.length,
                sessionId: session?.id,
            },
        ],
    };
}

export default function BookingDetail() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showExportNotification, setShowExportNotification] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const printRef = useRef(null);
    const minVisibleRows = 10;

    useEffect(() => {
        let mounted = true;
        async function loadBooking() {
            setIsLoading(true);
            setError('');
            try {
                const res = await httpClient.get(API_ENDPOINTS.TRAINER.BOOKING_DETAIL(bookingId));
                const row = res.data?.data?.booking || res.data?.booking;
                if (mounted) setBooking(row || null);
            } catch (err) {
                if (mounted) setError(err.response?.data?.message || 'Unable to load booking details.');
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        if (bookingId) loadBooking();
        return () => {
            mounted = false;
        };
    }, [bookingId]);

    const { sessionInfo, trainees } = useMemo(() => {
        if (!booking) {
            return {
                sessionInfo: {
                    course: 'Booking details',
                    sessionCode: 'Loading',
                    date: 'Not set',
                    location: 'Not set',
                    totalBookings: 0,
                    totalSeats: 0,
                    confirmed: 0,
                    confirmedLabel: 'Paid & verified',
                    pending: 0,
                    pendingLabel: 'Action required',
                    waitlist: 0,
                    waitlistLabel: 'Cancelled bookings',
                },
                trainees: [],
            };
        }
        return mapBookingToView(booking);
    }, [booking]);

    const filteredTrainees = trainees.filter((trainee) => {
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            const matches =
                trainee.name.toLowerCase().includes(query) ||
                trainee.email.toLowerCase().includes(query) ||
                trainee.company.toLowerCase().includes(query) ||
                trainee.role.toLowerCase().includes(query);
            if (!matches) return false;
        }

        if (statusFilter) {
            if (statusFilter === 'confirmed' && !['Confirmed', 'Completed'].includes(trainee.status)) return false;
            if (statusFilter === 'pending' && trainee.status !== 'Pending Approval') return false;
            if (statusFilter === 'cancelled' && trainee.status !== 'Cancelled') return false;
        }

        if (paymentFilter) {
            if (paymentFilter === 'paid' && trainee.payment !== 'Paid') return false;
            if (paymentFilter === 'pending' && trainee.payment !== 'Pending') return false;
            if (paymentFilter === 'refunded' && trainee.payment !== 'Refunded') return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
    const safePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTrainees = filteredTrainees.slice(startIndex, endIndex);
    const emptyRows = useMemo(() => {
        if (itemsPerPage < minVisibleRows) return 0;
        return Math.max(0, minVisibleRows - currentTrainees.length);
    }, [currentTrainees.length, itemsPerPage]);

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Company', 'Role', 'Date Booked', 'Status', 'Payment', 'Documents'];
        const csvData = filteredTrainees.map((trainee) => [
            trainee.name,
            trainee.email,
            trainee.company,
            trainee.role,
            trainee.dateBooked,
            trainee.status,
            trainee.payment || 'N/A',
            trainee.documentCount,
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${sessionInfo.course.replace(/\s+/g, '_')}_booking_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>${sessionInfo.course} - Bookings List</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { font-size: 18px; margin-bottom: 5px; }
                        h2 { font-size: 14px; color: #666; margin-bottom: 5px; }
                        h3 { font-size: 12px; color: #888; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f5f5f5; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <h1>${sessionInfo.course}</h1>
                    <h2>${sessionInfo.sessionCode} | ${sessionInfo.date} | ${sessionInfo.location}</h2>
                    <h3>Printed on: ${new Date().toLocaleDateString()}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Trainee Name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Date Booked</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Documents</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredTrainees.map((trainee) => `
                                <tr>
                                    <td>${trainee.name}</td>
                                    <td>${trainee.email}</td>
                                    <td>${trainee.company}</td>
                                    <td>${trainee.role}</td>
                                    <td>${trainee.dateBooked}</td>
                                    <td>${trainee.status}</td>
                                    <td>${trainee.payment || 'N/A'}</td>
                                    <td>${trainee.documentCount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleViewProfile = (trainee) => {
        navigate(`/trainingprovider/candidate/${trainee.professionalId}`, {
            state: {
                fromAttendance: true,
                isProfessionalView: true,
                bookingId: trainee.bookingId,
                sessionId: trainee.sessionId,
                bookingStatus: booking?.bookingStatus,
                returnPath: `/trainingprovider/bookings/${bookingId}`,
                courseTitle: sessionInfo.course,
            },
        });
    };

    if (isLoading) {
        return (
            <div className="h-80 flex items-center justify-center text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading booking details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                    className="mt-4 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate('/trainingprovider/bookings')}
                >
                    Back to Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {showExportNotification && (
                <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-left duration-300">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">CSV Exported Successfully!</span>
                </div>
            )}

            <button
                className="flex items-center text-sm text-gray-500 hover:text-blue-700 mb-4"
                onClick={() => navigate('/trainingprovider/bookings')}
            >
                <span className="mr-2">&larr;</span> Back to Bookings
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{sessionInfo.course}</h1>
                    <div className="text-gray-500 text-sm mt-1 flex items-center gap-2 flex-wrap">
                        <span>{sessionInfo.sessionCode}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{sessionInfo.date}</span>
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{sessionInfo.location}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-5 py-2 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    >
                        Cancel Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{sessionInfo.totalBookings}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{sessionInfo.totalSeats} Seats Total</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Confirmed</div>
                    <span className="text-2xl font-bold text-green-600">{sessionInfo.confirmed}</span>
                    <div className="text-xs text-gray-500 mt-1">{sessionInfo.confirmedLabel}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Pending</div>
                    <span className="text-2xl font-bold text-orange-600">{sessionInfo.pending}</span>
                    <div className="text-xs text-gray-500 mt-1">{sessionInfo.pendingLabel}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Cancelled</div>
                    <span className="text-2xl font-bold text-blue-600">{sessionInfo.waitlist}</span>
                    <div className="text-xs text-gray-500 mt-1">{sessionInfo.waitlistLabel}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending Approval</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={paymentFilter}
                                onChange={(e) => {
                                    setPaymentFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                            >
                                <option value="">Payment</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Printer className="h-4 w-4 text-gray-500" /> Print List
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="h-4 w-4 text-gray-500" /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto" ref={printRef}>
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainee Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Booked</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Docs</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentTrainees.map((trainee) => (
                                <tr key={trainee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base">
                                                {trainee.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{trainee.name}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {trainee.email || 'No email'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-gray-900 text-sm font-medium">{trainee.company}</p>
                                            <p className="text-xs text-gray-400">{trainee.role}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{trainee.dateBooked}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${trainee.statusColor}`}>{trainee.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${trainee.paymentDot}`} />
                                            <span className="text-sm text-gray-600">{trainee.payment}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{trainee.documentCount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewProfile(trainee)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {Array.from({ length: emptyRows }).map((_, idx) => (
                                <tr key={`empty-${safePage}-${idx}`} className="bg-white" aria-hidden="true">
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                    <td className="px-6 py-4">&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Showing</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                        <span>of {filteredTrainees.length} bookings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={safePage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] h-8 text-sm font-medium rounded border ${
                                    safePage === page
                                        ? 'bg-[#003971] border-[#003971] text-white'
                                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={safePage === totalPages || totalPages === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>

            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-xl">
                        <button
                            onClick={() => setShowCancelModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Cancel Session?</h3>
                        <p className="text-gray-600 text-center mb-2">Are you sure you want to cancel this session?</p>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            <strong>{sessionInfo.course}</strong><br />
                            {sessionInfo.sessionCode} • {sessionInfo.date}
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-sm text-red-700 text-center">
                                All {sessionInfo.totalBookings} participants will be notified. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                Keep Session
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    navigate(-1);
                                }}
                                className="px-6 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Cancel Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
