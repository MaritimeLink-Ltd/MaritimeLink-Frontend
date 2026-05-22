import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, GraduationCap, RefreshCw } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

const formatCourseStatus = (status) => {
    const upper = String(status || '').toUpperCase();
    if (upper === 'ACTIVE') return { label: 'Active', className: 'text-green-600' };
    if (upper === 'DRAFT') return { label: 'Draft', className: 'text-orange-600' };
    if (upper === 'PAUSED') return { label: 'Paused', className: 'text-orange-600' };
    if (upper === 'ARCHIVED') return { label: 'Archived', className: 'text-gray-600' };
    return { label: upper.replace(/_/g, ' '), className: 'text-gray-600' };
};

function OversightProviderCourses() {
    const { recruiterId: providerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const creatorType = String(location.state?.creatorType || 'RECRUITER').toUpperCase();
    const providerName = location.state?.providerName || 'Training provider';
    const company = location.state?.company || '';

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [totalCourses, setTotalCourses] = useState(0);

    const loadProviderCourses = async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: String(page),
                limit: String(itemsPerPage),
            });
            if (creatorType === 'ADMIN') {
                params.set('adminId', providerId);
            } else {
                params.set('recruiterId', providerId);
            }

            const res = await httpClient.get(`${API_ENDPOINTS.ADMIN.ADMIN_COURSES}?${params.toString()}`);
            const rows = res?.data?.courses || [];
            setCourses(rows);
            setTotalCourses(
                Number(res?.data?.pagination?.total ?? res?.pagination?.total ?? rows.length ?? 0),
            );
        } catch (err) {
            console.error('Failed to load provider courses:', err);
            setError('Failed to load courses. Please try again later.');
            setCourses([]);
            setTotalCourses(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (providerId) {
            void loadProviderCourses(currentPage);
        }
    }, [providerId, currentPage, creatorType]);

    const totalPages = Math.max(1, Math.ceil(totalCourses / itemsPerPage));

    return (
        <div className="p-8 max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate('/admin/marketplace')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Marketplace Oversight
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e5a8f] mb-2 flex items-center">
                            <GraduationCap className="w-6 h-6 mr-3" />
                            {providerName}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {company ? `${company} · ` : ''}
                            All courses posted by this {creatorType === 'ADMIN' ? 'admin' : 'training provider'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void loadProviderCourses(currentPage)}
                        className={`flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#f8fafc] border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Flagged</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Posted</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading courses...</td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No courses found for this provider.</td>
                                </tr>
                            ) : (
                                courses.map((course) => {
                                    const statusInfo = formatCourseStatus(course.status);
                                    const postedDate = course.createdAt
                                        ? new Date(course.createdAt).toLocaleDateString()
                                        : 'N/A';
                                    return (
                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{course.title}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{course.location || '—'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${statusInfo.className}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm ${course.isFlagged ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                    {course.isFlagged ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">
                                                    {course._count?.bookings ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{postedDate}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/oversight/courses/${course.id}`}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && courses.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalCourses)} of {totalCourses}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                -
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OversightProviderCourses;
