import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';

const sessionMeta = {
  courseName: 'STCW Basic Safety',
  dates: '15 – 17 May',
  seats: '14 / 16',
  revenue: '$3,150',
};

const attendeesMock = [
  {
    id: 1,
    name: 'James Wilson',
    role: 'Third Officer',
    payment: 'Paid',
    paymentOk: true,
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Sarah Evans',
    role: 'Able Seaman',
    payment: 'Paid',
    paymentOk: true,
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Michael Brown',
    role: 'Second Officer',
    payment: 'Paid',
    paymentOk: true,
    status: 'Approved',
  },
  {
    id: 4,
    name: 'Laura Harris',
    role: 'Deck Cadet',
    payment: 'Paid',
    paymentOk: true,
    status: 'Pending',
  },
  {
    id: 5,
    name: 'Dr David Smith',
    role: 'Ship Doctor',
    payment: 'Paid',
    paymentOk: true,
    status: 'Approved',
  },
  {
    id: 6,
    name: 'Andrew Morris',
    role: 'Chief Officer',
    payment: 'Paid',
    paymentOk: true,
    status: 'Approved',
  },
  {
    id: 7,
    name: 'Olivia Taylor',
    role: 'Able Seaman',
    payment: 'Paid',
    paymentOk: false,
    status: 'Cancelled',
  },
];

const statusChipClasses = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};

export default function SessionAttendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  const pendingCount = attendeesMock.filter((a) => a.status === 'Pending').length;
  const approvedCount = attendeesMock.filter((a) => a.status === 'Approved').length;
  const cancelledCount = attendeesMock.filter((a) => a.status === 'Cancelled').length;

  const filteredAttendees = attendeesMock.filter((attendee) => {
    if (activeTab === 'pending' && attendee.status !== 'Pending') return false;
    if (activeTab === 'approved' && attendee.status !== 'Approved') return false;
    if (activeTab === 'cancelled' && attendee.status !== 'Cancelled') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        attendee.name.toLowerCase().includes(term) ||
        attendee.role.toLowerCase().includes(term)
      );
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hover:text-[#003971] font-medium"
        >
          Session Management
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Manage Attendees</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900 mb-1">
            Manage Attendees
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs font-semibold">
              {sessionMeta.courseName}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {sessionMeta.dates}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
              <Users className="h-3.5 w-3.5 mr-1" />
              {sessionMeta.seats}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              {sessionMeta.revenue}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-semibold ${activeTab === 'all'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-full font-semibold ${activeTab === 'pending'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-full font-semibold ${activeTab === 'approved'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 py-1.5 rounded-full font-semibold ${activeTab === 'cancelled'
                ? 'bg-[#003971] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee, index) => {
                const isLast = index === filteredAttendees.length - 1;
                const statusClass =
                  statusChipClasses[attendee.status] || statusChipClasses.Pending;

                return (
                  <tr
                    key={attendee.id}
                    className={`text-sm ${!isLast ? 'border-b border-gray-50' : ''
                      } hover:bg-gray-50/60 transition-colors`}
                  >
                    <td className="px-5 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {attendee.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {attendee.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attendee.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-800">{attendee.payment}</span>
                        {attendee.paymentOk ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}
                      >
                        {attendee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/trainingprovider/candidate/${attendee.id}`, { state: { fromAttendance: true } })}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/trainingprovider/chats')}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAttendees.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No attendees match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
          <p>
            Showing{' '}
            <span className="font-semibold">
              {filteredAttendees.length ? 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold">
              {filteredAttendees.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold">
              {attendeesMock.length}
            </span>{' '}
            attendees
          </p>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedAttendee(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Reject Attendee?
            </h3>
            <p className="text-gray-600 mb-6">
              This will mark the attendee as rejected for this session.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason"
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedAttendee(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) return;
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedAttendee(null);
                  // Action to reject the attendee would go here
                }}
                disabled={!rejectReason.trim()}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

