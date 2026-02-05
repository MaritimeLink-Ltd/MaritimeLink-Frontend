import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Banknote, Bookmark } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const MyJobs = ({ appliedJobs = [], savedJobs = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applied');

    const displayJobs = activeTab === 'applied' ? appliedJobs : savedJobs;

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 sm:p-8 relative">
            {/* Logo in top-left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            </div>

            {/* My Jobs Container - Centered with max-w-xl */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/personal/jobs')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">My Jobs</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('applied')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${activeTab === 'applied'
                            ? 'bg-[#003971] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Applied
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'saved'
                            ? 'bg-[#003971] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Saved
                    </button>
                </div>

                {/* Jobs List */}
                <div className="space-y-3">
                    {displayJobs.length > 0 ? (
                        displayJobs.map((job, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                                            {job.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Building2 size={14} />
                                            <span>{job.company}</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {job.salary}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#003971] text-sm">
                                        <MapPin size={14} />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-base">
                                {activeTab === 'applied'
                                    ? 'No applied jobs yet'
                                    : 'No saved jobs yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyJobs;
