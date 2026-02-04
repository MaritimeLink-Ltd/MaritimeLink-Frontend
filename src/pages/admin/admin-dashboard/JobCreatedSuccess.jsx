import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin, Briefcase, FileText, DollarSign, Calendar, ArrowLeft } from 'lucide-react';

function JobCreatedSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const jobData = location.state?.jobData || {};

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-6">
            {/* Back Icon */}
            <button
                onClick={() => navigate('/admin/jobs')}
                className="text-gray-600 hover:text-gray-900 mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="max-w-3xl mx-auto">
                {/* Job Details Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {jobData.jobTitle || 'Job Title'}
                        </h2>
                        <div className="flex items-center text-gray-600 mt-2">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>{jobData.location || 'Location'}</span>
                        </div>
                    </div>

                    {/* Job Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Category</p>
                                <p className="font-semibold text-gray-900">{jobData.category || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Contract Type</p>
                                <p className="font-semibold text-gray-900">{jobData.contractType || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Salary</p>
                                <p className="font-semibold text-gray-900">{jobData.salary || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Posted</p>
                                <p className="font-semibold text-gray-900">Just now</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    {jobData.description && (
                        <div className="border-t border-gray-100 pt-6 mt-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Job Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {jobData.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobCreatedSuccess;
