import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
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
          <button className="px-5 py-2 text-sm font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit Course
          </button>
          <button
            className="px-5 py-2 text-sm font-medium rounded-md bg-[#003971] text-white hover:bg-[#002855] flex items-center gap-2"
            onClick={() => navigate(`/trainingprovider/courses/STCW-BST-001/sessions`)}
          >
            <Calendar className="h-4 w-4" /> Manage Session
          </button>
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer className="h-4 w-4 text-gray-500" /> Print List
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 text-gray-500" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#003971] text-white rounded-lg hover:bg-[#002855] transition-colors">
              <Plus className="h-4 w-4" /> Add Applicant
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 overflow-auto">
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
              {applicantsData.map((app, idx) => (
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
            <span className="border border-gray-200 rounded px-2 py-1 text-sm">1 - 5</span>
            <span>of 5 applicants</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            <button className="min-w-[32px] h-8 text-sm font-medium rounded border bg-white border-gray-300 text-gray-900">1</button>
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
