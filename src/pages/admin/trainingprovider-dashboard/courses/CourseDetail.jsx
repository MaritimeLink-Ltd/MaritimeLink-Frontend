import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  MapPin,
  User,
  Users,
  DollarSign,
  ChevronRight,
  CheckCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const courseHighlights = [
  'Firefighting',
  'Personal Survival',
  'First Aid',
  'Social Responsibilities',
  'Duration: 3 Days',
  'Summary Included'
];

const statusPillStyles = {
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-sky-50 text-sky-700',
  default: 'bg-gray-100 text-gray-600'
};

const PAGE_SIZE = 4;

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

export default function CourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const resolvedCourseId = courseId; // Use the path param

  const coursePaths = useMemo(() => {
    const id = resolvedCourseId || '';
    const p = location.pathname;
    if (p.includes('/admin/marketplace/internal/courses/')) {
      const base = `/admin/marketplace/internal/courses/${id}`;
      return {
        base,
        scheduleSession: `${base}/sessions/schedule`,
        editSession: `${base}/sessions/edit`,
        editCourse: `${base}/edit`,
        attendance: '/admin/sessions/attendance',
      };
    }
    if (p.includes('/admin/marketplace/oversight/courses/')) {
      const base = `/admin/marketplace/oversight/courses/${id}`;
      return {
        base,
        scheduleSession: `${base}/sessions/schedule`,
        editSession: `${base}/sessions/edit`,
        editCourse: `${base}/edit`,
        attendance: '/admin/sessions/attendance',
      };
    }
    const base = `/trainingprovider/courses/${id}`;
    return {
      base,
      scheduleSession: `${base}/sessions/schedule`,
      editSession: `${base}/sessions/edit`,
      editCourse: `${base}/edit`,
      attendance: '/trainingprovider/sessions/attendance',
    };
  }, [location.pathname, resolvedCourseId]);

  const [courseSummary, setCourseSummary] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState('Published');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const [courseResponse, sessionsResponse] = await Promise.all([
          httpClient.get(API_ENDPOINTS.COURSES.GET_BY_ID(resolvedCourseId)),
          httpClient.get(API_ENDPOINTS.COURSES.GET_SESSIONS(resolvedCourseId))
        ]);

        let fetchedSessions = [];
        if (sessionsResponse.status === 'success' && sessionsResponse.data?.sessions) {
          fetchedSessions = sessionsResponse.data.sessions;
        }

        if (courseResponse.status === 'success' && courseResponse.data?.course) {
          const course = courseResponse.data.course;
          const currencySymbol = course.currency === 'USD' ? '$' : course.currency === 'GBP' ? '£' : '';
          
          let computedTotalSeats = course.capacity || 0;
          if (fetchedSessions.length > 0 && computedTotalSeats === 0) {
              computedTotalSeats = fetchedSessions.reduce((acc, s) => acc + (Number(s.totalSeats) || 0), 0);
          }
          const bookingMetrics = fetchedSessions.reduce(
            (acc, session) => {
              const metrics = getSessionBookingMetrics(session);
              return {
                bookings: acc.bookings + metrics.booked,
                revenue: acc.revenue + metrics.revenue,
              };
            },
            { bookings: 0, revenue: 0 }
          );

          setCourseSummary({
            id: course.id,
            title: course.title,
            categoryTag: course.category || course.courseType,
            totalSeats: computedTotalSeats,
            sessions: fetchedSessions.length,
            bookings: bookingMetrics.bookings || course.enrolledCount || 0,
            revenue: `${currencySymbol}${Math.round(bookingMetrics.revenue || (Number(course.price || 0) * (course.enrolledCount || 0))).toLocaleString()}`,
            description: course.description || 'No description provided.',
          });
          
          setStatus(course.status === 'ACTIVE' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : 'Archived');
          
          if (fetchedSessions.length > 0) {
            const mappedSessions = fetchedSessions.map((s, idx) => {
               const startDate = new Date(s.startDate);
               const endDate = new Date(s.endDate);
               const datesStr = `${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} - ${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' })}, ${endDate.getFullYear()}`;
               
               const total = Number(s.totalSeats) || 0;
               const available = Number(s.availableSeats) || 0;
               const metrics = getSessionBookingMetrics(s);
               const enrolled = metrics.booked || Math.max(0, total - available);

               return {
                 id: s.id || `S${idx}`,
                 /** Real session UUID for trainer APIs; null when backend omitted id */
                 apiSessionId: s.id || null,
                 dates: datesStr,
                 location: s.location || 'Online',
                 seats: `${enrolled} / ${total}`,
                 status: available > 0 ? (available <= 2 ? 'Filling Fast' : 'Open') : 'Full',
                 statusVariant: available > 0 ? (available <= 2 ? 'warning' : 'success') : 'default',
                 rawStartDate: startDate // for robust sorting
               };
            });
            // Sort sessions by chronologically earliest start date
            mappedSessions.sort((a, b) => a.rawStartDate - b.rawStartDate);
            setSessionData(mappedSessions);
          } else {
            setSessionData([]);
          }
        }
      } catch (err) {
         console.error('Failed to fetch course details or sessions:', err);
      } finally {
         setIsLoading(false);
      }
    };
    if (resolvedCourseId) {
       fetchCourseDetails();
    }
  }, [resolvedCourseId]);

  const statusConfig = {
    Published: {
      badgeLabel: 'Published',
      badgeClass:
        'inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700',
      actionLabel: 'Unpublish',
      actionButtonClass:
        'inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-200',
      nextStatus: 'Draft',
      modalTitle: 'Unpublish course?',
      modalDescription:
        'This will move the course to Draft. Learners will no longer be able to book new sessions for this course.'
    },
    Draft: {
      badgeLabel: 'Draft',
      badgeClass:
        'inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-700',
      actionLabel: 'Publish',
      actionButtonClass:
        'inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-200',
      nextStatus: 'Published',
      modalTitle: 'Publish course?',
      modalDescription:
        'This will publish the course so it becomes visible in the marketplace and available for bookings.'
    },
    Archived: {
      badgeLabel: 'Archived',
      badgeClass:
        'inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-0.5 text-xs font-semibold text-gray-500',
      actionLabel: 'Restore',
      actionButtonClass:
        'inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50',
      nextStatus: 'Draft',
      modalTitle: 'Restore course?',
      modalDescription:
        'This will restore the course to Draft so you can review and publish it again.'
    }
  };

  const currentStatusConfig = statusConfig[status];

  const pageCount = Math.max(1, Math.ceil(sessionData.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, pageCount);

  const { visibleSessions, startIndex, endIndex } = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      visibleSessions: sessionData.slice(start, end),
      startIndex: start,
      endIndex: end
    };
  }, [safeCurrentPage, sessionData]);

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

  const handleEditCourse = () => {
    navigate(coursePaths.editCourse, {
      state: { returnPath: coursePaths.base },
    });
  };

  const handleAddSession = () => {
    navigate(coursePaths.scheduleSession, {
      state: {
        courseTitle: courseSummary?.title,
        returnPath: coursePaths.base,
      },
    });
  };

  const isAdminMarketplaceCourse =
    location.pathname.includes('/admin/marketplace');

  const handleViewAllCourseAttendees = () => {
    if (!isAdminMarketplaceCourse) return;
    navigate(coursePaths.attendance, {
      state: {
        courseId: resolvedCourseId,
        courseTitle: courseSummary?.title || 'Course',
        returnPath: coursePaths.base,
      },
    });
  };

  const handleViewSessionAttendees = (session) => {
    if (isAdminMarketplaceCourse) {
      handleViewAllCourseAttendees();
      return;
    }
    if (!session?.apiSessionId) return;
    navigate(coursePaths.attendance, {
      state: {
        sessionId: session.apiSessionId,
        courseId: resolvedCourseId,
        courseTitle: courseSummary?.title || 'Course',
        returnPath: coursePaths.base,
      },
    });
  };

  const handleStatusActionClick = () => {
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    const nextStatus = currentStatusConfig?.nextStatus;
    if (nextStatus) {
      setStatus(nextStatus);
    }
    setStatusDialogOpen(false);
  };

  const handleCancelStatusChange = () => {
    setStatusDialogOpen(false);
  };

  const handleDeleteCourse = async () => {
    try {
      setIsDeleting(true);
      const response = await httpClient.delete(API_ENDPOINTS.COURSES.DELETE(resolvedCourseId));
      if (response.status === 'success') {
        navigate('/trainingprovider/courses');
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      setIsDeletingSession(true);
      const response = await httpClient.delete(API_ENDPOINTS.COURSES.DELETE_SESSION(sessionToDelete.id));
      if (response.status === 'success') {
          // Remove session from sessionData natively to reflect immediately
          setSessionData(prev => prev.filter(s => s.id !== sessionToDelete.id));
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-[#003971]" />
          <span className="font-medium">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (!courseSummary) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <p className="text-gray-500">Course not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[#003971] hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003971] font-medium mb-3 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-orange-50 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-[26px] md:text-[28px] font-bold text-gray-900">
              Manage Course
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">
                {courseSummary.title}
              </span>
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-0.5 text-xs font-semibold text-[#003971]">
                {courseSummary.categoryTag}
              </span>
              {currentStatusConfig && (
                <span className={currentStatusConfig.badgeClass}>
                  {currentStatusConfig.badgeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEditCourse}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span>Edit Course</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
          {currentStatusConfig && (
            <button
              type="button"
              onClick={handleStatusActionClick}
              className={currentStatusConfig.actionButtonClass}
            >
              <span>{currentStatusConfig.actionLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 border-b border-gray-100">
        <nav className="flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`relative pb-3 font-medium ${activeTab === 'details'
              ? 'text-[#003971]'
              : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            Course Details
            {activeTab === 'details' && (
              <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-[#003971]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 font-medium ${activeTab === 'sessions'
              ? 'text-[#003971]'
              : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            Sessions
          </button>

        </nav>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total Seats
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {courseSummary.totalSeats}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Calendar className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sessions
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {courseSummary.sessions}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
            <Users className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Bookings
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {courseSummary.bookings}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Revenue
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {courseSummary.revenue}
            </p>
          </div>
        </div>
      </div>

      {/* Description + Sessions */}
      <div className="flex flex-col gap-5">
        {/* Description + Session List */}
        <div className="flex flex-col gap-5">
          {/* Description Card (only on Course Details tab) */}
          {activeTab === 'details' && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  Description
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {courseSummary.description}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {courseHighlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Session List (visible for both tabs) */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Session List
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {isAdminMarketplaceCourse && (
                  <button
                    type="button"
                    onClick={handleViewAllCourseAttendees}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#003971] hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4" />
                    <span>View attendees</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003971] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002455]"
                >
                  <span>Add Session</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3 text-left">Session Dates</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      Seat Enrolled
                    </th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSessions.map((session, index) => {
                    const isLast = index === visibleSessions.length - 1;
                    const pillClass =
                      statusPillStyles[session.statusVariant] ||
                      statusPillStyles.default;

                    return (
                      <tr
                        key={session.id}
                        className={`text-sm ${!isLast ? 'border-b border-gray-50' : ''
                          } hover:bg-gray-50/60 transition-colors`}
                      >
                        <td className="px-5 py-3 align-middle text-gray-900">
                          {session.dates}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className="flex items-center gap-1.5 text-gray-800">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            {session.location}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-center font-semibold text-gray-800">
                          {session.seats}
                        </td>
                        <td className="px-4 py-3 align-middle text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${pillClass}`}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => handleViewSessionAttendees(session)}
                                disabled={!isAdminMarketplaceCourse && !session.apiSessionId}
                                title={
                                  isAdminMarketplaceCourse
                                    ? 'View all course bookings and attendees'
                                    : session.apiSessionId
                                      ? 'View attendees for this session'
                                      : 'Session id missing — cannot load attendees'
                                }
                                className="inline-flex items-center justify-center rounded-xl bg-[#EBF3FF] px-4 py-2 text-xs font-semibold text-[#003971] hover:bg-[#d7e6ff] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#EBF3FF]"
                            >
                                {isAdminMarketplaceCourse ? 'View attendees' : 'View Attendees'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSessionToDelete(session)}
                                className="inline-flex items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 text-xs text-gray-500">
              <p>
                Showing{' '}
                <span className="font-semibold">
                  {sessionData.length ? startIndex + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold">
                  {Math.min(sessionData.length, endIndex)}
                </span>{' '}
                of{' '}
                <span className="font-semibold">{sessionData.length}</span>{' '}
                sessions
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
                  disabled={safeCurrentPage === pageCount}
                  onClick={() => handleChangePage(safeCurrentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statusDialogOpen && currentStatusConfig && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {currentStatusConfig.modalTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {currentStatusConfig.modalDescription}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelStatusChange}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className="px-4 py-2.5 rounded-xl bg-[#003971] text-sm font-semibold text-white hover:bg-[#002455]"
              >
                {currentStatusConfig.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Course?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this course? This action is permanent and cannot be undone. All sessions under this course will also be removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 inline-flex items-center disabled:opacity-75"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Session Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Session?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel and delete the session for <span className="font-semibold">{sessionToDelete.dates}</span>? All enrolled bookings for this session will be removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                disabled={isDeletingSession}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 inline-flex items-center disabled:opacity-75"
              >
                {isDeletingSession && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isDeletingSession ? 'Deleting...' : 'Delete Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
