import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, Search, RefreshCcw, AlertTriangle, FileText, X, Download } from 'lucide-react';

function ComplianceProfile() {
    const navigate = useNavigate();
    const { id } = useParams();

    // State
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showApprovePopup, setShowApprovePopup] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [showResubmitPopup, setShowResubmitPopup] = useState(false); // New state for Resubmit
    const [rejectReason, setRejectReason] = useState('');
    const [resubmitReason, setResubmitReason] = useState(''); // New state
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Notes State
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    // Determine if it is a company KYC or individual
    const isCompany = id?.startsWith('KYC');

    // Mock data - Individual (Default)
    const defaultUser = {
        name: 'Carlos Vega',
        status: 'UNDER REVIEW',
        role: 'Crew Member',
        company: 'Worldwide Crew Now',
        dateOfBirth: '17 May 1985',
        documentNumber: '****3832',
        expiryDate: '15/04/2028',
        issuingCountry: 'Spain',
        firstName: 'Carlos Andres',
        lastName: 'Vega',
        ocrConfidence: '98%',
        type: 'INDIVIDUAL'
    };

    // Mock data - Company (KYC)
    const companyUser = {
        name: 'Pacific Shipping Co.',
        status: 'DOCUMENTS PENDING',
        role: 'Company',
        company: 'Pacific Shipping',
        dateOfBirth: 'N/A', // Not applicable for company
        documentNumber: 'REG-2024-8892',
        expiryDate: 'N/A',
        issuingCountry: 'USA',
        firstName: 'Pacific Shipping',
        lastName: 'Co. Ltd',
        ocrConfidence: '95%',
        type: 'COMPANY'
    };

    const userData = isCompany ? companyUser : defaultUser;

    // Document Data for Viewer
    const idDocument = {
        name: 'ID_Card_Front.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=800&q=80', // Placeholder
        size: '2.4 MB',
        date: 'Oct 24, 2023',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        Icon: FileText
    };

    // Handlers
    const handleViewDocument = () => {
        setSelectedDocument(idDocument);
        setShowDocViewer(true);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (isSearching) setSearchQuery('');
    };

    // Note Handler
    const handlePostNote = () => {
        if (newNote.trim()) {
            const noteFn = {
                id: Date.now(),
                content: newNote.trim(),
                author: 'Admin', // As requested
                initials: 'AD',
                time: 'Just now' // In a real app, this would be a formatted date
            };
            setNotes([noteFn, ...notes]);
            setNewNote('');
        }
    };

    // Action Handlers
    const handleApprove = () => {
        // Logic to approve would go here
        // In a real app, this would be an API call
        setShowApprovePopup(false);
        // Navigate back to Accounts with KYC tab active
        navigate('/admin/accounts', {
            state: {
                activeTab: 'KYC Status',
                successMessage: 'Verification Approved Successfully!'
            }
        });
    };

    const handleReject = () => {
        // Logic to reject would go here
        if (rejectReason.trim()) {
            alert(`Rejected with reason: ${rejectReason}`);
            setShowRejectPopup(false);
            navigate(-1);
        }
    };

    const handleResubmit = () => {
        // Logic to request resubmission
        if (resubmitReason.trim()) {
            alert(`Resubmission requested: ${resubmitReason}`);
            setShowResubmitPopup(false);
            navigate(-1);
        }
    };


    // Document Viewer Modal
    const DocViewerModal = ({ isOpen, onClose, document }) => {
        if (!isOpen || !document) return null;

        return (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${document.iconBg} rounded-lg`}>
                                <document.Icon className={`h-5 w-5 ${document.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{document.name}</h3>
                                <p className="text-sm text-gray-500">{document.size} • {document.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(document.url);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = window.document.createElement('a');
                                        link.href = url;
                                        link.download = document.name;
                                        window.document.body.appendChild(link);
                                        link.click();
                                        window.document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        window.open(document.url, '_blank');
                                    }
                                }}
                                className="p-2 text-gray-500 hover:text-[#003971] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
                        <img src={document.url} alt={document.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Modals */}
            <DocViewerModal isOpen={showDocViewer} onClose={() => setShowDocViewer(false)} document={selectedDocument} />

            {/* Approve Modal */}
            {showApprovePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Approve Verification</h3>
                        </div>
                        <p className="text-gray-600 mb-6">Are you sure you want to approve this verification? This will verify the user's identity.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowApprovePopup(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Cancel</button>
                            <button onClick={handleApprove} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reject Verification</h3>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-6 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectPopup(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resubmit Modal */}
            {showResubmitPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <RefreshCcw className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Request Resubmission</h3>
                        </div>
                        <textarea
                            value={resubmitReason}
                            onChange={(e) => setResubmitReason(e.target.value)}
                            placeholder="What needs to be corrected?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-6 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowResubmitPopup(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Cancel</button>
                            <button onClick={handleResubmit} disabled={!resubmitReason.trim()} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50">Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Compliance
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">
                                {userData.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {userData.role}: <span className="text-[#1e5a8f] font-semibold">{userData.company}</span>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowResubmitPopup(true)}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Request Resubmission
                        </button>
                        <button
                            onClick={() => setShowRejectPopup(true)}
                            className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => setShowApprovePopup(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Approve Verification
                        </button>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="mt-8">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                        <div className="absolute top-5 left-0 w-2/4 h-0.5 bg-green-500"></div>

                        <div className="relative flex justify-between">
                            {/* Account Approved */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-green-600">Account Approved</span>
                            </div>

                            {/* Document Uploaded */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-green-600">Document Uploaded</span>
                            </div>

                            {/* Document Review */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                </div>
                                <span className="text-xs font-bold text-gray-900">Document Review</span>
                            </div>

                            {/* Cleared */}
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                    <span className="text-xs text-gray-400">4</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">Cleared</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ID Document & Photo */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">ID Document & Photo</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Search Toggle */}
                                <div className={`flex items-center transition-all ${isSearching ? 'w-48' : 'w-auto'}`}>
                                    {isSearching && (
                                        <input
                                            type="text"
                                            placeholder="Search in document..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full text-xs px-2 py-1.5 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none"
                                            autoFocus
                                        />
                                    )}
                                    <button
                                        onClick={toggleSearch}
                                        className={`p-2 hover:bg-gray-50 transition-colors ${isSearching ? 'rounded-r-lg border border-l-0 border-gray-300 bg-gray-50' : 'rounded-lg'}`}
                                    >
                                        {isSearching ? <X className="h-4 w-4 text-gray-600" /> : <Search className="h-4 w-4 text-gray-600" />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleViewDocument}
                                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    title="View Document"
                                >
                                    <Eye className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    className={`p-2 hover:bg-gray-50 rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                                    title="Refresh Data"
                                >
                                    <RefreshCcw className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Document Images */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Spanish ID Card */}
                            <div
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
                                onClick={handleViewDocument}
                            >
                                <div className="aspect-[3/2] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center relative">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-2">ESPAÑA 🇪🇸</div>
                                        <div className="text-lg font-bold text-gray-700 mb-1">VEGA</div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">CARLOS ANDRES</div>
                                        <div className="text-xs text-gray-500">15-04-2028</div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <Eye className="opacity-0 group-hover:opacity-100 text-white w-8 h-8 drop-shadow-md transition-opacity" />
                                    </div>
                                </div>
                            </div>

                            {/* Photo */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="aspect-[3/2] bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                                    <div className="text-6xl">👤</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extracted Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-base font-bold text-gray-900">Extracted Information</h3>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">
                                OCR Confidence: {userData.ocrConfidence}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            {/* First Name */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">{userData.type === 'COMPANY' ? 'Company Name' : 'First Name'}</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.firstName}</div>
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">{userData.type === 'COMPANY' ? 'Suffix' : 'Last Name'}</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.lastName}</div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">{userData.type === 'COMPANY' ? 'Incorporation Date' : 'Date of Birth'}</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.dateOfBirth}</div>
                            </div>

                            {/* Document Number */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">{userData.type === 'COMPANY' ? 'Registration Number' : 'Document Number'}</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.documentNumber}</div>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Expiry Date</label>
                                <div className="text-sm font-semibold text-gray-900">{userData.expiryDate}</div>
                            </div>

                            {/* Issuing Country */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Issuing Country</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{userData.issuingCountry}</span>
                                    <span>🇪🇸</span>
                                </div>
                            </div>
                        </div>

                        {/* Mismatch Warning */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-yellow-900 mb-1">Detected mismatch</div>
                                <div className="text-sm text-yellow-700">
                                    The expiry date on the document (2028) differs from the user input (2035). Please verify.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Flags & Issues */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">FLAGS & ISSUES</h3>

                        <div className="space-y-3">
                            {/* Document Expired */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-start gap-2 mb-1">
                                    <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-red-900 mb-1">Document Expired</div>
                                        <div className="text-xs text-red-700">HIGH</div>
                                    </div>
                                </div>
                                <div className="text-xs text-red-700 mt-2">
                                    ID card expired on 15 Apr 2028
                                </div>
                            </div>

                            {/* Certificate OCR Readable */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-green-900 mb-1">Certificate OCR Readable</div>
                                        <div className="text-xs text-green-700">All data fields extracted successfully</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">ADMIN NOTES</h3>
                        </div>

                        {/* Note Input */}
                        <div className="mb-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add internal note..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                rows="3"
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handlePostNote}
                                    disabled={!newNote.trim()}
                                    className="px-3 py-1.5 bg-[#1e5a8f] text-white text-xs font-semibold rounded-lg hover:bg-[#164773] disabled:opacity-50"
                                >
                                    Post Note
                                </button>
                            </div>
                        </div>

                        {/* Recent Notes List */}
                        <div className="space-y-4">
                            {notes.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">No notes yet</p>
                            ) : (
                                notes.map((note) => (
                                    <div key={note.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-blue-600">{note.initials}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">{note.author}</span>
                                                    <span className="text-xs text-gray-400">{note.time}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{note.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComplianceProfile;
