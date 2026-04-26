import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Users,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  X,
  UserCheck,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

function normalizeBookingStatus(raw) {
  const s = String(raw || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'APPROVED' || s === 'COMPLETED') return 'confirmed';
  if (s === 'CANCELLED' || s === 'REJECTED' || s === 'DECLINED') return 'cancelled';
  return 'pending';
}

function bookingStatusLabel(raw) {
  const s = String(raw || '').toUpperCase();
  if (s === 'CONFIRMED') return 'Pending Approval';
  if (s === 'APPROVED') return 'Approved';
  if (s === 'COMPLETED') return 'Completed';
  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'REJECTED' || s === 'DECLINED') return 'Rejected';
  if (s === 'PENDING') return 'Pending';
  return raw ? String(raw) : 'Unknown';
}

function paymentLabel(raw) {
  const s = String(raw || '').toUpperCase();
  if (s === 'SUCCEEDED' || s === 'PAID') return 'Paid';
  if (s === 'PENDING') return 'Pending';
  if (s === 'FAILED') return 'Failed';
  return raw ? String(raw) : '—';
}

function paymentOk(raw) {
  const s = String(raw || '').toUpperCase();
  return s === 'SUCCEEDED' || s === 'PAID';
}

function chipClassForStatus(canonical) {
  if (canonical === 'confirmed') return 'bg-emerald-50 text-emerald-700';
  if (canonical === 'cancelled') return 'bg-rose-50 text-rose-700';
  return 'bg-amber-50 text-amber-700';
}

function mapAttendeeRow(a, index) {
  const canonical = normalizeBookingStatus(a.status);
  return {
    key: a.bookingId || `${a.professionalId}-${index}`,
    bookingId: a.bookingId,
    professionalId: a.professionalId,
    name: a.fullname || '—',
    email: a.email || '',
    photo: a.photo || null,
    statusRaw: a.status,
    statusLabel: bookingStatusLabel(a.status),
    canonical,
    paymentRaw: a.paymentStatus,
    paymentLabel: paymentLabel(a.paymentStatus),
    paymentOk: paymentOk(a.paymentStatus),
    sessionHint: null,
    amountLabel: null,
  };
}

function formatSessionHint(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;
  const s = sessions[0];
  if (!s?.startDate) return s?.location || null;
  const start = new Date(s.startDate);
  const end = s.endDate ? new Date(s.endDate) : null;
  const loc = s.location ? ` · ${s.location}` : '';
  if (end && !Number.isNaN(end.getTime()) && !Number.isNaN(start.getTime())) {
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}${loc}`;
  }
  if (!Number.isNaN(start.getTime())) return `${start.toLocaleDateString()}${loc}`;
  return s.location || null;
}

function mapAdminBookingRow(booking, index) {
  const prof = booking.professional || {};
  const pid = prof.id || booking.professionalId;
  const canonical = normalizeBookingStatus(booking.bookingStatus);
  const currency = booking.currency === 'GBP' ? '£' : booking.currency === 'USD' ? '$' : '';
  const amt = booking.amountPaid != null && booking.amountPaid !== '' ? `${currency}${booking.amountPaid}` : null;
  return {
    key: booking.id || `admin-b-${index}`,
    bookingId: booking.id,
    professionalId: pid,
    name: prof.fullname || '—',
    email: prof.email || '',
    photo: null,
    statusRaw: booking.bookingStatus,
    statusLabel: bookingStatusLabel(booking.bookingStatus),
    canonical,
    paymentRaw: booking.paymentStatus,
    paymentLabel: paymentLabel(booking.paymentStatus),
    paymentOk: paymentOk(booking.paymentStatus),
    sessionHint: formatSessionHint(booking.sessions),
    sessionId: Array.isArray(booking.sessions) && booking.sessions[0]?.id ? booking.sessions[0].id : null,
    amountLabel: amt,
  };
}

export default function SessionAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const sessionId =
    location.state?.sessionId || searchParams.get('sessionId') || null;
  const courseId =
    location.state?.courseId || searchParams.get('courseId') || null;
  const courseTitle = location.state?.courseTitle || 'Session';
  const returnPath = location.state?.returnPath;
  const isAdminAttendance = location.pathname.startsWith('/admin/');
  const bookingsFallback = isAdminAttendance ? '/admin/marketplace' : '/trainingprovider/bookings';
  const adminCourseBookingsMode = isAdminAttendance && Boolean(courseId);

  const [attendees, setAttendees] = useState([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(!!(sessionId || adminCourseBookingsMode));
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [approvingBookingId, setApprovingBookingId] = useState(null);

  const loadAttendees = useCallback(async () => {
    if (adminCourseBookingsMode) {
      if (!courseId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await httpClient.get(API_ENDPOINTS.ADMIN.COURSE_BOOKINGS(courseId));
        const list = Array.isArray(res?.data?.bookings) ? res.data.bookings : [];
        setAttendees(list.map(mapAdminBookingRow));
        setResultsTotal(typeof res?.results === 'number' ? res.results : list.length);
      } catch (e) {
        console.error('Failed to load admin course bookings', e);
        setError(e?.message || 'Failed to load attendees');
        setAttendees([]);
        setResultsTotal(0);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await httpClient.get(API_ENDPOINTS.TRAINER.SESSION_ATTENDEES(sessionId));
      const list = Array.isArray(res?.data?.attendees) ? res.data.attendees : [];
      setAttendees(list.map(mapAttendeeRow));
      setResultsTotal(typeof res?.results === 'number' ? res.results : list.length);
    } catch (e) {
      console.error('Failed to load session attendees', e);
      setError(e?.message || 'Failed to load attendees');
      setAttendees([]);
      setResultsTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, courseId, adminCourseBookingsMode]);

  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  const handleApproveAttendee = async (bookingId) => {
    if (adminCourseBookingsMode || !sessionId || !bookingId) return;
    setApprovingBookingId(bookingId);
    try {
      const res = await httpClient.post(
        API_ENDPOINTS.TRAINER.APPROVE_ATTENDEE(sessionId, bookingId),
        {}
      );
      const booking = res?.data?.booking;
      if (booking?.id) {
        setAttendees((prev) =>
          prev.map((row) => {
            if (row.bookingId !== booking.id) return row;
            return {
              ...row,
              statusRaw: booking.bookingStatus,
              statusLabel: bookingStatusLabel(booking.bookingStatus),
              canonical: normalizeBookingStatus(booking.bookingStatus),
              paymentRaw: booking.paymentStatus,
              paymentLabel: paymentLabel(booking.paymentStatus),
              paymentOk: paymentOk(booking.paymentStatus),
            };
          })
        );
      } else {
        await loadAttendees();
      }
      toast.success(res?.message || 'Attendee approved successfully.');
    } catch (e) {
      console.error('Approve attendee failed', e);
      toast.error(e?.message || 'Could not approve attendee.');
    } finally {
      setApprovingBookingId(null);
    }
  };

  const handleRejectAttendee = async (bookingId, isPaid) => {
    if (adminCourseBookingsMode || !sessionId || !bookingId) return;
    const confirmed = window.confirm(
      isPaid
        ? 'Reject this paid booking and refund the professional?'
        : 'Reject this booking?'
    );
    if (!confirmed) return;

    setApprovingBookingId(bookingId);
    try {
      const res = await httpClient.post(
        API_ENDPOINTS.TRAINER.REJECT_ATTENDEE(sessionId, bookingId),
        { reason: isPaid ? 'Trainer rejected paid course booking' : 'Trainer rejected course booking' }
      );
      const booking = res?.data?.booking;
      if (booking?.id) {
        setAttendees((prev) =>
          prev.map((row) => {
            if (row.bookingId !== booking.id) return row;
            return {
              ...row,
              statusRaw: booking.bookingStatus,
              statusLabel: bookingStatusLabel(booking.bookingStatus),
              canonical: normalizeBookingStatus(booking.bookingStatus),
              paymentRaw: booking.paymentStatus,
              paymentLabel: paymentLabel(booking.paymentStatus),
              paymentOk: paymentOk(booking.paymentStatus),
            };
          })
        );
      } else {
        await loadAttendees();
      }
      toast.success(res?.message || 'Attendee rejected successfully.');
    } catch (e) {
      console.error('Reject attendee failed', e);
      toast.error(e?.message || 'Could not reject attendee.');
    } finally {
      setApprovingBookingId(null);
    }
  };

  const pendingCount = useMemo(
    () => attendees.filter((a) => a.canonical === 'pending').length,
    [attendees]
  );
  const approvedCount = useMemo(
    () => attendees.filter((a) => a.canonical === 'confirmed').length,
    [attendees]
  );
  const cancelledCount = useMemo(
    () => attendees.filter((a) => a.canonical === 'cancelled').length,
    [attendees]
  );

  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      if (activeTab === 'pending' && attendee.canonical !== 'pending') return false;
      if (activeTab === 'approved' && attendee.canonical !== 'confirmed') return false;
      if (activeTab === 'cancelled' && attendee.canonical !== 'cancelled') return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          attendee.name.toLowerCase().includes(term) ||
          attendee.email.toLowerCase().includes(term) ||
          String(attendee.bookingId || '').toLowerCase().includes(term) ||
          (attendee.sessionHint && attendee.sessionHint.toLowerCase().includes(term))
        );
      }

      return true;
    });
  }, [attendees, activeTab, searchTerm]);

  const contextIdShort = adminCourseBookingsMode
    ? courseId && courseId.length > 12
      ? `…${courseId.slice(-8)}`
      : courseId || '—'
    : sessionId && sessionId.length > 12
      ? `…${sessionId.slice(-8)}`
      : sessionId || '—';

  if (!sessionId && !adminCourseBookingsMode) {
    return (
      <div className="flex flex-col min-h-full max-w-lg">
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <button
            type="button"
            onClick={() => navigate(returnPath || bookingsFallback)}
            className="hover:text-[#003971] font-medium"
          >
            Session Management
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-gray-700 font-medium mb-2">No session or course selected</p>
          <p className="text-sm text-gray-500 mb-4">
            Open this page from a course (View attendees) or Session Management, or add{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">?sessionId=</code> or{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">?courseId=</code> (admin) to the URL.
          </p>
          <button
            type="button"
            onClick={() => navigate(returnPath || bookingsFallback)}
            className="text-sm font-semibold text-[#003971] hover:underline"
          >
            Go to Session Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Toaster position="top-right" />
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <button
          type="button"
          onClick={() => (returnPath ? navigate(returnPath) : navigate(-1))}
          className="hover:text-[#003971] font-medium"
        >
          Session Management
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">Manage Attendees</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900 mb-1">Manage Attendees</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs font-semibold max-w-[280px] truncate">
              {courseTitle}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold font-mono">
              {adminCourseBookingsMode ? 'Course' : 'Session'} {contextIdShort}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
              <Users className="h-3.5 w-3.5 mr-1" />
              {resultsTotal || attendees.length} attendee{(resultsTotal || attendees.length) !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-500 px-3 py-1 text-xs font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {adminCourseBookingsMode ? 'All bookings for this course' : 'Bookings for this session'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-semibold ${
                activeTab === 'all'
                  ? 'bg-[#003971] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-full font-semibold ${
                activeTab === 'pending'
                  ? 'bg-[#003971] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-full font-semibold ${
                activeTab === 'approved'
                  ? 'bg-[#003971] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 py-1.5 rounded-full font-semibold ${
                activeTab === 'cancelled'
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

        <div className="flex-1 overflow-auto min-h-[160px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#003971]" />
              <p className="text-sm">Loading attendees…</p>
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                type="button"
                onClick={loadAttendees}
                className="text-sm font-semibold text-[#003971] hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 text-left">Attendee</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Booking ID</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee, index) => {
                  const isLast = index === filteredAttendees.length - 1;
                  const statusClass = chipClassForStatus(attendee.canonical);
                  const statusUpper = String(attendee.statusRaw || '').toUpperCase();
                  const canApprovePending =
                    !adminCourseBookingsMode &&
                    statusUpper !== 'COMPLETED' &&
                    statusUpper !== 'CANCELLED' &&
                    attendee.paymentOk;
                  const canReleasePayout = canApprovePending;
                  const canRejectBooking =
                    !adminCourseBookingsMode &&
                    statusUpper !== 'COMPLETED' &&
                    statusUpper !== 'CANCELLED';
                  const initials = attendee.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '?';

                  return (
                    <tr
                      key={attendee.key}
                      className={`text-sm ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}
                    >
                      <td className="px-5 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          {attendee.photo ? (
                            <img
                              src={attendee.photo}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{attendee.name}</p>
                            <p className="text-xs text-gray-500 truncate">Professional · {attendee.professionalId}</p>
                            {attendee.sessionHint ? (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{attendee.sessionHint}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-gray-700">
                        <span className="break-all">{attendee.email || '—'}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-800">{attendee.paymentLabel}</span>
                          {attendee.paymentOk ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                        {attendee.amountLabel ? (
                          <p className="text-xs text-gray-500 mt-1">{attendee.amountLabel}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}
                        >
                          {attendee.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono text-[11px] text-gray-500 break-all">{attendee.bookingId}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          {(canApprovePending || canReleasePayout) && (
                            <button
                              type="button"
                              onClick={() => handleApproveAttendee(attendee.bookingId)}
                              disabled={approvingBookingId === attendee.bookingId}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait"
                            >
                              {approvingBookingId === attendee.bookingId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              {canReleasePayout ? 'Complete / Release payout' : 'Approve'}
                            </button>
                          )}
                          {canRejectBooking && (
                            <button
                              type="button"
                              onClick={() => handleRejectAttendee(attendee.bookingId, attendee.paymentOk)}
                              disabled={approvingBookingId === attendee.bookingId}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-wait"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {attendee.paymentOk ? 'Reject / Refund' : 'Reject'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                isAdminAttendance
                                  ? `/admin/marketplace/candidate/${attendee.professionalId}`
                                  : `/trainingprovider/candidate/${attendee.professionalId}`,
                                {
                                  state: {
                                    fromAttendance: true,
                                    /** Load /api/admin|trainer/bookings/:id (booking detail) for attendee docs + profile */
                                    isProfessionalView: true,
                                    bookingId: attendee.bookingId,
                                    bookingStatus: attendee.statusRaw,
                                    paymentStatus: attendee.paymentRaw,
                                    sessionId: sessionId || attendee.sessionId || undefined,
                                    courseId: courseId || undefined,
                                    adminCourseBookingsMode: adminCourseBookingsMode || false,
                                    returnPath: returnPath || undefined,
                                    courseTitle: courseTitle || undefined,
                                  },
                                }
                              )
                            }
                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(isAdminAttendance ? '/admin/admin-chats' : '/trainingprovider/chats')
                            }
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

                {!isLoading && !error && filteredAttendees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      {attendees.length === 0
                        ? adminCourseBookingsMode
                          ? 'No bookings for this course yet.'
                          : 'No attendees for this session yet.'
                        : 'No attendees match your filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
          <p>
            <span className="font-semibold">{filteredAttendees.length}</span> shown
            {filteredAttendees.length !== attendees.length ? (
              <>
                {' '}
                · <span className="font-semibold">{attendees.length}</span> total loaded
              </>
            ) : null}
            {resultsTotal > 0 && resultsTotal !== attendees.length ? (
              <>
                {' '}
                · API reported <span className="font-semibold">{resultsTotal}</span> results
              </>
            ) : null}
          </p>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
            <button
              type="button"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedAttendee(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Reject Attendee?</h3>
            <p className="text-gray-600 mb-6">
              This will mark the attendee as rejected for this session.
              {selectedAttendee ? (
                <span className="block mt-2 font-medium text-gray-900">{selectedAttendee.name}</span>
              ) : null}
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
                type="button"
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
                type="button"
                onClick={() => {
                  if (!rejectReason.trim()) return;
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedAttendee(null);
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
