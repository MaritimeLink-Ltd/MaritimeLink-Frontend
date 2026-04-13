import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, MapPin, Building2, Loader2, Calendar, CreditCard, Clock } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const statusConfig = {
    PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const paymentStatusConfig = {
    PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
    SUCCEEDED: { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    FAILED: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700' },
    REFUNDED: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-600' },
};

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoading(true);
                const response = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_BOOKINGS);
                if (response.status === 'success' && response.data?.bookings) {
                    setBookings(response.data.bookings);
                } else if (response.status === 'success' && Array.isArray(response.data)) {
                    setBookings(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = activeTab === 'all'
        ? bookings
        : bookings.filter(b => b.bookingStatus === activeTab);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full h-full flex items-start justify-center bg-gray-50 p-4 sm:p-8 relative overflow-y-auto">
            {/* Logo in top-left corner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            </div>

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8 sm:mt-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/personal/training')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">My Bookings</h1>
                        <p className="text-sm text-gray-500">Your course booking history</p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'CONFIRMED', label: 'Confirmed' },
                        { key: 'PENDING', label: 'Pending' },
                        { key: 'COMPLETED', label: 'Completed' },
                        { key: 'CANCELLED', label: 'Cancelled' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${activeTab === tab.key
                                ? 'bg-[#003971] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                            {tab.key !== 'all' && (
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({bookings.filter(b => b.bookingStatus === tab.key).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 size={32} className="animate-spin text-[#003971] mb-3" />
                            <p>Loading bookings...</p>
                        </div>
                    ) : filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => {
                            const bStatus = statusConfig[booking.bookingStatus] || statusConfig.PENDING;
                            const pStatus = paymentStatusConfig[booking.paymentStatus] || paymentStatusConfig.PENDING;
                            const course = booking.course || {};

                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => navigate(`/personal/bookings/${booking.id}`)}
                                    className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                                >
                                    {/* Course Title & Status */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="text-base font-semibold text-gray-800 flex-1">
                                            {course.title || 'Course Booking'}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bStatus.bg} ${bStatus.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${bStatus.dot}`}></span>
                                            {bStatus.label}
                                        </span>
                                    </div>

                                    {/* Course Details */}
                                    <div className="space-y-1.5 mb-3">
                                        {course.recruiter?.organizationName && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Building2 size={14} />
                                                <span>{course.recruiter.organizationName}</span>
                                            </div>
                                        )}
                                        {course.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin size={14} />
                                                <span>{course.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom row: Date, Payment, Amount */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Calendar size={12} />
                                                <span>{formatDate(booking.createdAt)}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pStatus.bg} ${pStatus.text}`}>
                                                <CreditCard size={10} className="mr-1" />
                                                {pStatus.label}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {booking.currency || 'GBP'} {booking.amount || course.price || '0'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <Award size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                            <p className="text-gray-500 text-base font-medium">No bookings found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {activeTab === 'all'
                                    ? 'Book a course from the Training page to get started'
                                    : `No ${activeTab.toLowerCase()} bookings`}
                            </p>
                            <button
                                onClick={() => navigate('/personal/training')}
                                className="mt-4 px-5 py-2.5 bg-[#003971] text-white rounded-full text-sm font-medium hover:bg-[#002b54] transition-colors"
                            >
                                Browse Courses
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
