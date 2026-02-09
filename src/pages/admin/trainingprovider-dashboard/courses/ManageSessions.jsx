import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, User, ChevronDown, Download, Plus, X, AlertTriangle } from 'lucide-react';

const sessionsData = [
  {
    id: 'STCW-BST-001',
    date: 'May 15 - 17, 2024',
    time: '09:00 - 17:00',
    location: 'Training Center A',
    instructor: 'Capt. Robert Fox',
    booked: 14,
    total: 16,
    status: 'Filling Fast',
    statusColor: 'text-orange-500',
  },
  {
    id: 'STCW-BST-001',
    date: 'May 15 - 17, 2024',
    time: '09:00 - 17:00',
    location: 'Training Center A',
    instructor: 'Capt. Robert Fox',
    booked: 14,
    total: 16,
    status: 'Filling Fast',
    statusColor: 'text-orange-500',
  },
  {
    id: 'STCW-BST-001',
    date: 'May 15 - 17, 2024',
    time: '09:00 - 17:00',
    location: 'Training Center A',
    instructor: 'Capt. Robert Fox',
    booked: 14,
    total: 16,
    status: 'Filling Fast',
    statusColor: 'text-orange-500',
  },
  {
    id: 'STCW-BST-001',
    date: 'May 15 - 17, 2024',
    time: '09:00 - 17:00',
    location: 'Training Center A',
    instructor: 'Capt. Robert Fox',
    booked: 14,
    total: 16,
    status: 'Filling Fast',
    statusColor: 'text-orange-500',
  },
  {
    id: 'STCW-BST-001',
    date: 'May 15 - 17, 2024',
    time: '09:00 - 17:00',
    location: 'Training Center A',
    instructor: 'Capt. Robert Fox',
    booked: 14,
    total: 16,
    status: 'Filling Fast',
    statusColor: 'text-orange-500',
  },
];

export default function ManageSessions() {
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCancelledNotification, setShowCancelledNotification] = useState(false);
  const navigate = useNavigate();

  // Filter sessions based on search and filters
  const filteredSessions = sessionsData.filter(session => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = session.id.toLowerCase().includes(query);
      const matchesLocation = session.location.toLowerCase().includes(query);
      const matchesInstructor = session.instructor.toLowerCase().includes(query);
      const matchesDate = session.date.toLowerCase().includes(query);
      if (!matchesId && !matchesLocation && !matchesInstructor && !matchesDate) return false;
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'filling-fast' && session.status !== 'Filling Fast') return false;
      if (statusFilter === 'full' && session.status !== 'Full') return false;
      if (statusFilter === 'open' && session.status !== 'Open') return false;
    }

    // Location filter
    if (locationFilter) {
      if (locationFilter === 'training-center-a' && session.location !== 'Training Center A') return false;
    }

    // Instructor filter
    if (instructorFilter) {
      if (instructorFilter === 'robert-fox' && session.instructor !== 'Capt. Robert Fox') return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = ['Session ID', 'Date', 'Time', 'Location', 'Instructor', 'Booked', 'Total', 'Status'];
    const csvData = filteredSessions.map(session => [
      session.id,
      session.date,
      session.time,
      session.location,
      session.instructor,
      session.booked,
      session.total,
      session.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stcw_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show export notification
    setShowExportNotification(true);
    setTimeout(() => setShowExportNotification(false), 3000);
  };

  // Edit session handler
  const handleEditSession = (session) => {
    navigate(`/trainingprovider/courses/STCW-BST-001/sessions/edit`, {
      state: {
        isEdit: true,
        sessionData: {
          id: session.id,
          startDate: session.date.split(' - ')[0],
          endDate: session.date.split(' - ')[1]?.replace(', 2024', '') || '',
          startTime: session.time.split(' - ')[0],
          endTime: session.time.split(' - ')[1],
          location: session.location,
          instructor: session.instructor,
          totalSeats: session.total
        }
      }
    });
  };

  // Cancel session handler - show modal
  const handleCancelSession = (session) => {
    setSelectedSession(session);
    setShowCancelModal(true);
  };

  // Confirm cancel session
  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setSelectedSession(null);
    setShowCancelledNotification(true);
    setTimeout(() => setShowCancelledNotification(false), 3000);
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
        onClick={() => navigate(-1)}
      >
        <span className="mr-2">&larr;</span> Back to Course Details
      </button>

      {/* Heading */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Sessions</h1>
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <span>STCW Basic Safety Training</span>
          <span className="mx-2">•</span>
          <span>ID: STCW-BST-001</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden mt-4">
        {/* Filters Row */}
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
                onChange={e => {
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
                onChange={e => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
              >
                <option value="">Location</option>
                <option value="training-center-a">Training Center A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={instructorFilter}
                onChange={e => {
                  setInstructorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
              >
                <option value="">Instructor</option>
                <option value="robert-fox">Capt. Robert Fox</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 text-gray-500" /> Export CSV
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#003971] text-white rounded-lg hover:bg-[#002855] transition-colors"
              onClick={() => navigate(`/trainingprovider/courses/STCW-BST-001/sessions/schedule`)}
            >
              <Plus className="h-4 w-4" /> Schedule Session
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Session ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booked</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentSessions.map((session, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{session.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 text-sm font-medium">{session.date}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-4 w-4 inline-block mr-1" />{session.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-gray-900 text-sm font-medium"><MapPin className="h-4 w-4 inline-block mr-1 text-purple-500" />{session.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-gray-900 text-sm font-medium"><User className="h-4 w-4 inline-block mr-1 text-green-500" />{session.instructor}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 text-sm font-medium">{session.booked} / {session.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${session.statusColor}`}>{session.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditSession(session)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                    <button
                      onClick={() => handleCancelSession(session)}
                      className="text-sm font-medium text-red-500 hover:text-red-700">Cancel</button>
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
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>of {filteredSessions.length} sessions</span>
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

      {/* Cancelled Notification Toast */}
      {showCancelledNotification && (
        <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-left duration-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Session Cancelled Successfully!</span>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
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
                Are you sure you want to cancel session <span className="font-semibold">{selectedSession.id}</span>?
                This action cannot be undone and all bookings will be cancelled.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Keep Session
                </button>
                <button
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
