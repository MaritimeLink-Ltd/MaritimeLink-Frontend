import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const BookingComplete = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const redirectStatus = searchParams.get('redirect_status');

    const [booking, setBooking] = useState(null);
    const [bookingError, setBookingError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!bookingId) {
                setBookingError('Missing booking reference.');
                setLoading(false);
                return;
            }
            try {
                const res = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_BOOKING(bookingId));
                const b = res?.data?.booking ?? res?.data;
                if (res?.status === 'success' && b) {
                    setBooking(b);
                } else {
                    setBookingError(res?.message || 'Could not load booking.');
                }
            } catch (e) {
                setBookingError(e?.message || 'Could not load booking.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [bookingId]);

    const stripeRedirectOk = redirectStatus === 'succeeded';
    const paymentOk =
        stripeRedirectOk ||
        String(booking?.paymentStatus || '').toUpperCase() === 'SUCCEEDED' ||
        String(booking?.paymentStatus || '').toLowerCase() === 'paid';

    return (
        <div className="w-full min-h-screen flex justify-center items-start py-12 px-4 bg-white lg:bg-gray-50">
            <div className="w-full max-w-md bg-white lg:rounded-2xl lg:shadow-md p-8 text-center">
                <button
                    type="button"
                    onClick={() => navigate('/personal/training')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 mx-auto"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back to training</span>
                </button>

                {loading ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500 py-8">
                        <Loader2 className="animate-spin text-[#003971]" size={36} />
                        <p className="text-sm">Loading booking…</p>
                    </div>
                ) : paymentOk ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-800 mb-2">Booking confirmed</h1>
                        {booking?.course?.title && (
                            <p className="text-base font-medium text-gray-800 mb-2">{booking.course.title}</p>
                        )}
                        <p className="text-sm text-gray-600 mb-4">
                            Your payment was received. You can view this booking anytime from your account.
                        </p>
                        {stripeRedirectOk && bookingError && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 mb-4">
                                Booking details are still syncing. If something looks wrong, refresh in a moment.
                            </p>
                        )}
                        {booking?.id && (
                            <p className="text-xs text-gray-400 font-mono break-all mb-6">Ref: {booking.id}</p>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate('/personal/training')}
                            className="w-full py-3 rounded-full bg-[#003971] text-white text-sm font-medium hover:bg-[#003971]/90"
                        >
                            Done
                        </button>
                    </>
                ) : bookingError ? (
                    <>
                        <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
                        <p className="text-gray-700 text-sm mb-2">{bookingError}</p>
                        <p className="text-xs text-gray-500">
                            If you just paid, the server may still be updating. Refresh in a moment or check your bookings list.
                        </p>
                    </>
                ) : (
                    <>
                        <Loader2 className="animate-spin text-[#003971] mx-auto mb-4" size={40} />
                        <h1 className="text-lg font-semibold text-gray-800 mb-2">Processing payment</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            We’re confirming your payment with the server. You can refresh this page in a few seconds.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full py-3 rounded-full border-2 border-[#003971] text-[#003971] text-sm font-medium"
                        >
                            Refresh
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingComplete;
