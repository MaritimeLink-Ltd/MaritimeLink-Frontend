import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ChevronDown,
    RefreshCw,
    Download,
    Plus,
    Users,
    Flame,
    Ship,
    Shield,
    Anchor,
    Waves,
    Droplets,
    Heart
} from 'lucide-react';

function TrainingProviderCourses() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('published');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [capacityFilter, setCapacityFilter] = useState('');
    const [sessionFilter, setSessionFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const coursesData = [
        {
            id: 1,
            name: 'STCW Basic Safety',
            courseId: '000001',
            icon: Users,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: 'Published',
            capacityStatus: 'Nearly Full',
            capacityColor: 'text-orange-500',
            nextSession: '1-3 May',
            bookings: 14,
            totalCapacity: 16,
            progressColor: 'bg-orange-500',
            isPublished: true
        },
        {
            id: 2,
            name: 'Advanced Firefighting',
            courseId: '000002',
            icon: Flame,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            status: 'Published',
            capacityStatus: 'Full',
            capacityColor: 'text-red-500',
            nextSession: '7-9 May',
            bookings: 12,
            totalCapacity: 12,
            progressColor: 'bg-red-500',
            isPublished: true
        },
        {
            id: 3,
            name: 'Fast Rescue Boat Operator',
            courseId: '000003',
            icon: Ship,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            status: 'Published',
            capacityStatus: 'Filling Fast',
            capacityColor: 'text-orange-500',
            nextSession: '5-7 June',
            bookings: 10,
            totalCapacity: 12,
            progressColor: 'bg-orange-500',
            isPublished: true
        },
        {
            id: 4,
            name: 'Confined Space Awareness',
            courseId: '000004',
            icon: Shield,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-600',
            status: 'Published',
            capacityStatus: 'Enrollment Open',
            capacityColor: 'text-green-500',
            nextSession: 'Not scheduled',
            bookings: 0,
            totalCapacity: 20,
            progressColor: 'bg-blue-200',
            isPublished: true
        },
        {
            id: 5,
            name: 'Ship Safety Officer',
            courseId: '000005',
            icon: Anchor,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
            status: 'Published',
            capacityStatus: 'Enrollment Open',
            capacityColor: 'text-green-500',
            nextSession: '15-17 April',
            bookings: 6,
            totalCapacity: 12,
            progressColor: 'bg-blue-600',
            isPublished: true
        },
        {
            id: 6,
            name: 'GWO Sea Survival',
            courseId: '000006',
            icon: Waves,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: 'Published',
            capacityStatus: 'Enrollment Open',
            capacityColor: 'text-green-500',
            nextSession: '10-12 May',
            bookings: 4,
            totalCapacity: 10,
            progressColor: 'bg-green-500',
            isPublished: true
        },
        {
            id: 7,
            name: 'Tanker Familiarization',
            courseId: '000007',
            icon: Droplets,
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-500',
            status: 'Unpublished',
            capacityStatus: 'Not Scheduled',
            capacityColor: 'text-gray-400',
            nextSession: '-',
            bookings: null,
            totalCapacity: null,
            progressColor: '',
            isPublished: false
        },
        {
            id: 8,
            name: 'Medical First Aid',
            courseId: '000008',
            icon: Heart,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            status: 'Unpublished',
            capacityStatus: 'Draft',
            capacityColor: 'text-gray-400',
            nextSession: '-',
            bookings: null,
            totalCapacity: null,
            progressColor: '',
            isPublished: false
        },
        {
            id: 9,
            name: 'Basic First Aid',
            courseId: '000009',
            icon: Heart,
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
            status: 'Published',
            capacityStatus: 'Nearly Full',
            capacityColor: 'text-orange-500',
            nextSession: '20-22 May',
            bookings: 8,
            totalCapacity: 10,
            progressColor: 'bg-orange-500',
            isPublished: true
        },
        {
            id: 10,
            name: 'Fire Prevention',
            courseId: '000010',
            icon: Flame,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-700',
            status: 'Published',
            capacityStatus: 'Full',
            capacityColor: 'text-red-500',
            nextSession: '25-27 May',
            bookings: 10,
            totalCapacity: 10,
            progressColor: 'bg-red-500',
            isPublished: true
        },
        {
            id: 11,
            name: 'Crowd Management',
            courseId: '000011',
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-700',
            status: 'Published',
            capacityStatus: 'Enrollment Open',
            capacityColor: 'text-green-500',
            nextSession: '1-3 June',
            bookings: 2,
            totalCapacity: 20,
            progressColor: 'bg-green-500',
            isPublished: true
        },
        {
            id: 12,
            name: 'Crisis Management',
            courseId: '000012',
            icon: Shield,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-700',
            status: 'Unpublished',
            capacityStatus: 'Draft',
            capacityColor: 'text-gray-400',
            nextSession: '-',
            bookings: null,
            totalCapacity: null,
            progressColor: '',
            isPublished: false
        },
        {
            id: 13,
            name: 'Passenger Safety',
            courseId: '000013',
            icon: Users,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: 'Published',
            capacityStatus: 'Nearly Full',
            capacityColor: 'text-orange-500',
            nextSession: '10-12 June',
            bookings: 9,
            totalCapacity: 10,
            progressColor: 'bg-orange-500',
            isPublished: true
        },
        {
            id: 14,
            name: 'Personal Survival Techniques',
            courseId: '000014',
            icon: Waves,
            iconBg: 'bg-blue-200',
            iconColor: 'text-blue-800',
            status: 'Published',
            capacityStatus: 'Full',
            capacityColor: 'text-red-500',
            nextSession: '15-17 June',
            bookings: 12,
            totalCapacity: 12,
            progressColor: 'bg-red-500',
            isPublished: true
        },
        {
            id: 15,
            name: 'Elementary First Aid',
            courseId: '000015',
            icon: Heart,
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-700',
            status: 'Unpublished',
            capacityStatus: 'Not Scheduled',
            capacityColor: 'text-gray-400',
            nextSession: '-',
            bookings: null,
            totalCapacity: null,
            progressColor: '',
            isPublished: false
        },
        {
            id: 16,
            name: 'Marine Environmental Awareness',
            courseId: '000016',
            icon: Droplets,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            status: 'Published',
            capacityStatus: 'Enrollment Open',
            capacityColor: 'text-green-500',
            nextSession: '18-20 June',
            bookings: 3,
            totalCapacity: 15,
            progressColor: 'bg-green-500',
            isPublished: true
        }
    ];

    // Filter courses based on active tab, search, and filters
    const filteredCourses = coursesData.filter(course => {
        // Prevent unpublished courses from showing 'Enrollment Open'
        if (!course.isPublished && course.capacityStatus && course.capacityStatus.toLowerCase().includes('enrollment open')) {
            return false;
        }
        // Tab filter
        if (activeTab === 'published' && !course.isPublished) return false;
        if (activeTab === 'unpublished' && course.isPublished) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = course.name.toLowerCase().includes(query);
            const matchesId = course.courseId.toLowerCase().includes(query);
            if (!matchesName && !matchesId) return false;
        }

        // Status filter
        if (statusFilter) {
            if (statusFilter === 'published' && !course.isPublished) return false;
            if (statusFilter === 'unpublished' && course.isPublished) return false;
        }

        // Capacity filter
        if (capacityFilter) {
            const capacity = course.capacityStatus.toLowerCase();
            if (capacityFilter === 'full' && capacity !== 'full') return false;
            if (capacityFilter === 'nearly-full' && capacity !== 'nearly full') return false;
            if (capacityFilter === 'open' && !capacity.includes('enrollment open')) return false;
        }

        // Session filter
        if (sessionFilter) {
            const hasSession = course.nextSession !== '-' && course.nextSession !== 'Not scheduled';
            if (sessionFilter === 'scheduled' && !hasSession) return false;
            if (sessionFilter === 'not-scheduled' && hasSession) return false;
        }

        return true;
    });

    // Export to CSV handler
    const handleExportCSV = () => {
        const headers = ['Course Name', 'Course ID', 'Status', 'Capacity Status', 'Next Session', 'Bookings', 'Total Capacity'];
        const csvData = filteredCourses.map(course => [
            course.name,
            course.courseId,
            course.status,
            course.capacityStatus,
            course.nextSession,
            course.bookings || 0,
            course.totalCapacity || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `courses_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
            setSearchQuery('');
            setStatusFilter('');
            setCapacityFilter('');
            setSessionFilter('');
            setCurrentPage(1);
            setIsRefreshing(false);
        }, 500);
    };

    const totalCourses = activeTab === 'published' 
        ? coursesData.filter(c => c.isPublished).length 
        : coursesData.filter(c => !c.isPublished).length;

    const totalPages = Math.ceil(filteredCourses.length / entriesPerPage);

    const getProgressWidth = (bookings, total) => {
        if (!bookings || !total) return 0;
        return (bookings / total) * 100;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {activeTab === 'published' ? 'Published' : 'Unpublished'} Courses ({totalCourses > 100 ? 412 : totalCourses})
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your training offerings and schedules
                    </p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'published'
                                ? 'bg-[#003971] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Published
                    </button>
                    <button
                        onClick={() => setActiveTab('unpublished')}
                        className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'unpublished'
                                ? 'bg-[#003971] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Unpublished
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
                {/* Filters Row */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex items-center gap-3">
                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="">Status</option>
                                    <option value="published">Published</option>
                                    <option value="unpublished">Unpublished</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Capacity Filter */}
                            <div className="relative">
                                <select
                                    value={capacityFilter}
                                    onChange={(e) => setCapacityFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="">Capacity</option>
                                    <option value="full">Full</option>
                                    <option value="nearly-full">Nearly Full</option>
                                    <option value="open">Open</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Session Filter */}
                            <div className="relative">
                                <select
                                    value={sessionFilter}
                                    onChange={(e) => setSessionFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                                >
                                    <option value="">Session</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="not-scheduled">Not Scheduled</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Refresh Button */}
                            <button 
                                onClick={handleRefresh}
                                className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Export CSV Button */}
                            <button 
                                onClick={handleExportCSV}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="h-4 w-4 text-gray-500" />
                                Export CSV
                            </button>

                            {/* Create Course Button */}
                            <button
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#003971] text-white rounded-lg hover:bg-[#002855] transition-colors"
                                onClick={() => navigate('/trainingprovider/courses/create')}
                            >
                                <Plus className="h-4 w-4" />
                                Create Course
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Course Name
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Capacity Status
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Next Session
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Bookings
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* Course Name */}
                                    <td className="px-6 py-4">
                                        <button
                                            className="flex items-center gap-3 group focus:outline-none"
                                            onClick={() => navigate(`/trainingprovider/courses/${course.courseId}`)}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${course.iconBg} flex items-center justify-center`}>
                                                <course.icon className={`h-5 w-5 ${course.iconColor}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-blue-700 group-hover:underline">{course.name}</p>
                                                <p className="text-xs text-gray-400">ID: {course.courseId}</p>
                                            </div>
                                        </button>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${
                                            course.status === 'Published' ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                            {course.status}
                                        </span>
                                    </td>

                                    {/* Capacity Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${course.capacityColor}`}>
                                            {course.capacityStatus}
                                        </span>
                                    </td>

                                    {/* Next Session */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{course.nextSession}</span>
                                    </td>

                                    {/* Bookings */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {course.bookings !== null ? (
                                                <>
                                                    <span className="text-sm text-gray-600 min-w-[40px]">
                                                        {course.bookings} / {course.totalCapacity}
                                                    </span>
                                                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${course.progressColor} rounded-full transition-all`}
                                                            style={{ width: `${getProgressWidth(course.bookings, course.totalCapacity)}%` }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4">
                                        <button
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            onClick={() => navigate(`/trainingprovider/courses/${course.courseId}`)}
                                        >
                                            View Details
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
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>of {filteredCourses.length} entries</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage === 1}
                        >
                            <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                        {/* Dynamic Pagination Buttons */}
                        {(() => {
                            const pages = [];
                            const maxPages = totalPages;
                            const showPages = 3;
                            const lastPage = maxPages;
                            if (maxPages <= 5) {
                                for (let i = 1; i <= maxPages; i++) {
                                    pages.push(i);
                                }
                            } else {
                                if (currentPage <= 2) {
                                    pages.push(1, 2, 3, '...', lastPage);
                                } else if (currentPage >= maxPages - 1) {
                                    pages.push(1, '...', maxPages - 2, maxPages - 1, maxPages);
                                } else {
                                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
                                }
                            }
                            return pages.map((page, idx) =>
                                page === '...'
                                    ? <span key={idx} className="px-2 text-gray-400">...</span>
                                    : <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[32px] h-8 text-sm font-medium rounded border transition-colors ${
                                            currentPage === page
                                                ? 'bg-[#003971] border-[#003971] text-white'
                                                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                            );
                        })()}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage === totalPages}
                        >
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrainingProviderCourses;
