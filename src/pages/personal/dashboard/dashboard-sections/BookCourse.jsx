import React from 'react';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const BookCourse = ({ course, onBack }) => {
    const handlePayNow = () => {
        alert('Proceeding to payment...');
        onBack();
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-6 left-6">
                <img src={logo} alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 h-[80vh] flex flex-col">
                {/* Content Area - scrollable if needed */}
                <div className="flex-1 overflow-y-auto">
                    {/* Back Button and Title */}
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-medium">Book Course</span>
                    </button>

                    {/* Course Title */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {course?.title || 'STCW Basic Safety Training'}
                    </h2>

                    {/* Company and Location */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Building2 size={16} />
                            <span>{course?.provider || 'ABC Company'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{course?.location || 'London, United Kingdom'}</span>
                        </div>
                    </div>

                    {/* Category and Duration Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Category</p>
                            <p className="font-semibold text-gray-800">{course?.category || 'STCW'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Course Duration</p>
                            <p className="font-semibold text-gray-800">{course?.duration || '5 Days'}</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold text-gray-800">{course?.price || 'GBP 850'}</p>
                    </div>
                </div>

                {/* Pay Now Button - stays at bottom */}
                <button
                    onClick={handlePayNow}
                    className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors mt-6"
                >
                    Pay Now
                </button>
            </div>
        </div>
    );
};

export default BookCourse;
