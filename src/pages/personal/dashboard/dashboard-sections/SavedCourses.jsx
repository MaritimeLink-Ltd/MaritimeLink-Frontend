import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Banknote, Bookmark } from 'lucide-react';

const SavedCourses = ({ savedCourses = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 sm:p-8 relative">
            {/* Logo in top-left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            </div>

            {/* Saved Courses Container - Centered with max-w-xl */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/personal/training')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Saved Courses</h1>
                </div>

                {/* Courses List */}
                <div className="space-y-3">
                    {savedCourses.length > 0 ? (
                        savedCourses.map((course, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Building2 size={14} />
                                            <span>{course.provider}</span>
                                        </div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {course.price}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[#003971] text-sm">
                                        <MapPin size={14} />
                                        <span>{course.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bookmark size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                            <p className="text-gray-400 text-base">
                                No saved courses yet
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Save courses from the Training page to see them here
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedCourses;
