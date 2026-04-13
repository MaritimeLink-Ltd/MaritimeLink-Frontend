import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Building2, Calendar, CreditCard, Clock, Award, Loader2, AlertCircle, XCircle } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const statusConfig = {
    PENDING: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
    CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    COMPLETED: { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Award, iconColor: 'text-blue-500' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-500' },
};

const paymentStatusConfig = {
    PENDING: { label: 'Payment Pending', color: 'text-amber-600' },
    SUCCEEDED: { label: 'Payment Successful', color: 'text-emerald-600' },
    FAILED: { label: 'Payment Failed', color: 'text-red-600' },
    REFUNDED: { label: 'Refunded', color: 'text-gray-600' },
};

const BookingConfirmation = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setIsLoading(true);
                const response = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_BOOKING_DETAIL(bookingId));
                if (response.status === 'success' && response.data) {
                    setBooking(response.data.booking || response.data);
                } else {
                    setError('Could not load booking details.');
                }
            } catch (err) {
                console.error('Failed to fetch booking:', err);
                setError(err.message || 'Failed to load booking details.');
            } finally {
                setIsLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading
    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white lg:bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 size={36} className="animate-spin text-[#003971]" />
                    <p>Loading booking details...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !booking) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white lg:bg-gray-50">
                <div className="text-center">
                    <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">{error || 'Booking not found'}</p>
                    <button
                        onClick={() => navigate('/personal/training')}
                        className="mt-4 text-[#003971] hover:underline text-sm font-medium"
                    >
                        Back to Training
                    </button>
                </div>
            </div>
        );
    }

    const course = booking.course || {};
    const sessions = booking.sessions || booking.bookedSessions || [];
    const bStatus = statusConfig[booking.bookingStatus] || statusConfig.PENDING;
    const pStatus = paymentStatusConfig[booking.paymentStatus] || paymentStatusConfig.PENDING;
    const StatusIcon = bStatus.icon;

    return (
        <div className="w-full min-h-screen flex justify-center py-10 px-4 sm:px-8 bg-white lg:bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-xl bg-white lg:rounded-2xl lg:shadow-md p-4 sm:p-8 h-auto flex flex-col mb-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/personal/training')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors min-h-[44px]"
                >
                    <ArrowLeft size={20} />
                    <span className="text-lg font-medium">Booking Details</span>
                </button>

                {/* Status Banner */}
                <div className={`${bStatus.bg} ${bStatus.border} border rounded-xl p-4 mb-6 flex items-center gap-3`}>
                    <StatusIcon size={28} className={bStatus.iconColor} />
                    <div>
                        <p className={`text-base font-semibold ${bStatus.text}`}>{bStatus.label}</p>
                        <p className={`text-sm ${pStatus.color}`}>{pStatus.label}</p>
                    </div>
                </div>

                {/* Course Info */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        {course.title || 'Course Booking'}
                    </h2>
                    <div className="space-y-2">
                        {(course.recruiter?.organizationName || course.admin?.email) && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Building2 size={16} />
                                <span>{course.recruiter?.organizationName || course.admin?.email}</span>
                            </div>
                        )}
                        {course.location && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                <span>{course.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Booking ID</p>
                        <p className="text-sm font-semibold text-gray-800 break-all">{booking.id?.slice(0, 8)}...</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Booked On</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Category</p>
                        <p className="text-sm font-semibold text-gray-800">{course.category || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Course Type</p>
                        <p className="text-sm font-semibold text-gray-800">{course.courseType || 'N/A'}</p>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CreditCard size={16} />
                        Payment Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount</span>
                            <span className="font-semibold text-gray-800">
                                {booking.currency || 'GBP'} {booking.amount || course.price || '0'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment Status</span>
                            <span className={`font-semibold ${pStatus.color}`}>{pStatus.label}</span>
                        </div>
                        {booking.paymentIntentId && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="font-mono text-xs text-gray-600">{booking.paymentIntentId.slice(0, 16)}...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booked Sessions */}
                {sessions.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar size={16} />
                            Booked Sessions ({sessions.length})
                        </h3>
                        <div className="space-y-2">
                            {sessions.map((session, index) => {
                                const s = session.session || session;
                                const sDate = s.startDate ? new Date(s.startDate).toLocaleDateString() : '';
                                const eDate = s.endDate ? new Date(s.endDate).toLocaleDateString() : '';
                                const eventDate = sDate && eDate ? `${sDate} - ${eDate}` : (sDate || eDate || 'TBA');

                                return (
                                    <div key={s.id || index} className="border border-gray-200 rounded-xl p-3">
                                        <p className="text-sm font-semibold text-gray-800">{eventDate}</p>
                                        {s.location && (
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <MapPin size={12} />
                                                {s.location}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3 mt-auto pt-4">
                    <button
                        onClick={() => navigate('/personal/my-bookings')}
                        className="w-full py-3 bg-[#003971] text-white rounded-full font-medium hover:bg-[#002b54] transition-colors min-h-[44px]"
                    >
                        View All Bookings
                    </button>
                    <button
                        onClick={() => navigate('/personal/training')}
                        className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
                    >
                        Back to Training
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
