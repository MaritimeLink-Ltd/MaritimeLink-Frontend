import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, User, ChevronDown, Download, Plus } from 'lucide-react';

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
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
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
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
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
                onChange={e => setLocationFilter(e.target.value)}
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
                onChange={e => setInstructorFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
              >
                <option value="">Instructor</option>
                <option value="robert-fox">Capt. Robert Fox</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
              {sessionsData.map((session, idx) => (
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
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                    <button className="text-sm font-medium text-red-500 hover:text-red-700">Cancel</button>
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
            <span>of 5 sessions</span>
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
