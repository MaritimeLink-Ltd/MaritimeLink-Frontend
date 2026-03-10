import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, CheckCircle2, Check, Folder, ChevronRight } from 'lucide-react';
import { getAvailableSpaces, getSessionsForCourse } from '../../../../utils/trainingSessionsStore';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const BookCourse = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedSessions, setSelectedSessions] = useState([]);

    // Sample course data
    const courses = {
        '1': {
            id: 1,
            title: 'STCW Basic Safety Training',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 850',
            priceValue: 850,
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '5 Days'
        },
        '2': {
            id: 2,
            title: 'Advanced Firefighting',
            provider: 'Maritime Safety Institute',
            price: 'GBP 1200',
            priceValue: 1200,
            location: 'Southampton, United Kingdom',
            category: 'Safety',
            duration: '3 Days'
        },
        '3': {
            id: 3,
            title: 'Medical First Aid',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 450',
            priceValue: 450,
            location: 'London, United Kingdom',
            category: 'Medical',
            duration: '2 Days'
        },
        '4': {
            id: 4,
            title: 'Bridge Resource Management',
            provider: 'Navigation Training Academy',
            price: 'GBP 1500',
            priceValue: 1500,
            location: 'Liverpool, United Kingdom',
            category: 'Navigation',
            duration: '7 Days'
        },
        '5': {
            id: 5,
            title: 'STCW Refresher Course',
            provider: 'Ocean Maritime Training Centre',
            price: 'GBP 650',
            priceValue: 650,
            location: 'London, United Kingdom',
            category: 'STCW',
            duration: '3 Days'
        }
    };

    const course = courses[courseId] || courses['1'];
    const availableSessions = getSessionsForCourse(course.id, course.title);
    const selectedSessionCount = selectedSessions.length;
    const totalAmount = selectedSessionCount * (course.priceValue || 0);

    // Sample document wallet data
    const documentWalletItems = [
        { id: 'doc1', title: 'Certificate of Competency', expiry: '31 Dec 2026', type: 'License Certificate' },
        { id: 'doc2', title: 'Basic Safety Training', expiry: '31 Dec 2026', type: 'STCW Certificate' },
        { id: 'doc3', title: 'Medical Fitness Certificate', expiry: '31 Dec 2026', type: 'Medical Certificate' },
        { id: 'doc4', title: 'Passport', expiry: '31 Dec 2026', type: 'Travel Document' },
        { id: 'doc5', title: 'Seaman Book', expiry: '31 Dec 2026', type: 'Seaman Document' },
        { id: 'doc6', title: 'Engineering Degree', expiry: '31 Dec 2026', type: 'Academic Certificate' }
    ];

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


    const handlePayNow = () => {
        if (!selectedSessionCount) {
            return;
        }

        const bookingData = {
            courseId,
            selectedSessions,
            totalAmount,
            selectedDocuments
        };
        console.log('Booking with data:', bookingData);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/personal/training');
        }, 2000);
    };

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
                                            <p className="text-xs text-gray-500 mt-1">Available Spaces: {getAvailableSpaces(session)}</p>
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
                    <p className="font-semibold text-gray-800">GBP {totalAmount}</p>
                </div>


                {/* Select From Document Wallet Section */}
                <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Select From Document Wallet <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
                    <p className="text-sm text-gray-500 mb-4">Choose any additional documents or certificates you'd like to include with this booking.</p>

                    {!selectedFolder ? (
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

                {/* Pay Now Button */}
                <button
                    onClick={handlePayNow}
                    disabled={!selectedSessionCount}
                    className={`w-full py-3 rounded-full text-white font-medium transition-colors min-h-[44px] mt-4 ${selectedSessionCount ? 'bg-[#003971] hover:bg-[#003971]/90' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {selectedSessionCount ? 'Pay Now' : 'Select Session(s) to Continue'}
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
