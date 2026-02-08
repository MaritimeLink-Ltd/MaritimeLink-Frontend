import { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Calendar, MapPin, User, Users, Edit, MoreVertical, Download, Printer, Plus, ChevronDown } from 'lucide-react';

const applicantsData = [
  {
    initials: 'JW',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    company: 'Maersk Line',
    position: 'Chief Officer',
    date: 'Apr 24, 2024',
    status: 'Confirmed',
    payment: 'Paid',
    paymentStatus: 'paid',
    statusColor: 'text-green-600',
    paymentDot: 'bg-green-400',
    profile: '#'
  },
  {
    initials: 'SC',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    company: 'Evergreen Marine',
    position: 'Second Engineer',
    date: 'Apr 25, 2024',
    status: 'Pending Approval',
    payment: 'Invoice Sent',
    paymentStatus: 'invoice',
    statusColor: 'text-orange-500',
    paymentDot: 'bg-gray-300',
    profile: '#'
  },
  {
    initials: 'MR',
    name: 'Michael Ross',
    email: 'michael.ross@example.com',
    company: 'Independent',
    position: 'Deck Cadet',
    date: 'Apr 22, 2024',
    status: 'Confirmed',
    payment: 'Paid',
    paymentStatus: 'paid',
    statusColor: 'text-green-600',
    paymentDot: 'bg-green-400',
    profile: '#'
  },
  {
    initials: 'DM',
    name: 'David Miller',
    email: 'david.miller@example.com',
    company: 'CMA CGM',
    position: 'Master',
    date: 'Apr 26, 2024',
    status: 'Waitlist',
    payment: '',
    paymentStatus: '',
    statusColor: 'text-blue-600',
    paymentDot: 'bg-gray-300',
    profile: '#'
  },
  {
    initials: 'ET',
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    company: 'BP Shipping',
    position: 'Chief Engineer',
    date: 'Apr 20, 2024',
    status: 'Cancelled',
    payment: '',
    paymentStatus: '',
    statusColor: 'text-red-500',
    paymentDot: 'bg-gray-300',
    profile: '#'
  }
];

export default function CourseDetail() {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportNotification, setShowExportNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const printRef = useRef(null);

  // Filter applicants based on search and status
  const filteredApplicants = applicantsData.filter(app => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = app.name.toLowerCase().includes(query);
      const matchesEmail = app.email.toLowerCase().includes(query);
      const matchesCompany = app.company.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail && !matchesCompany) return false;
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'confirmed' && app.status !== 'Confirmed') return false;
      if (statusFilter === 'pending' && app.status !== 'Pending Approval') return false;
      if (statusFilter === 'waitlist' && app.status !== 'Waitlist') return false;
      if (statusFilter === 'cancelled' && app.status !== 'Cancelled') return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Position', 'Date Booked', 'Status', 'Payment'];
    const csvData = filteredApplicants.map(app => [
      app.name,
      app.email,
      app.company,
      app.position,
      app.date,
      app.status,
      app.payment || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stcw_basic_safety_applicants_${new Date().toISOString().split('T')[0]}.csv`);
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
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>STCW Basic Safety Training - Applicants List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 18px; margin-bottom: 10px; }
            h2 { font-size: 14px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: 600; }
            .status-confirmed { color: green; }
            .status-pending { color: orange; }
            .status-waitlist { color: blue; }
            .status-cancelled { color: red; }
          </style>
        </head>
        <body>
          <h1>STCW Basic Safety Training - Applicants List</h1>
          <h2>Printed on: ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Position</th>
                <th>Date Booked</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${filteredApplicants.map(app => `
                <tr>
                  <td>${app.name}</td>
                  <td>${app.email}</td>
                  <td>${app.company}</td>
                  <td>${app.position}</td>
                  <td>${app.date}</td>
                  <td class="status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</td>
                  <td>${app.payment || 'N/A'}</td>
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

  // Edit Course handler
  const handleEditCourse = () => {
    navigate(`/trainingprovider/courses/${courseId || 'STCW-BST-001'}/edit`);
  };

  // Add Applicant handler
  const handleAddApplicant = () => {
    alert('Add Applicant functionality - Opens a modal/form to manually add an applicant');
  };

  // View Profile handler
  const handleViewProfile = (applicant) => {
    // Navigate to candidate profile page - using applicant id or a default id
    navigate(`/trainingprovider/candidate/${applicant.id || '1'}`);
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
        <span className="mr-2">&larr;</span> Back to Courses
      </button>

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">STCW Basic Safety Training</h1>
          <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <span>ID: STCW-BST-001</span>
            <span className="mx-2">•</span>
            <span>Last updated 2 days ago</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!location.pathname.includes('/marketplace') && (
            <>
              <button
                onClick={handleEditCourse}
                className="px-5 py-2 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Course
              </button>
              <button
                className="px-5 py-2 text-sm font-medium rounded-md bg-[#003971] text-white hover:bg-[#002855] flex items-center gap-2"
                onClick={() => navigate(`/trainingprovider/courses/STCW-BST-001/sessions`)}
              >
                <Calendar className="h-4 w-4" /> Manage Session
              </button>
            </>
          )}
          <button className="p-2.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-500">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Seats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Total Seats</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">14</span>
            <span className="text-gray-400">/ 16</span>
            <span className="ml-2 text-sm font-medium text-orange-500">Filling Fast</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '87.5%' }} />
          </div>
        </div>
        {/* Upcoming Session */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Upcoming Session</div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900">May 15 - 17, 2024</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">09:00 AM - 05:00 PM</div>
        </div>
        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Location</div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-500" />
            <span className="font-medium text-gray-900">Training Center A</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Aberdeen, UK</div>
        </div>
        {/* Instructor */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Instructor</div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            <span className="font-medium text-gray-900">Capt. Robert Fox</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Senior Instructor</div>
        </div>
      </div>

      {/* Applicants Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
        {/* Filters Row */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Booked</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentApplicants.map((app, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  {/* Applicant Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base">
                        {app.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Company */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{app.company}</p>
                      <p className="text-xs text-gray-400">{app.position}</p>
                    </div>
                  </td>
                  {/* Date Booked */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{app.date}</span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${app.statusColor}`}>{app.status}</span>
                  </td>
                  {/* Payment */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {app.payment && (
                        <>
                          <span className={`h-2 w-2 rounded-full ${app.paymentDot}`}></span>
                          <span className="text-sm text-gray-600">{app.payment}</span>
                        </>
                      )}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewProfile(app)}
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
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>of {filteredApplicants.length} applicants</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[32px] h-8 text-sm font-medium rounded border transition-colors ${currentPage === page
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
