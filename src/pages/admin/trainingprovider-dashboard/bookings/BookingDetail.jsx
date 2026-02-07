import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Calendar, MapPin, Search, Download, Printer, Mail, Plus, X, AlertTriangle } from 'lucide-react';

export default function BookingDetail() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [showExportNotification, setShowExportNotification] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const printRef = useRef(null);

    // Mock data
    const sessionInfo = {
        course: 'Fast Rescue Boat Operator',
        sessionCode: 'Session #FRB-001',
        date: '5-7 June, 2024',
        location: 'Aberdeen Training Center',
        totalBookings: 13,
        totalSeats: 12,
        confirmed: 10,
        confirmedLabel: 'Paid & Verified',
        pending: 2,
        pendingLabel: 'Action Required',
        waitlist: 1,
        waitlistLabel: 'Over Capacity'
    };

    const trainees = [
        { id: '1', name: 'James Wilson', email: 'james@example.com', initials: 'JW', company: 'Maersk Line', role: 'Chief Officer', dateBooked: 'Apr 24, 2024', status: 'Confirmed', payment: 'Paid', statusColor: 'text-green-600', paymentDot: 'bg-green-400' },
        { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', initials: 'SC', company: 'Evergreen Marine', role: 'Second Engineer', dateBooked: 'Apr 25, 2024', status: 'Pending Approval', payment: 'Invoice Sent', statusColor: 'text-orange-500', paymentDot: 'bg-gray-300' },
        { id: '3', name: 'Michael Ross', email: 'michael@example.com', initials: 'MR', company: 'Independent', role: 'Deck Cadet', dateBooked: 'Apr 22, 2024', status: 'Confirmed', payment: 'Paid', statusColor: 'text-green-600', paymentDot: 'bg-green-400' },
        { id: '4', name: 'David Miller', email: 'david@example.com', initials: 'DM', company: 'CMA CGM', role: 'Master', dateBooked: 'Apr 26, 2024', status: 'Waitlist', payment: '', statusColor: 'text-blue-600', paymentDot: 'bg-gray-300' },
        { id: '5', name: 'Emma Thompson', email: 'emma.thompson@example.com', initials: 'ET', company: 'BP Shipping', role: 'Chief Engineer', dateBooked: 'Apr 20, 2024', status: 'Cancelled', payment: 'Refunded', statusColor: 'text-red-500', paymentDot: 'bg-red-400' },
        { id: '6', name: 'Robert Fox', email: 'robert.fox@example.com', initials: 'RF', company: 'Hapag-Lloyd', role: 'Able Seaman', dateBooked: 'Apr 28, 2024', status: 'Confirmed', payment: 'Paid', statusColor: 'text-green-600', paymentDot: 'bg-green-400' }
    ];

    // Filter trainees based on search and filters
    const filteredTrainees = trainees.filter(trainee => {
        // Search filter
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            const matchesName = trainee.name.toLowerCase().includes(query);
            const matchesEmail = trainee.email.toLowerCase().includes(query);
            const matchesCompany = trainee.company.toLowerCase().includes(query);
            const matchesRole = trainee.role.toLowerCase().includes(query);
            if (!matchesName && !matchesEmail && !matchesCompany && !matchesRole) return false;
        }

        // Status filter
        if (statusFilter) {
            if (statusFilter === 'confirmed' && trainee.status !== 'Confirmed') return false;
            if (statusFilter === 'pending' && trainee.status !== 'Pending Approval') return false;
            if (statusFilter === 'waitlist' && trainee.status !== 'Waitlist') return false;
            if (statusFilter === 'cancelled' && trainee.status !== 'Cancelled') return false;
        }

        // Payment filter
        if (paymentFilter) {
            if (paymentFilter === 'paid' && trainee.payment !== 'Paid') return false;
            if (paymentFilter === 'invoice' && trainee.payment !== 'Invoice Sent') return false;
            if (paymentFilter === 'refunded' && trainee.payment !== 'Refunded') return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTrainees = filteredTrainees.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Export to CSV handler
    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Company', 'Role', 'Date Booked', 'Status', 'Payment'];
        const csvData = filteredTrainees.map(trainee => [
            trainee.name,
            trainee.email,
            trainee.company,
            trainee.role,
            trainee.dateBooked,
            trainee.status,
            trainee.payment || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${sessionInfo.course.replace(/\s+/g, '_')}_bookings_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show export notification
        setShowExportNotification(true);
        setTimeout(() => setShowExportNotification(false), 3000);
    };

    // Print handler - prints only the table data
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
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
                        .status-confirmed { color: green; }
                        .status-pending-approval { color: orange; }
                        .status-waitlist { color: blue; }
                        .status-cancelled { color: red; }
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
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredTrainees.map(trainee => `
                                <tr>
                                    <td>${trainee.name}</td>
                                    <td>${trainee.email}</td>
                                    <td>${trainee.company}</td>
                                    <td>${trainee.role}</td>
                                    <td>${trainee.dateBooked}</td>
                                    <td class="status-${trainee.status.toLowerCase().replace(' ', '-')}">${trainee.status}</td>
                                    <td>${trainee.payment || 'N/A'}</td>
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

    // Add Booking handler
    const handleAddBooking = () => {
        alert('Add Booking functionality - Opens a modal/form to manually add a booking for this session');
    };

    // Cancel Session handler
    const handleCancelSession = () => {
        setShowCancelModal(true);
    };

    // Confirm Cancel Session
    const confirmCancelSession = () => {
        setShowCancelModal(false);
        // Navigate back after cancellation
        navigate(-1);
    };

    // View Profile handler
    const handleViewProfile = (trainee) => {
        // Navigate to candidate profile page
        navigate(`/trainingprovider/candidate/${trainee.id || '1'}`);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Export Notification Toast */}
            {showExportNotification && (
                <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-left duration-300">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">CSV Exported Successfully!</span>
                </div>
            )}

            {/* Back Link */}
            <button
                className="flex items-center text-sm text-gray-500 hover:text-blue-700 mb-4"
                onClick={() => navigate('/trainingprovider/bookings')}
            >
                <span className="mr-2">&larr;</span> Back to Bookings
            </button>

            {/* Heading */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{sessionInfo.course}</h1>
                    <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
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
                        onClick={handleCancelSession}
                        className="px-5 py-2 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">
                        Cancel Session
                    </button>
                </div>
            </div>

            {/* Info Cards */}
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
                    <div className="text-xs text-gray-500 mb-1">Waitlist</div>
                    <span className="text-2xl font-bold text-blue-600">{sessionInfo.waitlist}</span>
                    <div className="text-xs text-gray-500 mt-1">{sessionInfo.waitlistLabel}</div>
                </div>
            </div>

            {/* Trainees Table Card */}
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
                {/* Filters Row */}
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
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                            >
                                <option value="">Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending Approval</option>
                                <option value="waitlist">Waitlist</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={paymentFilter}
                                onChange={e => {
                                    setPaymentFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer">
                                <option value="">Payment</option>
                                <option value="paid">Paid</option>
                                <option value="invoice">Invoice Sent</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Printer className="h-4 w-4 text-gray-500" /> Print List
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="h-4 w-4 text-gray-500" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto" ref={printRef}>
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainee Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Booked</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentTrainees.map((trainee) => (
                                <tr key={trainee.id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* Trainee Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base">
                                                {trainee.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{trainee.name}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {trainee.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Company */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-gray-900 text-sm font-medium">{trainee.company}</p>
                                            <p className="text-xs text-gray-400">{trainee.role}</p>
                                        </div>
                                    </td>
                                    {/* Date Booked */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{trainee.dateBooked}</span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${trainee.statusColor}`}>{trainee.status}</span>
                                    </td>
                                    {/* Payment */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {trainee.payment && (
                                                <>
                                                    <span className={`h-2 w-2 rounded-full ${trainee.paymentDot}`}></span>
                                                    <span className="text-sm text-gray-600">{trainee.payment}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewProfile(trainee)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                        <span>of {filteredTrainees.length} bookings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] h-8 text-sm font-medium rounded border ${currentPage === page
                                    ? 'bg-[#003971] border-[#003971] text-white'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Session Warning Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowCancelModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Warning Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 p-4 rounded-full">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Cancel Session?</h3>

                        {/* Message */}
                        <p className="text-gray-600 text-center mb-2">
                            Are you sure you want to cancel this session?
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            <strong>{sessionInfo.course}</strong><br />
                            {sessionInfo.sessionCode} • {sessionInfo.date}
                        </p>

                        {/* Warning Notice */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-sm text-red-700 text-center">
                                ⚠️ All {sessionInfo.totalBookings} participants will be notified. This action cannot be undone.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                                Keep Session
                            </button>
                            <button
                                onClick={confirmCancelSession}
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
