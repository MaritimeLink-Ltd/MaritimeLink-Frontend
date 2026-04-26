import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  Download,
  Plus,
  X,
  AlertTriangle,
  DollarSign,
  Loader2,
} from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

function formatSessionDateRange(start, end) {
  if (!start || !end) return '—';
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '—';
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = `${s.toLocaleString('default', { month: 'short' })} ${s.getDate()}`;
  const right = `${e.toLocaleString('default', { month: 'short' })} ${e.getDate()}, ${e.getFullYear()}`;
  if (sameYear && s.getMonth() === e.getMonth() && s.getDate() === e.getDate()) {
    return `${s.toLocaleString('default', { month: 'short' })} ${s.getDate()}, ${s.getFullYear()}`;
  }
  return `${left} - ${right}`;
}

function toInputDate(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().split('T')[0];
}

function sessionStatusMeta(total, enrolled) {
  const t = Number(total) || 0;
  const b = Math.max(0, Number(enrolled) || 0);
  const available = Math.max(0, t - b);
  if (t <= 0) return { label: 'Open', color: 'text-sky-600' };
  if (available <= 0) return { label: 'Full', color: 'text-gray-600' };
  if (available <= 2) return { label: 'Filling Fast', color: 'text-orange-500' };
  return { label: 'Open', color: 'text-emerald-600' };
}

function getSessionBookingMetrics(session) {
  const bookings = Array.isArray(session?.bookings) ? session.bookings : [];
  if (bookings.length === 0) {
    return {
      booked: Number(session?.bookedCount ?? session?.confirmedBookings ?? 0) || 0,
      pending: Number(session?.pendingBookings ?? session?.pendingApprovals ?? session?.pendingCount ?? 0) || 0,
      revenue: Number(session?.revenue ?? session?.paidRevenue ?? 0) || 0,
    };
  }
  const activeBookings = bookings.filter((booking) =>
    ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(String(booking.bookingStatus || '').toUpperCase())
  );
  const pendingBookings = bookings.filter(
    (booking) => String(booking.bookingStatus || '').toUpperCase() === 'PENDING'
  );
  const paidBookings = bookings.filter(
    (booking) => String(booking.paymentStatus || '').toUpperCase() === 'SUCCEEDED'
  );

  return {
    booked: activeBookings.length,
    pending: pendingBookings.length,
    revenue: paidBookings.reduce((sum, booking) => sum + (Number(booking.amountPaid) || 0), 0),
  };
}

function mapCourseSessionToRow(course, session, idx) {
  const total = Number(session.totalSeats) || 0;
  const bookingMetrics = getSessionBookingMetrics(session);
  let enrolled = bookingMetrics.booked;
  if (Number.isNaN(enrolled)) {
    const avail = Number(session.availableSeats);
    if (!Number.isNaN(avail) && total > 0) enrolled = Math.max(0, total - avail);
    else enrolled = 0;
  }
  const start = session.startDate ? new Date(session.startDate) : null;
  const end = session.endDate ? new Date(session.endDate) : null;
  const dateLabel = formatSessionDateRange(start, end);
  const startT = session.startTime || '';
  const endT = session.endTime || '';
  const timeLabel = startT && endT ? `${startT} - ${endT}` : startT || endT || '—';
  const courseType = course.category || course.courseType || 'Uncategorized';
  const { label: status, color: statusColor } = sessionStatusMeta(total, enrolled);
  const pending =
    bookingMetrics.pending ||
    Number(session.pendingBookings ?? session.pendingApprovals ?? session.pendingCount ?? 0) ||
    0;
  const sid = session.id != null ? String(session.id) : `temp-${idx}`;
  const displayId =
    session.sessionCode || session.referenceCode || (sid.length > 14 ? `…${sid.slice(-8)}` : sid);

  const price = Number(course.price || 0);
  const rowRevenue = bookingMetrics.revenue || price * enrolled;

  return {
    displayId,
    sessionDbId: session.id,
    courseId: course.id,
    courseTitle: course.title || 'Course',
    date: dateLabel,
    time: timeLabel,
    startTime: startT,
    endTime: endT,
    location: session.location || '—',
    courseType,
    pendingApprovals: pending,
    booked: enrolled,
    total,
    status,
    statusColor,
    rawStart: start && !Number.isNaN(start.getTime()) ? start : null,
    rawEnd: end && !Number.isNaN(end.getTime()) ? end : null,
    rowRevenue,
    currency: course.currency || 'USD',
  };
}

async function loadCoursesWithSessions() {
  const response = await httpClient.get(API_ENDPOINTS.COURSES.MY);
  if (response.status !== 'success' || !response.data?.courses) {
    return [];
  }
  const courses = response.data.courses;

  return Promise.all(
    courses.map(async (course) => {
      if (Array.isArray(course.sessions) && course.sessions.length > 0) {
        return course;
      }
      try {
        const sRes = await httpClient.get(API_ENDPOINTS.COURSES.GET_SESSIONS(course.id));
        const sessions =
          sRes?.data?.sessions ?? (Array.isArray(sRes?.data) ? sRes.data : []) ?? [];
        return { ...course, sessions: Array.isArray(sessions) ? sessions : [] };
      } catch {
        return { ...course, sessions: [] };
      }
    })
  );
}

export default function ManageSessions() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCancelledNotification, setShowCancelledNotification] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const loaded = await loadCoursesWithSessions();
      setCourses(loaded);
    } catch (err) {
      console.error('Failed to load sessions', err);
      setFetchError(err?.message || 'Failed to load sessions');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const allRows = useMemo(() => {
    const rows = [];
    courses.forEach((course) => {
      const sessions = Array.isArray(course.sessions) ? course.sessions : [];
      sessions.forEach((session, idx) => {
        rows.push(mapCourseSessionToRow(course, session, idx));
      });
    });
    rows.sort((a, b) => {
      const ta = a.rawStart?.getTime() ?? 0;
      const tb = b.rawStart?.getTime() ?? 0;
      return ta - tb;
    });
    return rows;
  }, [courses]);

  const courseTypeOptions = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      const t = c.category || c.courseType || 'Uncategorized';
      set.add(t);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const locationOptions = useMemo(() => {
    const set = new Set();
    allRows.forEach((r) => {
      if (r.location && r.location !== '—') set.add(r.location);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const overviewCards = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const upcoming = allRows.filter((r) => r.rawStart && r.rawStart >= startOfToday).length;
    const pending = allRows.reduce((s, r) => s + (Number(r.pendingApprovals) || 0), 0);
    const seatsFilled = allRows.reduce((s, r) => s + (Number(r.booked) || 0), 0);
    let revenue = 0;
    allRows.forEach((r) => {
      revenue += Number(r.rowRevenue) || 0;
    });
    const currencySym = allRows[0]?.currency === 'GBP' ? '£' : '$';

    return [
      {
        id: 1,
        label: 'Upcoming Sessions',
        value: String(upcoming),
        icon: Calendar,
        accent: 'bg-orange-50 text-orange-600',
      },
      {
        id: 2,
        label: 'Pending Approvals',
        value: String(pending),
        icon: AlertTriangle,
        accent: 'bg-amber-50 text-amber-700',
      },
      {
        id: 3,
        label: 'Seats Filled',
        value: String(seatsFilled),
        icon: Users,
        accent: 'bg-blue-50 text-blue-600',
      },
      {
        id: 4,
        label: 'Revenue',
        value: `${currencySym}${Math.round(revenue).toLocaleString()}`,
        icon: DollarSign,
        accent: 'bg-emerald-50 text-emerald-600',
      },
    ];
  }, [allRows]);

  const filteredSessions = useMemo(() => {
    return allRows.filter((session) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hit =
          session.displayId.toLowerCase().includes(q) ||
          session.location.toLowerCase().includes(q) ||
          session.date.toLowerCase().includes(q) ||
          session.courseType.toLowerCase().includes(q) ||
          session.courseTitle.toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (statusFilter) {
        if (statusFilter === 'filling-fast' && session.status !== 'Filling Fast') return false;
        if (statusFilter === 'full' && session.status !== 'Full') return false;
        if (statusFilter === 'open' && session.status !== 'Open') return false;
      }

      if (locationFilter && session.location !== locationFilter) return false;

      if (courseTypeFilter && session.courseType !== courseTypeFilter) return false;

      return true;
    });
  }, [allRows, searchQuery, statusFilter, locationFilter, courseTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleExportCSV = () => {
    const headers = [
      'Session ID',
      'Course',
      'Date',
      'Time',
      'Location',
      'Course Type',
      'Pending Approvals',
      'Booked',
      'Total',
      'Status',
    ];
    const csvData = filteredSessions.map((session) => [
      session.displayId,
      session.courseTitle,
      session.date,
      session.time,
      session.location,
      session.courseType,
      session.pendingApprovals,
      session.booked,
      session.total,
      session.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sessions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportNotification(true);
    setTimeout(() => setShowExportNotification(false), 3000);
  };

  const handleEditSession = (session) => {
    navigate(`/trainingprovider/courses/${session.courseId}/sessions/edit`, {
      state: {
        isEdit: true,
        courseTitle: session.courseTitle,
        sessionData: {
          id: session.sessionDbId,
          startDate: toInputDate(session.rawStart),
          endDate: toInputDate(session.rawEnd),
          startTime: session.startTime || '09:00',
          endTime: session.endTime || '17:00',
          location: session.location === '—' ? '' : session.location,
          courseType: session.courseType,
          totalSeats: session.total,
        },
      },
    });
  };

  const handleCancelSession = (session) => {
    setSelectedSession(session);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setSelectedSession(null);
    setShowCancelledNotification(true);
    setTimeout(() => setShowCancelledNotification(false), 3000);
  };

  const handleScheduleSession = () => {
    navigate('/trainingprovider/sessions/schedule');
  };

  return (
    <div className="flex flex-col min-h-full">
      {showExportNotification && (
        <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-left duration-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">CSV Exported Successfully!</span>
        </div>
      )}

      <div className="mb-4">
        <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900 mb-1">Session Management</h1>
        <p className="text-gray-500 text-sm">Manage course bookings and respond to schedule needs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {overviewCards.map((card) => (
          <div
            key={card.id}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
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
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <option value="filling-fast">Filling Fast</option>
                <option value="full">Full</option>
                <option value="open">Open</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer min-w-[140px]"
              >
                <option value="">Location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={courseTypeFilter}
                onChange={(e) => {
                  setCourseTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer min-w-[160px]"
              >
                <option value="">All course types</option>
                {courseTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredSessions.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-gray-500" /> Export CSV
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#003971] text-white rounded-lg hover:bg-[#002855] transition-colors"
              onClick={handleScheduleSession}
            >
              <Plus className="h-4 w-4" /> Schedule Session
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#003971]" />
              <p className="text-sm">Loading sessions…</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <p className="text-sm text-red-600 mb-3">{fetchError}</p>
              <button
                type="button"
                onClick={refresh}
                className="text-sm font-medium text-[#003971] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Course Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pending Approvals
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Booked
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                      {allRows.length === 0
                        ? 'No sessions yet. Schedule a session from a course, or publish a course with sessions.'
                        : 'No sessions match your filters.'}
                    </td>
                  </tr>
                ) : (
                  currentSessions.map((session) => (
                    <tr
                      key={`${session.courseId}-${session.sessionDbId}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div>{session.displayId}</div>
                        <div className="text-xs text-gray-400 font-normal truncate max-w-[200px]">
                          {session.courseTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 text-sm font-medium">{session.date}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="h-4 w-4 inline-block mr-1" />
                            {session.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-gray-900 text-sm font-medium">
                          <MapPin className="h-4 w-4 inline-block mr-1 text-purple-500" />
                          {session.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 text-sm font-medium">{session.courseType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {session.pendingApprovals} Pending
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 text-sm font-medium">
                          {session.booked} / {session.total}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${session.statusColor}`}>{session.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate('/trainingprovider/sessions/attendance', {
                                state: {
                                  sessionId: session.sessionDbId,
                                  courseId: session.courseId,
                                  courseTitle: session.courseTitle,
                                },
                              })
                            }
                            className="inline-flex items-center justify-center rounded-xl bg-[#003971] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002855]"
                          >
                            View Attendees
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditSession(session)}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelSession(session)}
                            className="inline-flex items-center justify-center rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>of {filteredSessions.length} sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-[32px] h-8 text-sm font-medium rounded border ${
                  currentPage === page
                    ? 'bg-[#003971] border-[#003971] text-white'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {showCancelledNotification && (
        <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-left duration-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Session Cancelled Successfully!</span>
        </div>
      )}

      {showCancelModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Session?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel session{' '}
                <span className="font-semibold">{selectedSession.displayId}</span>? This action cannot be undone and
                all bookings will be cancelled.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Keep Session
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
