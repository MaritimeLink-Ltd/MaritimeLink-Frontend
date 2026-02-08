import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, CheckCircle, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

function AccountProfile() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL

    const [activeTab, setActiveTab] = useState('Overview');
    const [timeFilter, setTimeFilter] = useState('Today');
    const [newNote, setNewNote] = useState('');
    const [showNoteNotification, setShowNoteNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const noteTextareaRef = useRef(null);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editNoteContent, setEditNoteContent] = useState('');
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [showApprovePopup, setShowApprovePopup] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showActionNotification, setShowActionNotification] = useState(false);
    const [actionNotificationMessage, setActionNotificationMessage] = useState('');
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [notes, setNotes] = useState([
        {
            id: 1,
            author: 'John (Admin)',
            initials: 'JA',
            time: '2 hours ago',
            content: 'Domain matched with corporate registry. Phone verification passed via OTP. Pending manual review of certification documents.'
        }
    ]);

    // Determine data based on ID prefix
    const isKYC = id?.startsWith('KYC');
    const isTrainingProvider = id?.startsWith('TP');
    const isProfessional = id?.startsWith('PRO');
    const isRecruiter = id?.startsWith('REC');

    // Mock Data - Recruiter
    const recruiterProfile = {
        name: 'David Turner',
        role: 'RECRUITER',
        roleDetail: 'Recruiter at',
        company: 'Oceanhire Agency',
        email: 'david.t@oceanhire.com',
        phone: '+44 7700 900077',
        applied: 'Oct 24, 2023',
        ip: '192.168.1.1 (London, UK)',
        companyName: 'Oceanhire Agency Ltd',
        companyWeb: 'oceanhire.com',
        address: '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom',
        plan: 'Pro Plan',
        stats: { activeJobs: 12, candidatesHired: 8 },
        statsLabels: { stat1: 'Active Jobs', stat2: 'Candidates Hired' },
        stage1Status: 'COMPLETED',
        stage2Status: 'PENDING'
    };

    // Mock Data - Training Provider
    const trainingProviderProfile = {
        name: 'Maritime Academy Pro',
        role: 'TRAINING PROVIDER',
        roleDetail: 'Training Provider at',
        company: 'Maritime Academy',
        email: 'admin@maritimeacademy.com',
        phone: '+44 7700 900123',
        applied: 'Nov 15, 2023',
        ip: '192.168.1.50 (London, UK)',
        companyName: 'Maritime Academy Ltd',
        companyWeb: 'maritimeacademy.com',
        address: '45 Maritime Way, Southampton, SO15 1BZ, United Kingdom',
        plan: 'Pro Plan',
        stats: { activeJobs: 24, candidatesHired: 156 },
        statsLabels: { stat1: 'Active Courses', stat2: 'Students Trained' },
        stage1Status: 'COMPLETED',
        stage2Status: 'PENDING'
    };

    // Mock Data - Professional
    const professionalProfile = {
        name: 'Captain James Wilson',
        role: 'PROFESSIONAL',
        roleDetail: 'Maritime Professional',
        company: 'Self-Employed',
        email: 'james.wilson@email.com',
        phone: '+44 7700 900456',
        applied: 'Dec 05, 2023',
        ip: '192.168.1.100 (Liverpool, UK)',
        companyName: 'N/A',
        companyWeb: 'N/A',
        address: '123 Dock Road, Liverpool, L3 4BP, United Kingdom',
        plan: 'Pro Plan',
        stats: { activeJobs: 15, candidatesHired: 8 },
        statsLabels: { stat1: 'Years Experience', stat2: 'Certifications' },
        stage1Status: 'COMPLETED',
        stage2Status: 'PENDING'
    };

    // Mock Data - KYC (Company)
    const kycProfile = {
        name: 'Pacific Shipping Co.',
        role: 'COMPANY',
        roleDetail: 'Maritime Company',
        company: 'Pacific Shipping',
        email: 'admin@pacificship.com',
        phone: '+1 202 555 0123',
        applied: 'Feb 08, 2024',
        ip: '10.0.0.1 (New York, USA)',
        companyName: 'Pacific Shipping Co. Ltd',
        companyWeb: 'pacificship.com',
        address: '123 Harbor View, New York, NY 10001, USA',
        plan: 'Enterprise Plan',
        stats: { activeJobs: 45, candidatesHired: 120 },
        statsLabels: { stat1: 'Active Jobs', stat2: 'Candidates Hired' },
        stage1Status: 'COMPLETED',
        stage2Status: 'PENDING'
    };

    // Select profile based on ID prefix
    const getProfileData = () => {
        if (isKYC) return kycProfile;
        if (isTrainingProvider) return trainingProviderProfile;
        if (isProfessional) return professionalProfile;
        return recruiterProfile; // Default to recruiter
    };

    const profileData = getProfileData();

    // Mock Documents Data
    const documents = [
        {
            id: 1,
            name: 'Company_Registration_Cert.pdf',
            type: 'pdf',
            size: '2.4 MB',
            date: 'Oct 24, 2023',
            uploadTime: '2 days ago',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy PDF for testing
            category: 'CERTIFICATE',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            Icon: FileText
        },
        {
            id: 2,
            name: 'VAT_Certificate_2023.pdf',
            type: 'pdf',
            size: '1.1 MB',
            date: 'Oct 24, 2023',
            uploadTime: '2 days ago',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            category: 'TAX DOCUMENT',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            Icon: FileText
        },
        {
            id: 3,
            name: 'Proof_of_Address.jpg',
            type: 'image',
            size: '3.5 MB',
            date: 'Oct 24, 2023',
            uploadTime: '2 days ago',
            url: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=800&q=80',
            category: 'ADDRESS',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            Icon: ImageIcon
        }
    ];

    const tabs = ['Overview', 'Submitted Details', `Documents (${documents.length})`, 'KYC', 'Activity Log', 'Admin Notes'];
    const timeFilters = ['Today', '7 Days', '30 Days'];

    // Handle posting a new note
    const handlePostNote = () => {
        if (newNote.trim()) {
            const newNoteObj = {
                id: notes.length + 1,
                author: 'You (Admin)',
                initials: 'YOU',
                time: 'Just now',
                content: newNote.trim()
            };
            setNotes([newNoteObj, ...notes]);
            setNewNote('');
            setNotificationMessage('Note posted successfully!');
            setShowNoteNotification(true);
            setTimeout(() => setShowNoteNotification(false), 3000);
        }
    };

    // Handle Add New Note button click
    const handleAddNewNote = () => {
        if (noteTextareaRef.current) {
            noteTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            noteTextareaRef.current.focus();
        }
    };

    // Handle edit note
    const handleEditNote = (note) => {
        setEditingNoteId(note.id);
        setEditNoteContent(note.content);
    };

    // Handle save edited note
    const handleSaveEdit = (noteId) => {
        if (editNoteContent.trim()) {
            setNotes(notes.map(note =>
                note.id === noteId
                    ? { ...note, content: editNoteContent.trim() }
                    : note
            ));
            setEditingNoteId(null);
            setEditNoteContent('');
            setNotificationMessage('Note updated successfully!');
            setShowNoteNotification(true);
            setTimeout(() => setShowNoteNotification(false), 3000);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditNoteContent('');
    };

    // Handle Cancel Review
    const handleCancelReview = () => {
        navigate(-1);
    };

    // Handle Reject Account
    const handleRejectAccount = () => {
        setShowRejectPopup(true);
    };

    const confirmRejectAccount = () => {
        if (rejectReason.trim()) {
            setActionNotificationMessage('Account rejected successfully!');
            setShowActionNotification(true);
            setTimeout(() => {
                setShowActionNotification(false);
                navigate(-1);
            }, 2000);
            setShowRejectPopup(false);
            setRejectReason('');
        }
    };

    const cancelRejectAccount = () => {
        setShowRejectPopup(false);
        setRejectReason('');
    };

    // Handle Approve Account
    const handleApproveAccount = () => {
        setShowApprovePopup(true);
    };

    const confirmApproveAccount = () => {
        setActionNotificationMessage('Account approved successfully!');
        setShowActionNotification(true);
        setTimeout(() => {
            setShowActionNotification(false);
            navigate(-1);
        }, 2000);
        setShowApprovePopup(false);
    };

    const cancelApproveAccount = () => {
        setShowApprovePopup(false);
    };

    // Handle document view
    const handleViewDocument = (doc) => {
        setSelectedDocument(doc);
        setShowDocViewer(true);
    };

    const closeDocViewer = () => {
        setShowDocViewer(false);
        setSelectedDocument(null);
    };

    // Document Viewer Modal Component
    const DocViewerModal = ({ isOpen, onClose, document }) => {
        if (!isOpen || !document) return null;

        return (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                    {/* Header */}
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
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(document.url);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link =
                                            window.document.createElement('a');
                                        link.href = url;
                                        link.download = document.name;
                                        window.document.body.appendChild(link);
                                        link.click();
                                        window.document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        // Fallback to opening in new tab
                                        window.open(document.url, '_blank');
                                    }
                                }}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
                        {document.type === 'pdf' ? (
                            <iframe
                                src={document.url}
                                className="w-full h-full rounded-lg shadow-sm bg-white"
                                title="Document Viewer"
                            />
                        ) : (
                            <img
                                src={document.url}
                                alt={document.name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Accounts
            </button>

            {/* Note Posted Notification */}
            {showNoteNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{notificationMessage}</span>
                </div>
            )}

            {/* Action Notification */}
            {showActionNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{actionNotificationMessage}</span>
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocViewerModal
                isOpen={showDocViewer}
                onClose={closeDocViewer}
                document={selectedDocument}
            />

            {/* Reject Account Popup */}
            {showRejectPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reject Account</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this account..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                rows="4"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelRejectAccount}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRejectAccount}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Account Popup */}
            {showApprovePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Approve Account</h3>
                                <p className="text-sm text-gray-500">Confirm account approval</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to approve this account? The user will be notified and granted full access to the platform.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelApproveAccount}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApproveAccount}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Approve Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {/* Profile Picture */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                                {true ? (
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt={profileData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.classList.remove('bg-white');
                                            e.target.parentNode.classList.add('bg-gray-100');
                                            e.target.parentNode.innerHTML = '<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                                        }}
                                    />
                                ) : (
                                    <User className="h-10 w-10" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">
                                    {profileData.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                                {profileData.roleDetail} <span className="text-[#1e5a8f] font-semibold">{profileData.company}</span>
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Applied: {profileData.applied}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    IP: {profileData.ip}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mt-6 -mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab
                                ? 'text-[#1e5a8f]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e5a8f]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Stat 1 */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">{profileData.statsLabels?.stat1 || 'Active Jobs'}</div>
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{profileData.stats.activeJobs}</div>
                                    <div className="text-xs font-semibold text-green-600">+2 this week</div>
                                </div>

                                {/* Stat 2 */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-sm font-semibold text-gray-600">{profileData.statsLabels?.stat2 || 'Candidates Hired'}</div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Users className="h-5 w-5 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{profileData.stats.candidatesHired}</div>
                                </div>
                            </div>

                            {/* Account Status Overview */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-4">Account Status Overview</h3>

                                <div className="grid grid-cols-2 gap-4">

                                    {/* Stage 1 */}
                                    <div className="bg-blue-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#1e5a8f] rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">01</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 1: Approval</div>
                                                    <div className="text-xs text-gray-600">Basic Account Setup</div>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                {profileData.stage1Status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Email Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Phone Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Company Details Submitted</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stage 2 */}
                                    <div className="bg-orange-50 rounded-xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border-2 border-orange-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-700 font-bold text-sm">02</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">Stage 2: KYC</div>
                                                    <div className="text-xs text-gray-600">Identity Verification</div>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                {profileData.stage2Status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                <span className="text-gray-500">ID Document Upload</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                <span className="text-gray-500">Address Verification</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Documents */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="mb-4">
                                    <h3 className="text-base font-bold text-gray-900">Recent Documents</h3>
                                </div>

                                <div className="space-y-3">
                                    {documents.slice(0, 2).map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 ${doc.iconBg} rounded-lg`}>
                                                    <doc.Icon className={`h-5 w-5 ${doc.iconColor}`} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">Uploaded {doc.uploadTime} • {doc.size}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Submitted Details' && (
                        <>
                            {/* Stage Header with Approve Button */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <span className="text-[#1e5a8f] font-bold text-sm">01</span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Stage 1: Account Approval</h3>
                                    </div>
                                    <button
                                        onClick={handleApproveAccount}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    {/* Line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                                    <div className="absolute top-5 left-0 w-1/3 h-0.5 bg-blue-500"></div>

                                    <div className="relative flex justify-between">
                                        {/* STAGE 1 - Completed */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">STAGE 1</span>
                                        </div>

                                        {/* REVIEW - Current */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center mb-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">REVIEW</span>
                                        </div>

                                        {/* KYC - Pending */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-xs text-gray-400">3</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">KYC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Details</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Full Name</label>
                                        <div className="text-sm font-semibold text-gray-900">{profileData.name}</div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{profileData.email}</span>
                                            <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Phone Number</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{profileData.phone}</span>
                                            <span className="text-xs font-semibold text-green-600">(Verified)</span>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Role</label>
                                        <div className="text-sm font-semibold text-gray-900">{profileData.role === 'COMPANY' ? 'Company Admin' : 'Senior Recruiter'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Information</h3>
                                </div>

                                <div className="space-y-5">
                                    {/* Company Name */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Company Name</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{profileData.companyName}</span>
                                                <span className="text-xs font-semibold text-blue-600">(Claimed)</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Website & Social</label>
                                            <a
                                                href={`https://${profileData.companyWeb}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:underline cursor-pointer"
                                            >
                                                <span className="text-sm font-semibold text-blue-600">{profileData.companyWeb}</span>
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Address</label>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {profileData.address}
                                        </div>
                                    </div>

                                    {/* Plan Tier */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Plan Tier</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{profileData.plan}</span>
                                            <span className="text-xs text-gray-500">(Billed Annually)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Declaration */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Declaration</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Declaration 1 */}
                                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">I confirm I am authorized to represent this company</span>
                                    </div>

                                    {/* Declaration 2 */}
                                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">I accept the Terms of Service and Privacy Policy</span>
                                    </div>

                                    {/* Declaration 3 */}
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-gray-700">
                                            Heard about us via: <span className="font-semibold">LinkedIn Advertisement</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={handleCancelReview}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel review
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleRejectAccount}
                                        className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                    >
                                        Reject Account
                                    </button>
                                    <button
                                        onClick={handleApproveAccount}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab.startsWith('Documents') && (
                        <>
                            {/* Documents Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Documents</h3>

                                {/* Document Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Document Thumbnail */}
                                            <div className="aspect-[4/3] bg-gray-100 relative group cursor-pointer" onClick={() => handleViewDocument(doc)}>
                                                {doc.type === 'image' ? (
                                                    <img
                                                        src={doc.url}
                                                        alt="Document preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <FileText className="h-16 w-16 text-gray-300" />
                                                    </div>
                                                )}
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-lg px-4 py-2 font-semibold text-gray-900 text-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                        View Document
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Document Info */}
                                            <div className="p-4">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                    {doc.category}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {doc.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {doc.size} • {doc.date}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'KYC' && (
                        <>
                            {/* KYC Header */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                                            <span className="text-gray-500 font-bold text-sm">02</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">Stage 2: KYC Verification</h3>
                                            <p className="text-xs text-gray-500">Identity verification process</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">
                                            AWAITING SUBMISSION
                                        </span>
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-md">
                                            Not yet submitted
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                                                KYC not yet submitted by the user
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                When this user completes their KYC submission, you will be able to review and verify their identity documents here.
                                            </p>

                                            {/* Required Documents Badges */}
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    ID Document
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Address Verification
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6">
                                <button
                                    onClick={handleCancelReview}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel review
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleRejectAccount}
                                        className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                                    >
                                        Reject Account
                                    </button>
                                    <button
                                        onClick={handleApproveAccount}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Activity Log' && (
                        <>
                            {/* Activity Log */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-6">Activity Log</h3>

                                <div className="space-y-6">
                                    {/* Activity 1 - Email Verified */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Email Verified</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    2 hours ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">User verified email via magic link</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: System
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 2 - Account Created */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Account Created</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    2 hours ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">User registered via Sign Up page</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 3 - Login Attempt */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Login Attempt</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    1 hour ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Successful login from IP 192.168.1.1</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 4 - Profile Updated */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Profile Updated</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    45 mins ago
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Company information modified</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: David Turner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity 5 - Stage 1 Review Started */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900">Stage 1 Review Started</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Just now
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">Admin opened profile for review</p>
                                            <span className="inline-block px-2 py-1 bg-gray-50 text-xs text-gray-600 rounded">
                                                User: John (Admin)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Admin Notes' && (
                        <>
                            {/* Admin Notes */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-900">Admin Notes</h3>
                                    <button
                                        onClick={handleAddNewNote}
                                        className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Note
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {notes.map((note) => (
                                        <div key={note.id} className="flex gap-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-600">{note.initials}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{note.author}</span>
                                                    <span className="text-xs text-gray-400">{note.time}</span>
                                                </div>
                                                {editingNoteId === note.id ? (
                                                    <div>
                                                        <textarea
                                                            value={editNoteContent}
                                                            onChange={(e) => setEditNoteContent(e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f] mb-2"
                                                            rows="3"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(note.id)}
                                                                className="px-4 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {editingNoteId !== note.id && (
                                                <button
                                                    onClick={() => handleEditNote(note)}
                                                    className="text-sm font-semibold text-[#1e5a8f] hover:underline self-start"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Note */}
                                <div className="flex gap-4 pt-6 border-t border-gray-200">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-blue-600">YOU</span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            ref={noteTextareaRef}
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Write an internal note..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e5a8f]/20 focus:border-[#1e5a8f]"
                                            rows="3"
                                        ></textarea>
                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={handlePostNote}
                                                disabled={!newNote.trim()}
                                                className="px-5 py-2 bg-[#1e5a8f] text-white rounded-lg text-sm font-semibold hover:bg-[#164773] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Post Note
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    {/* Risk Analysis */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Risk Analysis</h3>
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>

                        {/* Risk Factors */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">IP Reputation</span>
                                <span className="font-semibold text-green-600">Clean</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Email Domain</span>
                                <span className="font-semibold text-green-600">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Notes</h3>
                            <button
                                onClick={() => {
                                    if (notes.length > 0) {
                                        setActiveTab('Admin Notes');
                                        setTimeout(() => {
                                            handleEditNote(notes[0]);
                                        }, 100);
                                    }
                                }}
                                className="text-sm font-bold text-[#1e5a8f] hover:underline"
                            >
                                Edit
                            </button>
                        </div>

                        {/* Note */}
                        {notes.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-gray-600">{notes[0].initials}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{notes[0].author}</span>
                                            <span className="text-xs text-gray-400">{notes[0].time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            "{notes[0].content}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setActiveTab('Admin Notes');
                                setTimeout(() => {
                                    if (noteTextareaRef.current) {
                                        noteTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        noteTextareaRef.current.focus();
                                    }
                                }, 100);
                            }}
                            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                        >
                            + Add Note
                        </button>
                    </div>

                    {/* Application Timeline */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Application Timeline</h3>

                        <div className="space-y-4">
                            {/* Timeline Item 1 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Stage 1 Review Started</div>
                                    <div className="text-xs text-gray-500 mb-1">David Turner profile opened by Admin</div>
                                    <div className="text-xs text-gray-400">Just now</div>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Email Verified</div>
                                    <div className="text-xs text-gray-500 mb-1">User verified email via magic link</div>
                                    <div className="text-xs text-gray-400">2 hours ago</div>
                                </div>
                            </div>

                            {/* Timeline Item 3 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 mb-0.5">Registered</div>
                                    <div className="text-xs text-gray-500 mb-1">Account created via Sign Up</div>
                                    <div className="text-xs text-gray-400">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountProfile;
