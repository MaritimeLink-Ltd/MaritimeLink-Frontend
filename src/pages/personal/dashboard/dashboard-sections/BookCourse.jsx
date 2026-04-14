import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2, Check, Folder, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';
import documentService from '../../../../services/documentService';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const BookCourse = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
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

    // Fetch course details, sessions, and documents
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch all courses and find the matching one
                const [coursesRes, sessionsRes, docsRes] = await Promise.all([
                    httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_ALL).catch(() => null),
                    httpClient.get(API_ENDPOINTS.COURSES.PROFESSIONAL_SESSIONS(courseId)).catch(() => null),
                    documentService.getDocuments().catch(() => null)
                ]);

                // Map the course
                if (coursesRes?.status === 'success' && coursesRes.data?.courses) {
                    const found = coursesRes.data.courses.find(c => c.id === courseId);
                    if (found) {
                        setCourse({
                            id: found.id,
                            title: found.title,
                            provider: found.recruiter?.organizationName || found.admin?.email || 'System Admin',
                            price: `${found.currency || 'GBP'} ${found.price}`,
                            priceValue: Number(found.price) || 0,
                            currency: found.currency || 'GBP',
                            location: found.location || 'Online / TBA',
                            category: found.category,
                            duration: found.duration ? `${found.duration} Days` : 'N/A'
                        });
                    }
                }

                // Map sessions
                if (sessionsRes?.status === 'success' && sessionsRes.data?.sessions) {
                    const mapped = sessionsRes.data.sessions.map(session => {
                        const sDate = session.startDate ? new Date(session.startDate).toLocaleDateString() : '';
                        const eDate = session.endDate ? new Date(session.endDate).toLocaleDateString() : '';
                        const eventDate = sDate && eDate ? `${sDate} - ${eDate}` : (sDate || eDate || 'TBA');
                        const total = Number(session.totalSeats) || 0;
                        const enrolled = Number(session.enrolledCount) || 0;
                        const availableSpaces = Math.max(0, total - enrolled);

                        return {
                            id: session.id,
                            eventDate,
                            availableSpaces
                        };
                    });
                    setAvailableSessions(mapped);
                }

                // Map documents
                if (docsRes?.status === 'success' && docsRes.data?.documents) {
                    const mapped = docsRes.data.documents.map(doc => ({
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
    }, [courseId]);

    const selectedSessionCount = selectedSessions.length;
    const totalAmount = selectedSessionCount * (course?.priceValue || 0);

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


    const handlePayNow = async () => {
        if (!selectedSessionCount) {
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

            if (response.status === 'success' && response.data) {
                console.log('Checkout successful:', response.data);
                // response.data contains bookingId, amount, currency, paymentIntentId, clientSecret, paymentStatus
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate('/personal/training');
                }, 2000);
            } else {
                setCheckoutError(response.message || 'Checkout failed. Please try again.');
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

                                return (
                                    <div
                                        key={session.id}
                                        onClick={() => {
                                            setSelectedSessions((prev) => (
                                                prev.includes(session.id)
                                                    ? prev.filter((id) => id !== session.id)
                                                    : [...prev, session.id]
                                            ));
                                        }}
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 ${isSelected ? 'bg-[#003971] border-[#003971]' : 'border-gray-300 bg-white'}`}>
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">{session.eventDate || '-'}</p>
                                            <p className="text-xs text-gray-500 mt-1">Available Spaces: {session.availableSpaces}</p>
                                        </div>
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
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${folder.documents.some((doc) => selectedDocuments.includes(doc.id))
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
                                            if (selectedDocuments.includes(doc.id)) {
                                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                                            } else {
                                                setSelectedDocuments([...selectedDocuments, doc.id]);
                                            }
                                        }}
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${selectedDocuments.includes(doc.id) ? 'border-[#003971] bg-[#003971]/5' : 'border-gray-200 hover:border-gray-300'}`}
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

                {/* Pay Now Button */}
                <button
                    onClick={handlePayNow}
                    disabled={!selectedSessionCount || isCheckoutLoading}
                    className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 flex items-center justify-center gap-2 ${selectedSessionCount && !isCheckoutLoading ? 'bg-[#003971] hover:bg-[#003971]/90' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {isCheckoutLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : selectedSessionCount ? (
                        'Pay Now'
                    ) : (
                        'Select Session(s) to Continue'
                    )}
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
