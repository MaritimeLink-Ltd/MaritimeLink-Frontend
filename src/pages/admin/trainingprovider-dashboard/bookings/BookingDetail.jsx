import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Calendar, MapPin, Search, Download, Printer, Mail, Plus } from 'lucide-react';

export default function BookingDetail() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

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

    return (
        <div className="h-full flex flex-col">
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
                    <button className="px-5 py-2 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">
                        Cancel Session
                    </button>
                    <button className="px-5 py-2 text-sm font-medium rounded-md bg-[#003971] text-white hover:bg-[#002855] flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Booking
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
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
                            <select className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer">
                                <option value="">Payment</option>
                                <option value="paid">Paid</option>
                                <option value="invoice">Invoice Sent</option>
                                <option value="refunded">Refunded</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Printer className="h-4 w-4 text-gray-500" /> Print List
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="h-4 w-4 text-gray-500" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
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
                            {trainees.map((trainee) => (
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
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
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
                        <span className="border border-gray-200 rounded px-2 py-1 text-sm">1 - 6</span>
                        <span>of 13 bookings</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                        <button className="min-w-[32px] h-8 text-sm font-medium rounded border bg-white border-gray-300 text-gray-900">1</button>
                        <button className="min-w-[32px] h-8 text-sm font-medium rounded border-transparent text-gray-500 hover:text-gray-700">2</button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
