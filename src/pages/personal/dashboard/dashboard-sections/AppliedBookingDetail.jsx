import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Loader2, AlertCircle, Calendar, Clock, User, FileText, ExternalLink } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

const displayCourseLocation = (course, sessions) => {
    const raw = course?.location;
    if (raw && String(raw).trim() && String(raw).toUpperCase() !== 'N/A') return String(raw).trim();
    const s0 = Array.isArray(sessions) ? sessions[0] : null;
    if (s0?.location && String(s0.location).trim()) return String(s0.location).trim();
    return 'Location TBA';
};

const displayCourseProvider = (course) =>
    course?.recruiter?.organizationName || course?.admin?.email || 'Training provider';

const statusPillClass = (status) => {
    const u = (status || '').toUpperCase();
    if (u === 'CONFIRMED' || u === 'SUCCEEDED') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (u === 'PENDING') return 'bg-amber-50 text-amber-800 border-amber-200';
    if (u === 'CANCELLED' || u === 'FAILED') return 'bg-red-50 text-red-800 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
};

const bookingStatusLabel = (status) => {
    const u = String(status || '').toUpperCase();
    if (u === 'PENDING') return 'Pending Approval';
    if (u === 'CONFIRMED') return 'Paid';
    if (u === 'COMPLETED') return 'Approved';
    if (u === 'CANCELLED') return 'Rejected';
    return status || '—';
};

const paymentStatusLabel = (status) => {
    const u = String(status || '').toUpperCase();
    if (u === 'SUCCEEDED') return 'Paid';
    if (u === 'PENDING') return 'Pending';
    if (u === 'REFUNDED') return 'Refunded';
    return status || '—';
};

const formatSessionWhen = (session) => {
    const start = session.startDate ? new Date(session.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    const end = session.endDate ? new Date(session.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    const range = start && end && start !== end ? `${start} – ${end}` : start || end || 'TBA';
    const time =
        session.startTime && session.endTime ? `${session.startTime} – ${session.endTime}` : session.startTime || '';
    return { range, time };
};

/**
 * Read-only booking + course details for paid (or any) professional application.
 * No booking / payment actions.
 */
const AppliedBookingDetail = () => {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!bookingId) {
                setError('Missing booking.');
                setLoading(false);
                return;
            }
            try {
                const res = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_BOOKING(bookingId));
                const b = res?.data?.booking ?? res?.data;
                if (res?.status === 'success' && b) {
                    setBooking(b);
                } else {
                    setError(res?.message || 'Could not load this booking.');
                }
            } catch (e) {
                setError(e?.message || 'Could not load this booking.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [bookingId]);

    const goBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/personal/saved-courses');
    };

    if (loading) {
        return (
            <div className="w-full min-h-[50vh] flex items-center justify-center bg-gray-50 py-16">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 size={36} className="animate-spin text-[#003971]" />
                    <p className="text-sm">Loading booking details…</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="w-full min-h-[50vh] flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
                    <AlertCircle size={44} className="text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-medium mb-2">{error || 'Booking not found'}</p>
                    <button
                        type="button"
                        onClick={() => navigate('/personal/saved-courses')}
                        className="mt-4 text-sm font-medium text-[#003971] hover:underline"
                    >
                        Back to Saved Courses
                    </button>
                </div>
            </div>
        );
    }

    const course = booking.course || {};
    const sessions = Array.isArray(booking.sessions) ? booking.sessions : [];
    const docs = Array.isArray(booking.attachedDocuments) ? booking.attachedDocuments : [];
    const provider = displayCourseProvider(course);
    const loc = displayCourseLocation(course, sessions);
    const amount =
        booking.amountPaid != null && booking.amountPaid !== ''
            ? `${booking.currency || 'GBP'} ${booking.amountPaid}`
            : null;

    return (
        <div className="w-full min-h-full bg-gray-50 py-8 px-4 sm:px-6">
            <div className="mx-auto w-full max-w-2xl">
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 min-h-[44px] text-sm font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Your booking</p>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">{course.title || 'Course'}</h1>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusPillClass(
                                    booking.bookingStatus
                                )}`}
                            >
                                {bookingStatusLabel(booking.bookingStatus)}
                            </span>
                            <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusPillClass(
                                    booking.paymentStatus
                                )}`}
                            >
                                Payment: {paymentStatusLabel(booking.paymentStatus)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 text-gray-600 text-sm mb-6">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="shrink-0 text-gray-400" />
                            <span>{provider}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#003971]">
                            <MapPin size={16} className="shrink-0" />
                            <span>{loc}</span>
                        </div>
                        {amount && (
                            <p className="text-gray-900 font-semibold tabular-nums pt-1">{amount}</p>
                        )}
                    </div>

                    {course.category && (
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <p className="text-sm font-medium text-gray-800">{course.category}</p>
                        </div>
                    )}

                    {course.description && (
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-gray-800 mb-2">About this course</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-800 mb-3">Your session(s)</h2>
                        {sessions.length === 0 ? (
                            <p className="text-sm text-gray-500">No session details were returned for this booking.</p>
                        ) : (
                            <ul className="space-y-3 list-none p-0 m-0">
                                {sessions.map((session) => {
                                    const { range, time } = formatSessionWhen(session);
                                    const sessionLoc = session.location?.trim() || loc;
                                    return (
                                        <li
                                            key={session.id}
                                            className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-700"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <Calendar size={16} className="shrink-0 text-[#003971] mt-0.5" />
                                                <span className="font-medium text-gray-900">{range}</span>
                                            </div>
                                            {time && (
                                                <div className="flex items-center gap-2 ml-6 mb-1">
                                                    <Clock size={14} className="shrink-0 text-gray-400" />
                                                    <span>{time}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 ml-6 mb-1">
                                                <MapPin size={14} className="shrink-0 text-gray-400" />
                                                <span>{sessionLoc}</span>
                                            </div>
                                            {session.instructor && session.instructor !== 'TBD' && (
                                                <div className="flex items-center gap-2 ml-6">
                                                    <User size={14} className="shrink-0 text-gray-400" />
                                                    <span>{session.instructor}</span>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {(booking.bookedAt || booking.paidAt) && (
                        <div className="text-xs text-gray-500 space-y-1 mb-8 border-t border-gray-100 pt-6">
                            {booking.bookedAt && (
                                <p>Booked: {new Date(booking.bookedAt).toLocaleString()}</p>
                            )}
                            {booking.paidAt && (
                                <p>Paid: {new Date(booking.paidAt).toLocaleString()}</p>
                            )}
                            {booking.id && <p className="font-mono break-all opacity-80">Reference: {booking.id}</p>}
                        </div>
                    )}

                    {docs.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-[#003971]" />
                                Documents attached to this booking
                            </h2>
                            <ul className="space-y-2 list-none p-0 m-0">
                                {docs.map((doc) => (
                                    <li
                                        key={doc.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-sm"
                                    >
                                        <span className="text-gray-800 truncate">{doc.name || 'Document'}</span>
                                        {doc.fileUrl && (
                                            <a
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 inline-flex items-center gap-1 text-[#003971] font-medium hover:underline"
                                            >
                                                View
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppliedBookingDetail;
