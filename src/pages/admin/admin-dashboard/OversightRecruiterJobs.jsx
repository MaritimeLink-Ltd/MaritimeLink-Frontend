import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Briefcase, RefreshCw } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function OversightRecruiterJobs() {
    const { recruiterId } = useParams();
    const navigate = useNavigate();
    
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simple Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalJobs, setTotalJobs] = useState(0);

    const loadRecruiterJobs = async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            // Fetch jobs for specific recruiter. 
            // Depending on architecture, we pass recruiterId as query param to the main admin jobs endpoint
            const res = await httpClient.get(`${API_ENDPOINTS.JOBS.ADMIN_ALL}?recruiterId=${recruiterId}&page=${page}&limit=${itemsPerPage}`);
            
            // Adjust based on the actual response structure of /api/admin/jobs
            if (res?.data?.jobs) {
                setJobs(res.data.jobs);
                setTotalJobs(res.data?.pagination?.total || res?.total || res.data.jobs.length || 0);
            } else if (res?.data?.listings) {
                setJobs(res.data.listings);
                setTotalJobs(res.data?.total || res.total || res.data.listings.length || 0);
            }
        } catch (err) {
            console.error('Failed to load recruiter jobs:', err);
            setError('Failed to load jobs. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (recruiterId) {
            loadRecruiterJobs(currentPage);
        }
    }, [recruiterId, currentPage]);

    const totalPages = Math.max(1, Math.ceil(totalJobs / itemsPerPage));

    return (
        <div className="p-8 max-w-[1600px] mx-auto w-full">
            {/* Header & Navigation */}
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/admin/marketplace')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Marketplace Oversight
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e5a8f] mb-2 flex items-center">
                            <Briefcase className="w-6 h-6 mr-3" />
                            Recruiter Jobs
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Viewing jobs posted by Recruiter ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{recruiterId}</span>
                        </p>
                    </div>
                    <button 
                        onClick={() => loadRecruiterJobs(currentPage)}
                        className={`flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Table Area */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#f8fafc] border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Job Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Risk Level
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Posted
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        Loading jobs...
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No jobs found for this recruiter.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => {
                                    const formattedStatus = job.status === 'ACTIVE' ? 'Active' : (job.status === 'DRAFT' ? 'Draft' : 'Closed');
                                    let statusColor = 'text-gray-600';
                                    if (formattedStatus === 'Active') statusColor = 'text-green-600';
                                    
                                    let riskColor = 'text-green-600';
                                    if (job.riskLevel === 'MEDIUM') riskColor = 'text-orange-600';
                                    if (job.riskLevel === 'HIGH') riskColor = 'text-red-600';
                                    
                                    const jobType = job.category === 'CATERING_AND_MEDICAL' ? 'Catering & Medical' : 
                                                   (job.category === 'OFFICER' ? 'Officer' : 'Ratings & Crew');
                                                   
                                    const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A';

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{job.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{job.description || 'No description'}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-semibold text-[#1e5a8f]">{jobType}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-900">{job.location}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${statusColor}`}>
                                                    {formattedStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-sm font-semibold ${riskColor}`}>
                                                    {job.riskLevel || 'LOW'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-500">{postedDate}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/admin/marketplace/oversight/jobs/${job.id}`}
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

                {/* Pagination */}
                {!isLoading && jobs.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalJobs)}</span> of <span className="font-medium">{totalJobs}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                -
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e5a8f] text-white text-sm font-medium shadow-sm">
                                {currentPage}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages || totalPages === 0}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default OversightRecruiterJobs;
