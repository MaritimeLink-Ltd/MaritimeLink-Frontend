import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2 } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const BookCourse = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Sample course data
    const courses = {
        '1': {
            id: 1,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days'
        },
        '2': {
            id: 2,
            title: 'Advanced Firefighting',
            provider: 'Maritime Safety Institute',
            price: 'GBP 1200',
            location: 'Southampton, United Kingdom',
            category: 'Safety',
            duration: '3 Days'
        },
        '3': {
            id: 3,
            title: 'Medical First Aid',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 450',
            location: 'London, United Kingdom',
            category: 'Medical',
            duration: '2 Days'
        },
        '4': {
            id: 4,
            title: 'Bridge Resource Management',
            provider: 'Navigation Training Academy',
            price: 'GBP 1500',
            location: 'Liverpool, United Kingdom',
            category: 'Navigation',
            duration: '7 Days'
        },
        '5': {
            id: 5,
            title: 'STCW Refresher Course',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 650',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '3 Days'
        }
    };

    const course = courses[courseId] || courses['1'];

    const handlePayNow = () => {
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/personal/training');
        }, 2000);
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-6 left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 h-[80vh] flex flex-col">
                {/* Content Area - scrollable if needed */}
                <div className="flex-1 overflow-y-auto">
                    {/* Back Button and Title */}
                    <button
                        onClick={() => navigate('/personal/training')}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-medium">Book Course</span>
                    </button>

                    {/* Course Title */}
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {course.title}
                    </h2>

                    {/* Company and Location */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Building2 size={16} />
                            <span>{course.provider}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{course.location}</span>
                        </div>
                    </div>

                    {/* Category and Duration Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Category</p>
                            <p className="font-semibold text-gray-800">{course.category}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Course Duration</p>
                            <p className="font-semibold text-gray-800">{course.duration}</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold text-gray-800">{course.price}</p>
                    </div>
                </div>

                {/* Pay Now Button - stays at bottom */}
                <button
                    onClick={handlePayNow}
                    className="w-full py-3 bg-[#003971] text-white rounded-lg font-medium hover:bg-[#003971]/90 transition-colors mt-6"
                >
                    Pay Now
                </button>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
                        <p className="text-gray-600">Your course has been booked successfully.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookCourse;
