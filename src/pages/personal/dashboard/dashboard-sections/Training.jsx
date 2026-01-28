import React, { useState } from 'react';
import { MapPin, Building2, Banknote, SlidersHorizontal, Award, ArrowLeft } from 'lucide-react';

const Training = ({ onBookClick }) => {
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Sample training courses data
    const courses = [
        {
            id: 1,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies. This course meets international STCW requirements and is mandatory for all personnel working at sea.

Participants will receive hands-on training in personal survival techniques, fire prevention and firefighting, elementary first aid, and personal safety and social responsibilities. The course focuses on real-life scenarios to ensure participants can act confidently and responsibly in emergency situations.

Upon successful completion, participants will be awarded an STCW-compliant certificate, recognized by maritime authorities and employers worldwide.

This training is suitable for new entrants to the maritime industry as well as experienced seafarers requiring recertification.`
        },
        {
            id: 2,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies.`
        },
        {
            id: 3,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies.`
        },
        {
            id: 4,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies.`
        },
        {
            id: 5,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies.`
        }
    ];

    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Training Courses</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Find and book maritime and offshore training</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-800 transition-colors min-h-[44px] w-full sm:w-auto">
                        <SlidersHorizontal size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Course List - Left Sidebar - Hidden on mobile when course is selected */}
                <div className={`${selectedCourse && 'hidden lg:block'} w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide`}>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className={`p-5 border-b border-gray-200 cursor-pointer transition-colors ${selectedCourse?.id === course.id
                                ? 'bg-blue-50 border-l-4 border-l-blue-900'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Building2 size={14} />
                                <span>{course.provider}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-800">{course.price}</div>
                        </div>
                    ))}
                </div>

                {/* Course Detail - Right Side - Full width on mobile when course selected */}
                <div className={`${!selectedCourse && 'hidden lg:flex'} flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide`}>
                    {selectedCourse ? (
                        <div className="p-4 sm:p-8">
                            {/* Course Header */}
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-3">
                                <div className="flex items-center gap-2 sm:gap-0 flex-1">
                                    <button
                                        onClick={() => setSelectedCourse(null)}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                                    >
                                        <ArrowLeft size={20} className="text-gray-700" />
                                    </button>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{selectedCourse.title}</h2>
                                </div>
                                <button
                                    onClick={() => onBookClick(selectedCourse)}
                                    className="px-6 py-2.5 bg-blue-900 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-colors min-h-[44px] w-full sm:w-auto"
                                >
                                    Book now
                                </button>
                            </div>

                            {/* Course Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 size={18} />
                                    <span>{selectedCourse.provider}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={18} />
                                    <span>{selectedCourse.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Banknote size={18} />
                                    <span>{selectedCourse.price}</span>
                                </div>
                            </div>

                            {/* Category and Duration */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Category</p>
                                    <p className="font-semibold text-gray-800">{selectedCourse.category}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Course Duration</p>
                                    <p className="font-semibold text-gray-800">{selectedCourse.duration}</p>
                                </div>
                            </div>

                            {/* Course Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Course Description</h3>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {selectedCourse.description}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No course selected
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Award size={64} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                                <p className="text-gray-400 text-lg">Select a course to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Training;
