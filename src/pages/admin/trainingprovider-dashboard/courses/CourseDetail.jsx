import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  MapPin,
  User,
  Users,
  DollarSign,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const courseSummary = {
  id: 'STCW-BST-001',
  title: 'STCW Basic Safety',
  categoryTag: 'STCW Basic Safety',
  totalSeats: 160,
  sessions: 10,
  bookings: 123,
  revenue: '$18,450',
  description:
    'Comprehensive entry-level safety training essential for all seafarers. Covers basic firefighting, personal survival techniques, elementary first aid, and personal safety and social responsibilities as per IMO standards. Duration per session: 3 days.'
};

const courseHighlights = [
  'Firefighting',
  'Personal Survival',
  'First Aid',
  'Social Responsibilities',
  'Duration: 3 Days',
  'Summary Included'
];

const sessionData = [
  {
    id: 'S1',
    dates: '15–17 May',
    location: 'Liverpool',
    seats: '14 / 16',
    status: 'Filling Fast',
    statusVariant: 'warning'
  },
  {
    id: 'S2',
    dates: '30 May – 1 Jun',
    location: 'Aberdeen',
    seats: '12 / 16',
    status: 'Filling Fast',
    statusVariant: 'warning'
  },
  {
    id: 'S3',
    dates: '10–12 Jun',
    location: 'Aberdeen',
    seats: '12 / 16',
    status: 'Moderate',
    statusVariant: 'info'
  },
  {
    id: 'S4',
    dates: '24–26 Jun',
    location: 'Newcastle',
    seats: '8 / 16',
    status: 'Open',
    statusVariant: 'success'
  }
];

const statusPillStyles = {
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-sky-50 text-sky-700',
  default: 'bg-gray-100 text-gray-600'
};

const PAGE_SIZE = 4;

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const resolvedCourseId = courseId || courseSummary.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState('Published');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

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
  }, [safeCurrentPage]);

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
    navigate(`/trainingprovider/courses/${resolvedCourseId}/edit`);
  };

  const handleAddSession = () => {
    navigate(`/trainingprovider/courses/${resolvedCourseId}/sessions/schedule`);
  };

  const handleManageSessionList = () => {
    navigate(`/trainingprovider/sessions/attendance`);
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <button
          type="button"
          onClick={() => navigate('/trainingprovider/courses')}
          className="hover:text-[#003971] font-medium"
        >
          Course Management
        </button>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-700">{courseSummary.title}</span>
      </div>

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
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Session List
              </h2>
              <button
                type="button"
                onClick={handleAddSession}
                className="inline-flex items-center gap-2 rounded-xl bg-[#003971] px-4 py-2 text-xs font-semibold text-white hover:bg-[#002455]"
              >
                <span>Add Session</span>
              </button>
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
                          <button
                            type="button"
                            onClick={handleManageSessionList}
                            className="inline-flex items-center justify-center rounded-xl bg-[#EBF3FF] px-4 py-2 text-xs font-semibold text-[#003971] hover:bg-[#d7e6ff]"
                          >
                            View Attendees
                          </button>
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
    </div>
  );
}
