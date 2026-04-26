import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Bookmark, Loader2, ClipboardList, ChevronRight } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

/** Matches BookCourse / Training session rows for navigation state */
const mapSessionsForBookCourse = (sessions) => {
    if (!Array.isArray(sessions)) return [];
    return sessions.map((session) => {
        const sDate = session.startDate ? new Date(session.startDate).toLocaleDateString() : '';
        const eDate = session.endDate ? new Date(session.endDate).toLocaleDateString() : '';
        const eventDate = sDate && eDate ? `${sDate} - ${eDate}` : sDate || eDate || 'TBA';
        const total = Number(session.totalSeats) || 0;
        const enrolled = Number(session.enrolledCount) || 0;
        const availableSpaces = Math.max(0, total - enrolled);
        return { id: session.id, eventDate, availableSpaces };
    });
};

const displayCourseLocation = (course, sessions) => {
    const raw = course?.location;
    if (raw && String(raw).trim() && String(raw).toUpperCase() !== 'N/A') return String(raw).trim();
    const s0 = Array.isArray(sessions) ? sessions[0] : null;
    if (s0?.location && String(s0.location).trim()) return String(s0.location).trim();
    return 'Location TBA';
};

const displayCourseProvider = (course) =>
    course?.recruiter?.organizationName || course?.admin?.email || 'Training provider';

const formatDateRange = (sessions) => {
    if (!Array.isArray(sessions) || sessions.length === 0) return 'Dates TBA';
    const s = sessions[0];
    const start = s.startDate ? new Date(s.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    const end = s.endDate ? new Date(s.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    if (start && end && start !== end) return `${start} – ${end}`;
    return start || end || 'Dates TBA';
};

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
    if (u === 'CONFIRMED') return 'Pending Approval';
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

const bookingToBookCourseState = (booking) => {
    const course = booking.course || {};
    const sessions = booking.sessions;
    const priceValue =
        booking.amountPaid != null && booking.amountPaid !== ''
            ? Number(booking.amountPaid)
            : Number(course.price) || 0;
    const currency = booking.currency || course.currency || 'GBP';
    return {
        bookingCourse: {
            id: course.id,
            title: course.title || 'Course',
            provider: displayCourseProvider(course),
            price: `${currency} ${priceValue}`,
            priceValue,
            currency,
            location: displayCourseLocation(course, sessions),
            category: course.category,
            duration: course.duration ? `${course.duration} Days` : 'N/A',
        },
        bookingSessions: mapSessionsForBookCourse(sessions),
    };
};

const savedCourseToBookCourseState = (course) => {
    const priceValue = Number(course.price) || 0;
    const currency = course.currency || 'GBP';
    return {
        bookingCourse: {
            id: course.id,
            title: course.title,
            provider: displayCourseProvider(course),
            price: `${currency} ${course.price ?? '—'}`,
            priceValue,
            currency,
            location: displayCourseLocation(course, course.sessions),
            category: course.category,
            duration: course.duration ? `${course.duration} Days` : 'N/A',
        },
        bookingSessions: mapSessionsForBookCourse(course.sessions),
    };
};

const SavedCourses = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applied');

    const [bookings, setBookings] = useState([]);
    const [savedCoursesList, setSavedCoursesList] = useState([]);

    const [loadingApplied, setLoadingApplied] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [errorApplied, setErrorApplied] = useState(null);
    const [errorSaved, setErrorSaved] = useState(null);

    const fetchBookings = useCallback(async () => {
        try {
            setLoadingApplied(true);
            setErrorApplied(null);
            const response = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_BOOKINGS);
            if (response.status === 'success' && Array.isArray(response.data?.bookings)) {
                setBookings(response.data.bookings);
            } else {
                setBookings([]);
            }
        } catch (e) {
            console.error('Failed to load bookings:', e);
            setErrorApplied(e?.message || 'Could not load applied courses');
            setBookings([]);
        } finally {
            setLoadingApplied(false);
        }
    }, []);

    const fetchSaved = useCallback(async () => {
        try {
            setLoadingSaved(true);
            setErrorSaved(null);
            const response = await httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_SAVED_COURSES);
            if (response.status === 'success' && Array.isArray(response.data?.courses)) {
                setSavedCoursesList(response.data.courses);
            } else {
                setSavedCoursesList([]);
            }
        } catch (e) {
            console.error('Failed to load saved courses:', e);
            setErrorSaved(e?.message || 'Could not load saved courses');
            setSavedCoursesList([]);
        } finally {
            setLoadingSaved(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchSaved();
    }, [fetchBookings, fetchSaved]);

    const tabs = [
        { id: 'applied', label: 'Applied Courses', icon: ClipboardList },
        { id: 'saved', label: 'Saved Courses', icon: Bookmark },
    ];

    return (
        <div className="w-full min-h-full bg-gray-50">
            <div className="mx-auto w-full max-w-3xl lg:max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-12">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/personal/training')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                            aria-label="Back to training"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <img
                            src="/images/logo.png"
                            alt=""
                            className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 sm:hidden"
                        />
                        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight">Saved Courses</h1>
                            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">
                                Applied bookings and courses you have saved for later
                            </p>
                        </div>
                    </div>

                    <div className="flex rounded-xl bg-gray-100 p-1 mb-6 gap-1" role="tablist" aria-label="Course lists">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === id}
                                onClick={() => setActiveTab(id)}
                                className={`flex-1 min-w-0 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                                    activeTab === id
                                        ? 'bg-white text-[#003971] shadow-sm ring-1 ring-gray-200/80'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Icon size={18} className="shrink-0" aria-hidden />
                                <span className="truncate sm:whitespace-normal text-center leading-tight">{label}</span>
                            </button>
                        ))}
                    </div>

                    {activeTab === 'applied' && (
                        <div className="space-y-4">
                            {loadingApplied ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <Loader2 className="h-9 w-9 animate-spin text-[#003971] mb-3" />
                                    <p className="text-sm">Loading applied courses…</p>
                                </div>
                            ) : errorApplied ? (
                                <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 text-center">
                                    {errorApplied}
                                </div>
                            ) : bookings.length > 0 ? (
                                <ul className="space-y-3 list-none p-0 m-0">
                                    {bookings.map((booking) => {
                                        const course = booking.course || {};
                                        const provider = displayCourseProvider(course);
                                        const loc = displayCourseLocation(course, booking.sessions);
                                        const priceLabel =
                                            booking.amountPaid != null && booking.amountPaid !== ''
                                                ? `${booking.currency || 'GBP'} ${booking.amountPaid}`
                                                : null;
                                        const courseId = course.id;
                                        const goToCourse = () => {
                                            if (!courseId) return;
                                            const ps = String(booking.paymentStatus || '').toUpperCase();
                                            const paymentOk = ps === 'SUCCEEDED' || ps === 'PAID';
                                            if (paymentOk) {
                                                navigate(`/personal/training/applied/${encodeURIComponent(booking.id)}`);
                                                return;
                                            }
                                            navigate(`/personal/training/book/${courseId}`, {
                                                state: {
                                                    ...bookingToBookCourseState(booking),
                                                    fromSavedCoursesList: true,
                                                    bookingId: booking.id,
                                                },
                                            });
                                        };

                                        return (
                                            <li key={booking.id}>
                                                <button
                                                    type="button"
                                                    onClick={goToCourse}
                                                    disabled={!courseId}
                                                    className="w-full rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5 text-left transition-colors hover:bg-gray-50 hover:border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003971] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0 flex-1 space-y-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 group-hover:text-[#003971] transition-colors">
                                                                    {course.title || 'Course'}
                                                                </h2>
                                                                <ChevronRight
                                                                    className="shrink-0 text-gray-300 group-hover:text-[#003971] mt-1"
                                                                    size={20}
                                                                    aria-hidden
                                                                />
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
                                                                <span className="inline-flex items-center gap-1.5 min-w-0">
                                                                    <Building2 size={15} className="shrink-0 text-gray-400" />
                                                                    <span className="truncate">{provider}</span>
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                                <span className="inline-flex items-center gap-1.5 text-[#003971]">
                                                                    <MapPin size={15} className="shrink-0" />
                                                                    <span>{loc}</span>
                                                                </span>
                                                                {priceLabel && (
                                                                    <span className="font-semibold text-gray-900 tabular-nums">
                                                                        {priceLabel}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 pt-0.5">{formatDateRange(booking.sessions)}</p>
                                                        </div>
                                                        <div className="flex flex-row sm:flex-col flex-wrap gap-2 shrink-0 sm:items-end">
                                                            <span
                                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusPillClass(
                                                                    booking.bookingStatus
                                                                )}`}
                                                            >
                                                                {bookingStatusLabel(booking.bookingStatus)}
                                                            </span>
                                                            <span
                                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusPillClass(
                                                                    booking.paymentStatus
                                                                )}`}
                                                            >
                                                                Payment: {paymentStatusLabel(booking.paymentStatus)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-14 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                                    <ClipboardList size={44} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                                    <p className="text-gray-600 font-medium">No applied courses yet</p>
                                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                                        Book a course from Training to see your applications and payment status here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            {loadingSaved ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <Loader2 className="h-9 w-9 animate-spin text-[#003971] mb-3" />
                                    <p className="text-sm">Loading saved courses…</p>
                                </div>
                            ) : errorSaved ? (
                                <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 text-center">
                                    {errorSaved}
                                </div>
                            ) : savedCoursesList.length > 0 ? (
                                <ul className="space-y-3 list-none p-0 m-0">
                                    {savedCoursesList.map((course) => {
                                        const provider = displayCourseProvider(course);
                                        const priceLabel = `${course.currency || 'GBP'} ${course.price ?? '—'}`;
                                        const loc = displayCourseLocation(course, course.sessions);

                                        return (
                                            <li key={course.id}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(`/personal/training/book/${course.id}`, {
                                                            state: {
                                                                ...savedCourseToBookCourseState(course),
                                                                fromSavedCoursesList: true,
                                                            },
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5 text-left transition-colors hover:bg-gray-50 hover:border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003971] focus-visible:ring-offset-2 group"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-[#003971] transition-colors">
                                                                    {course.title}
                                                                </h2>
                                                                <ChevronRight
                                                                    className="shrink-0 text-gray-300 group-hover:text-[#003971] mt-0.5"
                                                                    size={20}
                                                                    aria-hidden
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                                <Building2 size={15} className="shrink-0 text-gray-400" />
                                                                <span className="truncate">{provider}</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900 tabular-nums">{priceLabel}</p>
                                                        </div>
                                                        <div className="flex items-start gap-1.5 text-[#003971] text-sm shrink-0 sm:max-w-[14rem]">
                                                            <MapPin size={16} className="shrink-0 mt-0.5" />
                                                            <span className="break-words">{loc}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-14 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                                    <Bookmark size={44} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                                    <p className="text-gray-600 font-medium">No saved courses yet</p>
                                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                                        Save courses from the Training page to see them here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedCourses;
