import { useState } from 'react';
import {
    FileText,
    Wallet,
    MessageSquare,
    Ship,
    Clock,
    Briefcase,
    Headphones,
    Check,
    ChevronLeft,
    Star,
    X,
    Folder,
    File,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Eye,
    Download,
    Send
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function CandidateSummary({ candidateId: propCandidateId, onBack, showApplicationStatus = false, onViewResume, onMessage }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { candidateId: urlCandidateId } = useParams();
    const candidateId = propCandidateId || urlCandidateId;
    const isAdmin = location.pathname.includes('/admin/');

    // Map applicant status to application stage
    const getInitialStage = () => {
        const status = location.state?.applicantStatus;

        // If no status provided, don't show any stage as current
        if (!status) return null;

        // Map status to current stage
        const stageMap = {
            'new': null, // No stage completed yet
            'matches': null, // No stage completed yet
            'shortlisted': 'shortlisted',
            'interviewing': 'interviewing',
            'offered': 'offer-sent',
            'hired': 'hired'
        };

        return stageMap[status] !== undefined ? stageMap[status] : null;
    };

    const [applicationStage, setApplicationStage] = useState(getInitialStage());
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDocumentWallet, setShowDocumentWallet] = useState(false);
    const [showRequestSuccess, setShowRequestSuccess] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [inviteSent, setInviteSent] = useState(false);

    // Show application status if coming from job detail or explicitly passed as prop
    // But NOT for matches (candidates who haven't applied yet)
    const applicantStatus = location.state?.applicantStatus;
    const shouldShowApplicationStatus = (showApplicationStatus || location.state?.fromJobDetail) && applicantStatus !== 'matches';

    // Get next stage and button text
    const getNextStageInfo = () => {
        if (!applicationStage) {
            return { nextStage: 'shortlisted', buttonText: 'Move to Shortlisted' };
        }

        const stageProgression = {
            'shortlisted': { nextStage: 'interviewing', buttonText: 'Move to Interviewing' },
            'interviewing': { nextStage: 'offer-sent', buttonText: 'Move to Offer Sent' },
            'offer-sent': { nextStage: 'hired', buttonText: 'Move to Hired' },
            'hired': { nextStage: null, buttonText: 'Hired' }
        };

        return stageProgression[applicationStage] || { nextStage: 'hired', buttonText: 'Move to Hired' };
    };

    const nextStageInfo = getNextStageInfo();

    const moveToNextStage = () => {
        if (nextStageInfo.nextStage) {
            setApplicationStage(nextStageInfo.nextStage);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const candidate = {
        name: "Ali Shahzaib",
        rank: "Deck Officer",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
        vesselTypes: ["LNG Tanker", "Offshore Support Vessel"],
        seaTime: "8 years 9 months sea time",
        compliant: true,
        experience: [
            "8 years 9 months total sea service",
            "8 years 9 months on LNG Tankers",
            "5 years 9 months on Offshore Support tankers",
            "Rank Progression: Second Engineer to Chief Engineer"
        ],
        skills: [
            { name: "Man B&W Engines", rating: 5 },
            { name: "Seamanship", rating: 5 },
            { name: "Navigation", rating: 4 },
            { name: "Safety Management", rating: 5 }
        ]
    };

    // Document Wallet Structure - Restricted View for Browsing Recruiters
    const documentWallet = {
        folders: [
            {
                id: 1,
                name: "Certificates of Competency (CoC)",
                documents: [
                    { id: 1, name: "Officer of Watch (OOW) Certificate", expiryDate: "2025-08-15", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 2, name: "Chief Mate Certificate", expiryDate: "2025-11-20", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 3, name: "Master Mariner Certificate", expiryDate: "2024-02-10", status: "expired", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            },
            {
                id: 2,
                name: "Training Certificates",
                documents: [
                    { id: 4, name: "Basic Safety Training (BST)", expiryDate: "2025-06-30", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 5, name: "Advanced Fire Fighting", expiryDate: "2025-09-18", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 6, name: "Medical First Aid", expiryDate: "2024-12-01", status: "expiring-soon", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 7, name: "Ship Security Officer (SSO)", expiryDate: "2026-03-25", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            },
            {
                id: 3,
                name: "Medical Certificates",
                documents: [
                    { id: 8, name: "Seafarer Medical Examination Certificate (SMEC)", expiryDate: "2025-07-10", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 9, name: "Eyesight Test Report", expiryDate: "2025-07-10", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            },
            {
                id: 4,
                name: "Passport & Visa",
                documents: [
                    { id: 10, name: "Passport", expiryDate: "2028-04-15", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 11, name: "Schengen Visa", expiryDate: "2024-03-20", status: "expired", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 12, name: "US C1/D Visa", expiryDate: "2026-12-30", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            },
            {
                id: 5,
                name: "Seamans Book & Discharge Book",
                documents: [
                    { id: 13, name: "Seaman's Book", expiryDate: "2027-05-22", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 14, name: "Discharge Book", expiryDate: "N/A", status: "valid", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    };

    // Handle Request Documents
    const handleRequestDocuments = () => {
        setShowDocumentWallet(false);
        setShowRequestSuccess(true);
        setTimeout(() => {
            setShowRequestSuccess(false);
        }, 3000);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case 'valid':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    label: 'Valid'
                };
            case 'expiring-soon':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    icon: <AlertCircle className="h-4 w-4" />,
                    label: 'Expiring Soon'
                };
            case 'expired':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    icon: <X className="h-4 w-4" />,
                    label: 'Expired'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    icon: <File className="h-4 w-4" />,
                    label: 'N/A'
                };
        }
    };

    const stages = [
        { id: 'shortlisted', label: 'Shortlisted' },
        { id: 'interviewing', label: 'Interviewing' },
        { id: 'offer-sent', label: 'Offer Sent' },
        { id: 'hired', label: 'Hired' }
    ];

    // Calculate current stage index - if no stage, index is -1 (before first stage)
    const currentStageIndex = applicationStage ? stages.findIndex(s => s.id === applicationStage) : -1;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-6">
            {/* Back Icon - Fixed */}
            <div className="flex-shrink-0 mb-4">
                <button
                    onClick={handleBack}
                    className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-6">

                {/* Header Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-6">
                            {/* Profile Image */}
                            <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-40 h-40 rounded-2xl object-cover border-2 border-gray-100"
                            />

                            {/* Info */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{candidate.name}</h1>
                                <p className="text-lg text-gray-600 font-medium mb-3">{candidate.rank}</p>

                                <div className="space-y-2">
                                    {candidate.vesselTypes.map((vessel, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                                            <Ship className="h-4 w-4 text-[#003971]" />
                                            <span className="font-medium">{vessel}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="h-4 w-4 text-[#003971]" />
                                        <span className="font-medium">{candidate.seaTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Badge */}
                        {candidate.compliant && (
                            <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                Fully Compliant
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Hide View Resume button for Admin Routes */}
                        {!isAdmin && (
                            <button
                                onClick={() => onViewResume ? onViewResume(candidateId) : navigate(location.pathname.includes('/trainingprovider/') ? '/trainingprovider/cv-resume' : '/admin/cv-resume')}
                                className="bg-[#003971] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#002855] transition-colors"
                            >
                                <FileText className="h-5 w-5" />
                                View Resume
                            </button>
                        )}
                        {/* Show View Document Wallet for non-matches OR admin+matches */}
                        {(applicantStatus !== 'matches' || isAdmin) && (
                            <button
                                onClick={() => setShowDocumentWallet(true)}
                                className="bg-[#003971] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#002855] transition-colors"
                            >
                                <Wallet className="h-5 w-5" />
                                View Document Wallet
                            </button>
                        )}
                        {/* Show Invite to Apply for matches tab */}
                        {applicantStatus === 'matches' && (
                            inviteSent ? (
                                <span className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                    <Check className="h-5 w-5" />
                                    Invited
                                </span>
                            ) : (
                                <button
                                    onClick={() => setInviteSent(true)}
                                    className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                    Invite to Apply
                                </button>
                            )
                        )}
                        {/* Hide Message button for Training Provider dashboard and Admin routes */}
                        {!location.pathname.includes('/trainingprovider/') && !isAdmin && (
                            <button
                                onClick={() => onMessage ? onMessage(candidateId, candidate.name) : navigate('/admin/chats')}
                                className="border-2 border-[#003971] text-[#003971] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#003971] hover:text-white transition-colors"
                            >
                                <MessageSquare className="h-5 w-5" />
                                Message {candidate.name}
                            </button>
                        )}
                    </div>
                </div>

                {/* Experience Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Briefcase className="h-5 w-5 text-[#003971]" />
                        <h2 className="text-lg font-bold text-[#003971]">Experience Summary</h2>
                    </div>

                    <div className="space-y-3">
                        {candidate.experience.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl">
                                <div className="h-2 w-2 rounded-full bg-[#003971] mt-2 flex-shrink-0"></div>
                                <p className="text-gray-700 font-medium">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Skills & Competencies */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <Headphones className="h-5 w-5 text-[#003971]" />
                        <h2 className="text-lg font-bold text-[#003971]">Key Skills & Competencies</h2>
                    </div>

                    <div className="space-y-4">
                        {candidate.skills.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-gray-900 font-medium">{skill.name}</span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < skill.rating
                                                ? 'fill-[#003971] text-[#003971]'
                                                : 'fill-gray-200 text-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Status - Hide for Admin routes */}
                {shouldShowApplicationStatus && !isAdmin && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#003971]">Application Status</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="text-red-600 font-bold hover:text-red-700 transition-colors"
                                >
                                    Reject Candidate
                                </button>
                                <button
                                    onClick={moveToNextStage}
                                    className="bg-[#003971] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#002855] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    disabled={applicationStage === 'hired'}
                                >
                                    {nextStageInfo.buttonText}
                                </button>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex;
                                    const isCurrent = idx === currentStageIndex;
                                    const isUpcoming = idx > currentStageIndex;

                                    return (
                                        <div key={stage.id} className="flex flex-col items-center flex-1">
                                            {/* Circle */}
                                            <div className="relative z-10 mb-3">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all ${isCompleted
                                                    ? 'bg-[#003971] border-[#003971]'
                                                    : isCurrent
                                                        ? 'bg-[#003971] border-[#003971]'
                                                        : 'bg-gray-100 border-gray-300'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <Check className="h-6 w-6 text-white" />
                                                    ) : isCurrent ? (
                                                        <div className="w-3 h-3 rounded-full bg-white"></div>
                                                    ) : (
                                                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Label */}
                                            <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {stage.label}
                                            </p>

                                            {/* Connecting Line */}
                                            {idx < stages.length - 1 && (
                                                <div className={`absolute left-0 right-0 h-1 top-7 -z-0 ${idx < currentStageIndex ? 'bg-[#003971]' : 'bg-gray-200'
                                                    }`}
                                                    style={{
                                                        left: `calc(${(idx / (stages.length - 1)) * 100}% + ${(100 / (stages.length - 1) / 2)}%)`,
                                                        right: `calc(${100 - ((idx + 1) / (stages.length - 1)) * 100}% + ${(100 / (stages.length - 1) / 2)}%)`
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Candidate Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Reject Candidate?</h3>

                            {/* Message */}
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to reject this candidate? This action cannot be undone.
                            </p>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        navigate(-1);
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                    Reject Candidate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Wallet Modal - Restricted View */}
                {showDocumentWallet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-0 max-w-4xl w-full max-h-[85vh] flex flex-col relative">
                            {/* Header - Fixed */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#003971] mb-1">Document Wallet</h3>
                                    <p className="text-sm text-gray-600">
                                        Preview of document structure - Request access to view full documents
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDocumentWallet(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-4">
                                    {documentWallet.folders.map((folder) => (
                                        <div key={folder.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            {/* Folder Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-[#003971] p-2.5 rounded-lg">
                                                    <Folder className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{folder.name}</h4>
                                                    <p className="text-sm text-gray-600">{folder.documents.length} documents</p>
                                                </div>
                                            </div>

                                            {/* Documents List */}
                                            <div className="space-y-2">
                                                {folder.documents.map((doc) => {
                                                    const statusBadge = getStatusBadge(doc.status);
                                                    return (
                                                        <div
                                                            key={doc.id}
                                                            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                {/* Document Info */}
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <File className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-900 mb-1">{doc.name}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>Expires: {doc.expiryDate}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Status Badge & Actions */}
                                                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                                    <div className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5`}>
                                                                        {statusBadge.icon}
                                                                        {statusBadge.label}
                                                                    </div>

                                                                    {isAdmin && (
                                                                        <button
                                                                            onClick={() => setSelectedDocument(doc)}
                                                                            className="p-2 text-[#003971] hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title="View Document"
                                                                        >
                                                                            <Eye className="h-5 w-5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Info Banner - Hide for Admin */}
                                {!isAdmin && (
                                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 mb-1">Restricted Access</p>
                                            <p className="text-sm text-blue-700">
                                                You are viewing document metadata only. To access full documents, please send a request to the candidate.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer - Fixed */}
                            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                                {!isAdmin && (
                                    <button
                                        onClick={() => setShowDocumentWallet(false)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Close
                                    </button>
                                )}
                                {isAdmin ? (
                                    <button
                                        onClick={() => setShowDocumentWallet(false)}
                                        className="bg-[#003971] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#002855] transition-colors"
                                    >
                                        Done
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRequestDocuments}
                                        className="bg-[#003971] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#002855] transition-colors flex items-center gap-2"
                                    >
                                        <Wallet className="h-5 w-5" />
                                        Request Documents
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Success Toast */}
                {showRequestSuccess && (
                    <div className="fixed top-6 right-6 z-[60] animate-fade-in">
                        <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5" />
                            <div>
                                <p className="font-bold">Request Sent Successfully!</p>
                                <p className="text-sm text-green-100">The candidate will be notified of your document request.</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Document Preview Modal */}
                {selectedDocument && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl animate-fade-in relative">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedDocument(null)}
                                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedDocument.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            Expiry: {selectedDocument.expiryDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(selectedDocument.url);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = window.document.createElement('a');
                                                link.href = url;
                                                link.download = selectedDocument.name;
                                                window.document.body.appendChild(link);
                                                link.click();
                                                window.document.body.removeChild(link);
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error('Download failed:', error);
                                                window.open(selectedDocument.url, '_blank');
                                            }
                                        }}
                                        className="p-2 text-gray-500 hover:text-[#003971] hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedDocument(null)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 bg-gray-100 p-6 overflow-auto flex items-center justify-center">
                                <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-2xl w-full aspect-[3/4] flex flex-col relative">
                                    {/* Placeholder for PDF/Image Content */}
                                    <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=1000&auto=format&fit=crop"
                                            alt="Document Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Mock Document Footer */}
                                    <div className="p-4 bg-white flex items-center justify-between border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-600">JD</span>
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-bold text-gray-900">John Doe</p>
                                                <p className="text-gray-500">Uploaded on May 12, 2024</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-[#003971] bg-blue-50 px-2 py-1 rounded">
                                            VERIFIED
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CandidateSummary;
