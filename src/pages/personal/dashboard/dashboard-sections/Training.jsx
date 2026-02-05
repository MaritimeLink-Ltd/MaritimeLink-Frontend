import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Banknote, SlidersHorizontal, Award, ArrowLeft, X } from 'lucide-react';

const Training = () => {
    const navigate = useNavigate();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        category: null,
        priceRange: null,
        duration: null
    });
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const [isFilterActive, setIsFilterActive] = useState(false);

    // Sample training courses data
    const allCourses = [
        {
            id: 1,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            priceValue: 850,
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days',
            durationValue: 5,
            description: `The STCW Basic Safety Training course is designed to provide seafarers with essential knowledge and practical skills required to respond effectively to onboard emergencies. This course meets international STCW requirements and is mandatory for all personnel working at sea.

Participants will receive hands-on training in personal survival techniques, fire prevention and firefighting, elementary first aid, and personal safety and social responsibilities. The course focuses on real-life scenarios to ensure participants can act confidently and responsibly in emergency situations.

Upon successful completion, participants will be awarded an STCW-compliant certificate, recognized by maritime authorities and employers worldwide.

This training is suitable for new entrants to the maritime industry as well as experienced seafarers requiring recertification.`
        },
        {
            id: 2,
            title: 'Advanced Firefighting',
            provider: 'Maritime Safety Institute',
            price: 'GBP 1200',
            priceValue: 1200,
            location: 'Southampton, United Kingdom',
            category: 'Safety',
            duration: '3 Days',
            durationValue: 3,
            description: `Advanced training in firefighting techniques for maritime professionals.`
        },
        {
            id: 3,
            title: 'Medical First Aid',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 450',
            priceValue: 450,
            location: 'London, United Kingdom',
            category: 'Medical',
            duration: '2 Days',
            durationValue: 2,
            description: `Comprehensive medical first aid training for seafarers.`
        },
        {
            id: 4,
            title: 'Bridge Resource Management',
            provider: 'Navigation Training Academy',
            price: 'GBP 1500',
            priceValue: 1500,
            location: 'Liverpool, United Kingdom',
            category: 'Navigation',
            duration: '7 Days',
            durationValue: 7,
            description: `Advanced bridge management and navigation skills.`
        },
        {
            id: 5,
            title: 'STCW Refresher Course',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 650',
            priceValue: 650,
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '3 Days',
            durationValue: 3,
            description: `Refresher training for STCW certificates.`
        }
    ];

    // Filter courses based on active filters
    const courses = allCourses.filter(course => {
        if (filters.category && course.category !== filters.category) return false;
        if (filters.priceRange) {
            if (filters.priceRange === 'Under GBP 500' && course.priceValue >= 500) return false;
            if (filters.priceRange === 'GBP 500 - 1000' && (course.priceValue < 500 || course.priceValue > 1000)) return false;
            if (filters.priceRange === 'Over GBP 1000' && course.priceValue <= 1000) return false;
        }
        if (filters.duration) {
            if (filters.duration === '1-3 Days' && course.durationValue > 3) return false;
            if (filters.duration === '4-7 Days' && (course.durationValue < 4 || course.durationValue > 7)) return false;
            if (filters.duration === 'Over 7 Days' && course.durationValue <= 7) return false;
        }
        return true;
    });

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Training Courses</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">Find and book maritime and offshore training</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (isFilterActive) {
                                setFilters({ category: null, priceRange: null, duration: null });
                                setTempFilters({ category: null, priceRange: null, duration: null });
                                setIsFilterActive(false);
                            } else {
                                setShowFilter(true);
                            }
                        }}
                        className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] w-full sm:w-auto ${
                            isFilterActive
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-[#003971] text-white hover:bg-[#003971]/90'
                        }`}
                    >
                        {isFilterActive ? <X size={18} /> : <SlidersHorizontal size={18} />}
                        {isFilterActive ? 'Remove Filter' : 'Filter'}
                    </button>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex lg:overflow-hidden">
                {/* Course List - Left Sidebar - Hidden on mobile when course is selected */}
                <div className={`${selectedCourse && 'hidden lg:block'} w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto scrollbar-hide`}>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className={`p-5 border-b border-gray-200 cursor-pointer transition-colors ${selectedCourse?.id === course.id
                                ? 'bg-[#003971]/5 border-l-4 border-l-[#003971]'
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
                                    onClick={() => navigate(`/personal/training/book/${selectedCourse.id}`)}
                                    className="px-6 py-2.5 bg-[#003971] text-white rounded-full text-sm font-medium hover:bg-[#003971]/90 transition-colors min-h-[44px] w-full sm:w-auto"
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

            {/* Filter Modal */}
            {showFilter && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => {
                            setShowFilter(false);
                            setTempFilters({ ...filters });
                        }}
                    />

                    {/* Filter Panel */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Filter Courses</h2>
                                <button
                                    onClick={() => {
                                        setShowFilter(false);
                                        setTempFilters({ ...filters });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Category</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['STCW', 'Safety', 'Medical', 'Navigation'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setTempFilters({ 
                                                ...tempFilters, 
                                                category: tempFilters.category === cat ? null : cat 
                                            })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                tempFilters.category === cat
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Price Range</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Under GBP 500', 'GBP 500 - 1000', 'Over GBP 1000'].map((price) => (
                                        <button
                                            key={price}
                                            onClick={() => setTempFilters({ 
                                                ...tempFilters, 
                                                priceRange: tempFilters.priceRange === price ? null : price 
                                            })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                tempFilters.priceRange === price
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {price}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Filter */}
                            <div className="mb-8">
                                <h3 className="text-base font-semibold text-gray-800 mb-3">Duration</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['1-3 Days', '4-7 Days', 'Over 7 Days'].map((dur) => (
                                        <button
                                            key={dur}
                                            onClick={() => setTempFilters({ 
                                                ...tempFilters, 
                                                duration: tempFilters.duration === dur ? null : dur 
                                            })}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                tempFilters.duration === dur
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {dur}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Filter Button */}
                            <button
                                onClick={() => {
                                    setFilters({ ...tempFilters });
                                    setIsFilterActive(
                                        tempFilters.category || tempFilters.priceRange || tempFilters.duration
                                    );
                                    setShowFilter(false);
                                }}
                                className="w-full py-3 bg-[#003971] text-white rounded-lg font-medium hover:bg-[#003971]/90 transition-colors"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Training;
