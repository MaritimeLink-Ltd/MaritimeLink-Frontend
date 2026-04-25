import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, MapPin, Building2, Check, Folder, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import documentService from '../../../../services/documentService';
import { stripePromise } from '../../../../lib/stripeClient';

const mapSessionsArray = (sessions) => {
    if (!Array.isArray(sessions)) return [];
    return sessions.map((session) => {
        const sDate = session.startDate ? new Date(session.startDate).toLocaleDateString() : '';
        const eDate = session.endDate ? new Date(session.endDate).toLocaleDateString() : '';
        const eventDate = sDate && eDate ? `${sDate} - ${eDate}` : (sDate || eDate || 'TBA');
        const total = Number(session.totalSeats) || 0;
        const enrolled = Number(session.enrolledCount) || 0;
        const availableSpaces = Math.max(0, total - enrolled);
        const status = String(session.status || (availableSpaces > 0 ? 'AVAILABLE' : 'FULL')).toUpperCase();
        return {
            id: session.id,
            eventDate,
            availableSpaces,
            status,
            isBookable: status === 'AVAILABLE' && availableSpaces > 0,
        };
    });
};

const sessionStatusPill = (status) => {
    if (status === 'FULL') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'EXPIRED') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

function CoursePaymentForm({ clientSecret, bookingId, payLabel, onAbandon }) {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [localError, setLocalError] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        const card = elements.getElement(CardElement);
        if (!card) {
            setLocalError('Card field is not ready. Please try again.');
            return;
        }
        setBusy(true);
        setLocalError(null);
        const returnUrl = `${window.location.origin}/personal/training/booking-complete?bookingId=${encodeURIComponent(bookingId)}`;
        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card },
            return_url: returnUrl,
        });
        setBusy(false);
        if (error) {
            setLocalError(error.message || 'Payment failed.');
            return;
        }
        navigate(`/personal/training/booking-complete?bookingId=${encodeURIComponent(bookingId)}`);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
            },
            invalid: { color: '#dc2626' },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card details</label>
                <div className="p-3 sm:p-4 border border-gray-200 rounded-xl bg-white">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>
            {localError && (
                <p className="text-sm text-red-600">{localError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onAbandon}
                    className="px-4 py-3 rounded-full border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 min-h-[44px]"
                >
                    Change selection
                </button>
                <button
                    type="submit"
                    disabled={!stripe || busy}
                    className="flex-1 py-3 rounded-full bg-[#003971] text-white text-sm font-medium hover:bg-[#003971]/90 disabled:bg-gray-300 min-h-[44px] flex items-center justify-center gap-2"
                >
                    {busy ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing…
                        </>
                    ) : (
                        payLabel
                    )}
                </button>
            </div>
        </form>
    );
}

const BookCourse = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId } = useParams();
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedSessions, setSelectedSessions] = useState([]);

    // API data states
    const [course, setCourse] = useState(null);
    const [availableSessions, setAvailableSessions] = useState([]);
    const [documentWalletItems, setDocumentWalletItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const [checkoutSession, setCheckoutSession] = useState(null);

    // From Training: course + sessions come in navigation state; only documents are fetched here.
    // Direct URL / refresh: one GET course-by-id (includes sessions); documents.
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const bookingCourse = location.state?.bookingCourse;
                const bookingSessions = location.state?.bookingSessions;

                if (bookingCourse?.id === courseId) {
                    setCourse({
                        id: bookingCourse.id,
                        title: bookingCourse.title,
                        provider: bookingCourse.provider,
                        price: bookingCourse.price,
                        priceValue: Number(bookingCourse.priceValue) || 0,
                        currency: bookingCourse.currency || 'GBP',
                        location: bookingCourse.location,
                        category: bookingCourse.category,
                        duration: bookingCourse.duration
                    });
                    setAvailableSessions(Array.isArray(bookingSessions) ? bookingSessions : []);

                    const docsRes = await documentService.getDocuments().catch(() => null);
                    if (docsRes?.status === 'success' && docsRes.data?.documents) {
                        const walletOnly = docsRes.data.documents.filter((doc) => {
                            const cat = String(doc?.category || '').toUpperCase();
                            // Course booking should use document wallet items (certificates, endorsements, etc),
                            // not job-application CV / cover letters.
                            if (cat === 'CV_RESUME' || cat === 'COVER_LETTER') return false;
                            if (cat === 'APPLICATION_SUBMISSION') return false;
                            return true;
                        });
                        const mapped = walletOnly.map(doc => ({
                            id: doc.id,
                            title: doc.name || doc.title || 'Untitled Document',
                            expiry: doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A',
                            type: doc.category || 'Other'
                        }));
                        setDocumentWalletItems(mapped);
                    }
                    return;
                }

                const [courseRes, sessionsRes, docsRes] = await Promise.all([
                    httpClient.get(API_ENDPOINTS.COURSES.GET_BY_ID(courseId)).catch(() => null),
                    httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_SESSIONS(courseId)).catch(() => null),
                    documentService.getDocuments().catch(() => null)
                ]);

                const apiCourse = courseRes?.data?.course;

                if (courseRes?.status === 'success' && apiCourse?.id) {
                    setCourse({
                        id: apiCourse.id,
                        title: apiCourse.title,
                        provider: apiCourse.recruiter?.organizationName || apiCourse.admin?.email || 'System Admin',
                        price: `${apiCourse.currency || 'GBP'} ${apiCourse.price}`,
                        priceValue: Number(apiCourse.price) || 0,
                        currency: apiCourse.currency || 'GBP',
                        location: apiCourse.location || 'Online / TBA',
                        category: apiCourse.category,
                        duration: apiCourse.duration ? `${apiCourse.duration} Days` : 'N/A'
                    });
                    const professionalSessions =
                        sessionsRes?.status === 'success' && Array.isArray(sessionsRes.data?.sessions)
                            ? sessionsRes.data.sessions
                            : apiCourse.sessions;
                    setAvailableSessions(mapSessionsArray(professionalSessions));
                }

                if (docsRes?.status === 'success' && docsRes.data?.documents) {
                    const walletOnly = docsRes.data.documents.filter((doc) => {
                        const cat = String(doc?.category || '').toUpperCase();
                        if (cat === 'CV_RESUME' || cat === 'COVER_LETTER') return false;
                        if (cat === 'APPLICATION_SUBMISSION') return false;
                        return true;
                    });
                    const mapped = walletOnly.map(doc => ({
                        id: doc.id,
                        title: doc.name || doc.title || 'Untitled Document',
                        expiry: doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A',
                        type: doc.category || 'Other'
                    }));
                    setDocumentWalletItems(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch booking data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [courseId, location.state]);

    const selectedSessionCount = selectedSessions.length;
    const totalAmount = selectedSessionCount * (course?.priceValue || 0);
    const paymentLocked = !!checkoutSession;

    const documentFolders = Object.entries(
        documentWalletItems.reduce((folders, document) => {
            if (!folders[document.type]) {
                folders[document.type] = [];
            }
            folders[document.type].push(document);
            return folders;
        }, {})
    ).map(([name, documents]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        documents
    }));


    const handleStartCheckout = async () => {
        if (!selectedSessionCount) {
            return;
        }

        if (!stripePromise) {
            setCheckoutError('Card payments are not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.');
            return;
        }

        try {
            setIsCheckoutLoading(true);
            setCheckoutError(null);

            const checkoutPayload = {
                courseId,
                sessionIds: selectedSessions,
                documentIds: selectedDocuments
            };

            const response = await httpClient.post(
                API_ENDPOINTS.COURSES.PROFESSIONAL_CHECKOUT,
                checkoutPayload
            );

            const data = response?.data;
            if (response?.status === 'success' && data?.clientSecret && data?.bookingId) {
                setCheckoutSession({
                    clientSecret: data.clientSecret,
                    bookingId: data.bookingId,
                    amount: data.amount,
                    currency: data.currency || course?.currency || 'GBP'
                });
            } else {
                setCheckoutError(response?.message || 'Checkout did not return payment details. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setCheckoutError(error.message || 'An error occurred during checkout. Please try again.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white lg:bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 size={36} className="animate-spin text-[#003971]" />
                    <p>Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-white lg:bg-gray-50">
                <div className="text-center">
                    <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Course not found</p>
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

    return (
        <div className="w-full min-h-screen flex justify-center py-10 px-4 sm:px-8 bg-white lg:bg-gray-50 overflow-y-auto">
            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white lg:rounded-2xl lg:shadow-md p-2 sm:p-8 h-auto flex flex-col mb-10">
                {/* Back Button and Title */}
                <button
                    onClick={() => navigate('/personal/training')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors min-h-[44px]"
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

                {/* Sessions Selection */}
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Choose Session(s)</h3>
                    <p className="text-sm text-gray-500 mb-4">Select one or multiple sessions. Payment will be calculated based on your selection.</p>

                    {availableSessions.length > 0 ? (
                        <div className="space-y-3">
                            {availableSessions.map((session) => {
                                const isSelected = selectedSessions.includes(session.id);
                                const sessionLocked = paymentLocked || !session.isBookable;

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => {
                                            if (sessionLocked) return;
                                            setSelectedSessions((prev) => (
                                                prev.includes(session.id)
                                                    ? prev.filter((id) => id !== session.id)
                                                    : [...prev, session.id]
                                            ));
                                        }}
                                        className={`flex items-center p-4 border rounded-xl transition-colors ${sessionLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 ${isSelected ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">{session.eventDate || '-'}</p>
                                            <p className="text-xs text-gray-500 mt-1">Available Spaces: {session.availableSpaces}</p>
                                        </div>
                                        <span className={`ml-3 shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${sessionStatusPill(session.status)}`}>
                                            {session.status === 'AVAILABLE' ? 'Open' : session.status === 'FULL' ? 'Full Seats' : 'Expired'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-500">
                            No sessions are available for this course yet.
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-500">Total ({selectedSessionCount || 0} session{selectedSessionCount === 1 ? '' : 's'})</p>
                    <p className="font-semibold text-gray-800">{course.currency} {totalAmount}</p>
                </div>


                {/* Select From Document Wallet Section */}
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Select From Document Wallet <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                    <p className="text-sm text-gray-500 mb-4">Choose any additional documents or certificates you'd like to include with this booking.</p>

                    {documentWalletItems.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-500">
                            No documents in your wallet yet.
                        </div>
                    ) : !selectedFolder ? (
                        <div className="space-y-3">
                            {documentFolders.map((folder) => (
                                <div
                                    key={folder.id}
                                    onClick={() => { if (!paymentLocked) setSelectedFolder(folder); }}
                                    className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${paymentLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${folder.documents.some((doc) => selectedDocuments.includes(doc.id))
                                        ? 'border-[#003971] bg-[#003971]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${folder.documents.some((doc) => selectedDocuments.includes(doc.id))
                                            ? 'bg-[#003971] text-white'
                                            : 'bg-[#003971]/10 text-[#003971]'
                                            }`}>
                                            <Folder size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800">{folder.name}</h4>
                                            <p className="text-xs text-gray-500">{folder.documents.length} document(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {folder.documents.some((doc) => selectedDocuments.includes(doc.id)) && (
                                            <span className="text-xs font-semibold text-[#003971]">
                                                {folder.documents.filter((doc) => selectedDocuments.includes(doc.id)).length} selected
                                            </span>
                                        )}
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedFolder(null)}
                                className="flex items-center gap-2 text-sm text-[#003971] hover:text-[#002855] mb-3"
                            >
                                <ArrowLeft size={16} />
                                Back to Folders
                            </button>

                            <div className="space-y-3">
                                {selectedFolder.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => {
                                            if (paymentLocked) return;
                                            if (selectedDocuments.includes(doc.id)) {
                                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                                            } else {
                                                setSelectedDocuments([...selectedDocuments, doc.id]);
                                            }
                                        }}
                                        className={`flex items-center p-4 border rounded-xl transition-colors ${paymentLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${selectedDocuments.includes(doc.id) ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 ${selectedDocuments.includes(doc.id) ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                            {selectedDocuments.includes(doc.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-800">{doc.title}</h4>
                                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-2 rounded">{doc.type}</span>
                                                <span>Expires: {doc.expiry}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Checkout Error */}
                {checkoutError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{checkoutError}</p>
                    </div>
                )}

                {!checkoutSession && (
                    <button
                        type="button"
                        onClick={handleStartCheckout}
                        disabled={!selectedSessionCount || isCheckoutLoading}
                        className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 flex items-center justify-center gap-2 ${selectedSessionCount && !isCheckoutLoading ? 'bg-[#003971] hover:bg-[#003971]/90' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {isCheckoutLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Starting checkout…
                            </>
                        ) : selectedSessionCount ? (
                            'Pay now'
                        ) : (
                            'Select session(s) to continue'
                        )}
                    </button>
                )}

                {checkoutSession && stripePromise && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-base font-semibold text-gray-800 mb-2">Card payment</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Complete payment with Stripe. After 3D Secure (if required), you will return here to confirm your booking.
                        </p>
                        <Elements
                            key={checkoutSession.clientSecret}
                            stripe={stripePromise}
                            options={{
                                clientSecret: checkoutSession.clientSecret,
                                appearance: { theme: 'stripe' },
                            }}
                        >
                            <CoursePaymentForm
                                clientSecret={checkoutSession.clientSecret}
                                bookingId={checkoutSession.bookingId}
                                payLabel={`Pay ${checkoutSession.currency} ${checkoutSession.amount}`}
                                onAbandon={() => {
                                    setCheckoutSession(null);
                                    setCheckoutError(null);
                                }}
                            />
                        </Elements>
                    </div>
                )}
            </div>

        </div>
    );
};

export default BookCourse;
