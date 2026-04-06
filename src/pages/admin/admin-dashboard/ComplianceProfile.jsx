import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, Search, RefreshCcw, AlertTriangle, FileText, X, Download } from 'lucide-react';
import httpClient from '../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';

function ComplianceProfile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

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
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [kycData, setKycData] = useState(null);

    // Notes State
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const inferredUserTypeFromState = location.state?.userType;

    const resolveUserType = () => {
        if (inferredUserTypeFromState) {
            return inferredUserTypeFromState;
        }
        // Fallback: try to infer from last accounts list mapping, but default to PROFESSIONAL
        return 'PROFESSIONAL';
    };

    const mapStatusChip = (status) => {
        if (!status) return 'UNDER REVIEW';
        const upper = status.toUpperCase();
        if (upper === 'PENDING') return 'UNDER REVIEW';
        return upper.replace(/_/g, ' ');
    };

    const formatDate = (value) => {
        if (!value) return 'N/A';
        try {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return value;
            return d.toLocaleDateString();
        } catch {
            return value;
        }
    };

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            setLoadError('');
            try {
                const userType = resolveUserType();
                const endpoint = `${API_ENDPOINTS.ADMIN.KYC_SUBMISSION_DETAIL(id)}?userType=${encodeURIComponent(
                    userType
                )}`;
                const response = await httpClient.get(endpoint);
                const kyc = response?.data?.kyc;
                if (!kyc) {
                    throw new Error('KYC record not found');
                }

                setKycData(kyc);
                setNotes((kyc.notes || []).map((n, index) => ({
                    id: n.id || index,
                    content: n.content || n.note || '',
                    author: n.author || 'Admin',
                    initials: (n.author || 'Admin').split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2),
                    time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
                })));
            } catch (error) {
                console.error('Failed to load KYC detail:', error);
                setLoadError(error.message || 'Failed to load KYC detail');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const isApprovedStatus = kycData && kycData.status && kycData.status.toUpperCase() === 'APPROVED';

    const userData = (() => {
        if (!kycData) {
            return {
                name: 'Loading...',
                status: 'UNDER REVIEW',
                role: '',
                company: '',
                dateOfBirth: '',
                documentNumber: '',
                expiryDate: '',
                issuingCountry: '',
                firstName: '',
                lastName: '',
                ocrConfidence: '',
                type: 'INDIVIDUAL',
            };
        }

        const isProfessional = Boolean(kycData.professional);
        const profile = kycData.professional || {};

        const fullName =
            profile.fullname ||
            [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') ||
            [kycData.firstName, kycData.lastName].filter(Boolean).join(' ');

        return {
            name: fullName || 'Unknown user',
            status: mapStatusChip(kycData.status),
            role: isProfessional ? 'Crew Member' : 'Account',
            company: isProfessional ? (profile.subcategory || 'Individual') : (kycData.companyName || 'N/A'),
            dateOfBirth: formatDate(kycData.dateOfBirth),
            documentNumber: kycData.documentNumber || '',
            expiryDate: formatDate(kycData.expiryDate),
            issuingCountry: kycData.issueCountry || '',
            firstName: kycData.firstName || profile.firstName || '',
            lastName: kycData.lastName || profile.lastName || '',
            ocrConfidence: kycData.ocrConfidence ? `${kycData.ocrConfidence}%` : '—',
            type: isProfessional ? 'INDIVIDUAL' : 'COMPANY',
            documentFrontUrl: kycData.documentFrontUrl,
            documentBackUrl: kycData.documentBackUrl,
            selfieUrl: kycData.selfieUrl,
        };
    })();

    // Document Data for Viewer
    const idDocument = {
        name: 'ID Document',
        type: 'image',
        url: userData.documentFrontUrl || '',
        size: '2.4 MB',
        date: 'Oct 24, 2023',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        Icon: FileText
    };

    // Handlers
    const handleViewDocument = (documentKey = 'front') => {
        let base = idDocument;
        if (documentKey === 'back' && userData.documentBackUrl) {
            base = {
                ...idDocument,
                name: 'ID Document - Back',
                url: userData.documentBackUrl,
            };
        } else if (documentKey === 'selfie' && userData.selfieUrl) {
            base = {
                ...idDocument,
                name: 'Selfie',
                url: userData.selfieUrl,
            };
        }

        if (!base.url) return;
        setSelectedDocument(base);
        setShowDocViewer(true);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (isSearching) setSearchQuery('');
    };

    // Note Handler
    const handlePostNote = async () => {
        const content = newNote.trim();
        if (!content) return;

        const userType = resolveUserType();
        try {
            const payload = {
                content,
                userType,
            };

            const endpoint = API_ENDPOINTS.ADMIN.KYC_ADD_NOTE(id);
            const response = await httpClient.post(endpoint, payload);
            const apiNote = response?.data?.note || response?.note || null;

            const createdAt = apiNote?.createdAt ? new Date(apiNote.createdAt).toLocaleString() : 'Just now';
            const authorEmail = apiNote?.admin?.email || 'Admin';
            const initials = authorEmail
                .split('@')[0]
                .split(/[.\s_-]/)
                .filter(Boolean)
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            const noteToAdd = {
                id: apiNote?.id || Date.now(),
                content: apiNote?.content || content,
                author: authorEmail,
                initials,
                time: createdAt,
            };

            setNotes((prev) => [noteToAdd, ...prev]);
            setNewNote('');
        } catch (error) {
            console.error('Failed to post note:', error);
            alert(error.message || 'Failed to post note');
        }
    };

    // Action Handlers
    const handleApprove = async () => {
        const userType = resolveUserType();
        try {
            const payload = {
                userType,
                status: 'APPROVED',
                reviewStep: 0,
                riskLevel: kycData?.riskLevel || 'LOW',
                mismatchDetails: kycData?.mismatchDetails || '',
            };

            const endpoint = API_ENDPOINTS.ADMIN.KYC_UPDATE_STATUS(id);
            const response = await httpClient.patch(endpoint, payload);

            const updated = response?.data?.updated || response;
            if (updated) {
                setKycData((prev) => ({ ...(prev || {}), ...updated }));
            }

            setShowApprovePopup(false);

            navigate('/admin/accounts', {
                state: {
                    activeTab: 'KYC Status',
                    successMessage: 'Verification Approved Successfully!',
                },
            });
        } catch (error) {
            console.error('Failed to approve KYC:', error);
            alert(error.message || 'Failed to approve KYC');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;

        const userType = resolveUserType();
        try {
            const payload = {
                userType,
                status: 'REJECTED',
                reviewStep: 0,
                riskLevel: 'HIGH',
                mismatchDetails: rejectReason.trim(),
            };

            const endpoint = API_ENDPOINTS.ADMIN.KYC_UPDATE_STATUS(id);
            const response = await httpClient.patch(endpoint, payload);

            const updated = response?.data?.updated || response;
            if (updated) {
                setKycData((prev) => ({ ...(prev || {}), ...updated }));
            }

            setShowRejectPopup(false);
            navigate('/admin/accounts', {
                state: {
                    activeTab: 'KYC Status',
                    successMessage: 'Verification Rejected Successfully!',
                },
            });
        } catch (error) {
            console.error('Failed to reject KYC:', error);
            alert(error.message || 'Failed to reject KYC');
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isLoading ? 'Loading...' : userData.name}
                            </h1>
                            {!isLoading && (
                                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">
                                    {userData.status}
                                </span>
                            )}
                        </div>
                        {!isLoading && (
                            <p className="text-sm text-gray-600">
                                {userData.role}:{' '}
                                <span className="text-[#1e5a8f] font-semibold">{userData.company}</span>
                            </p>
                        )}
                    </div>

                    {/* Action Buttons (hidden when already approved) */}
                    {!isApprovedStatus && (
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
                    )}
                </div>

                {/* Progress Stepper */}
                <div className="mt-8">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                        <div
                            className={`absolute top-5 left-0 h-0.5 bg-green-500 ${
                                isApprovedStatus ? 'right-0' : 'w-2/4'
                            }`}
                        ></div>

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
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                        isApprovedStatus ? 'bg-green-500' : 'bg-white border-2 border-blue-500'
                                    }`}
                                >
                                    {isApprovedStatus ? (
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    ) : (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-bold ${
                                        isApprovedStatus ? 'text-green-600' : 'text-gray-900'
                                    }`}
                                >
                                    Document Review
                                </span>
                            </div>

                            {/* Cleared */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                        isApprovedStatus ? 'bg-green-500' : 'bg-gray-100'
                                    }`}
                                >
                                    {isApprovedStatus ? (
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    ) : (
                                        <span className="text-xs text-gray-400">4</span>
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-bold ${
                                        isApprovedStatus ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                >
                                    Cleared
                                </span>
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
                            {/* ID Front */}
                            <button
                                type="button"
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden text-left"
                                onClick={() => handleViewDocument('front')}
                                disabled={!userData.documentFrontUrl}
                            >
                                <div className="aspect-[3/2] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {userData.documentFrontUrl ? (
                                        <img
                                            src={userData.documentFrontUrl}
                                            alt="ID front"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-500">No front document uploaded</span>
                                    )}
                                    {userData.documentFrontUrl && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Eye className="opacity-0 group-hover:opacity-100 text-white w-8 h-8 drop-shadow-md transition-opacity" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-600">ID Document - Front</div>
                            </button>

                            {/* Selfie */}
                            <button
                                type="button"
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden text-left"
                                onClick={() => handleViewDocument('selfie')}
                                disabled={!userData.selfieUrl}
                            >
                                <div className="aspect-[3/2] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {userData.selfieUrl ? (
                                        <img
                                            src={userData.selfieUrl}
                                            alt="Selfie"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-500">No selfie uploaded</span>
                                    )}
                                    {userData.selfieUrl && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <Eye className="opacity-0 group-hover:opacity-100 text-white w-8 h-8 drop-shadow-md transition-opacity" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-600">Selfie</div>
                            </button>
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
                                    <span className="text-sm font-semibold text-gray-900">{userData.issuingCountry || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mismatch alert removed – will be driven by backend flags if needed */}
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Flags & Issues */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">FLAGS & ISSUES</h3>

                        <div className="space-y-3">
                            {/* Flags Logic */}
                            {(() => {
                                const isExpired = kycData && kycData.expiryDate && new Date(kycData.expiryDate) < new Date();
                                
                                if (isExpired) {
                                    return (
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
                                                ID card expired on {userData.expiryDate}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-green-900 mb-1">Certificate OCR Readable</div>
                                                    <div className="text-xs text-green-700">All data fields extracted successfully</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })()}
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
