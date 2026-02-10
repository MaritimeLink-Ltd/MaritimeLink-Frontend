import { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, Clock, RefreshCw, Lock, Paperclip, AlertTriangle, Send, CheckCircle, X } from 'lucide-react';

function SupportCaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Reply to User');
    const [replyText, setReplyText] = useState('');
    const [activeModal, setActiveModal] = useState(null); // 'assign', 'resolve', 'close', 'report'

    // Button States
    const [isAssigned, setIsAssigned] = useState(false);
    const [isResolved, setIsResolved] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    const handleAction = (type) => {
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const confirmAction = () => {
        // Here you would implement the actual API call
        console.log(`Confirmed action: ${activeModal}`);

        // Update local state based on action
        if (activeModal === 'assign') {
            setIsAssigned(true);
        } else if (activeModal === 'resolve') {
            setIsResolved(true);
        } else if (activeModal === 'close') {
            setIsClosed(true);
        }

        closeModal();
    };

    // Sample case detail data (in real app, this would be fetched based on id)
    const [caseData, setCaseData] = useState({
        id: `#${id}`,
        user: {
            id: '1',
            name: 'Mark Bennett',
            role: 'SEAFARER',
            email: 'mark.bennett@email.co',
            phone: '+1 (555) 123-4567',
            avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect fill="%23E5E7EB" width="56" height="56" rx="28"/><text x="50%" y="50%" dy=".35em" fill="%239CA3AF" font-family="Arial" font-size="20" text-anchor="middle">MB</text></svg>'
        },
        caseDetails: {
            subject: 'Account Access Problem - Password Reset Loop',
            priority: 'High',
            priorityColor: 'text-red-500',
            category: 'Account Access',
            assignedTo: {
                name: 'James T.',
                avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect fill="%23003971" width="24" height="24" rx="12"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="10" text-anchor="middle">JT</text></svg>'
            },
            createdAt: '14 mins ago',
            updatedAt: '2 mins ago'
        },
        internalNotes: [
            {
                id: 1,
                content: 'User has had multiple login issues previously. Suspected device compatibility issue.',
                author: 'Sarah M.',
                timestamp: '2 days ago'
            }
        ],
        conversation: [
            {
                id: 1,
                sender: 'user',
                name: 'Mark Bennett',
                timestamp: '10:42 AM',
                message: 'Hi, I keep getting a "Password Incorrect" error even though I just reset it 5 minutes ago. This is the third time this week. Can you please check if my account is locked?',
                date: 'Today'
            },
            {
                id: 2,
                sender: 'agent',
                name: 'James T.',
                timestamp: '10:45 AM',
                message: 'Hello Mark,\n\nI\'ve checked your account status and it appears active, but there were multiple failed login attempts from a different IP address.\n\nI have just cleared your active sessions. Please try resetting your password one more time using the link I just sent to your email.\n\nLet me know if this works.',
                avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect fill="%23003971" width="32" height="32" rx="16"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="12" text-anchor="middle">JT</text></svg>'
            },
            {
                id: 3,
                sender: 'system',
                message: 'System cleared all active sessions for user',
                timestamp: ''
            }
        ]
    });

    const replyTabs = ['Reply to User', 'Internal Note'];

    const handleSend = () => {
        if (!replyText.trim()) return;

        if (activeTab === 'Reply to User') {
            const newMessage = {
                id: caseData.conversation.length + 1,
                sender: 'agent',
                name: 'James T.',
                timestamp: 'Just now',
                message: replyText,
                avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect fill="%23003971" width="32" height="32" rx="16"/><text x="50%" y="50%" dy=".35em" fill="white" font-family="Arial" font-size="12" text-anchor="middle">JT</text></svg>'
            };
            setCaseData({
                ...caseData,
                conversation: [...caseData.conversation, newMessage]
            });
        } else {
            const newNote = {
                id: caseData.internalNotes.length + 1,
                content: replyText,
                author: 'James T.',
                timestamp: 'Just now'
            };
            setCaseData({
                ...caseData,
                internalNotes: [...caseData.internalNotes, newNote]
            });
        }
        setReplyText('');
    };

    const handleAddNote = () => {
        setActiveTab('Internal Note');
        document.querySelector('textarea')?.focus();
    };

    // Ref for conversation container
    const conversationEndRef = useRef(null);

    // Auto-scroll to bottom when conversation changes
    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [caseData.conversation]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-4 pt-2 px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back to Cases</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-gray-900">{caseData.id}</span>
                            <span className="text-lg text-gray-600">{caseData.user.name}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => !isAssigned && handleAction('assign')}
                            disabled={isAssigned}
                            className={`px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors shadow-sm ${isAssigned
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'
                                }`}
                        >
                            {isAssigned ? 'Assigned' : 'Assign to Me'}
                        </button>
                        <button
                            onClick={() => !isResolved && handleAction('resolve')}
                            disabled={isResolved}
                            className={`flex items-center gap-2 px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${isResolved
                                ? 'bg-green-50 text-green-400 border-green-100 cursor-not-allowed'
                                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            <CheckCircle className="h-4 w-4" />
                            {isResolved ? 'Resolved' : 'Resolve'}
                        </button>
                        <button
                            onClick={() => !isClosed && handleAction('close')}
                            disabled={isClosed}
                            className={`flex items-center gap-2 px-4 py-1.5 border rounded-lg text-sm font-semibold transition-colors ${isClosed
                                ? 'bg-orange-50 text-orange-400 border-orange-100 cursor-not-allowed'
                                : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                }`}
                        >
                            <span className={`font-bold text-lg leading-none ${isClosed ? 'text-orange-400' : 'text-orange-600'}`}>&times;</span>
                            {isClosed ? 'Closed' : 'Close Case'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 overflow-hidden pb-4 px-6 min-h-0">
                {/* Left Sidebar */}
                <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                    {/* User Info Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 mb-2 overflow-hidden">
                                <img
                                    src={caseData.user.avatar}
                                    alt={caseData.user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-0.5">{caseData.user.name}</h3>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase rounded-md">
                                {caseData.user.role}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-xs text-gray-600 pl-1">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                <span>{caseData.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 pl-1">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{caseData.user.phone}</span>
                            </div>
                            <button
                                onClick={() => navigate(`/admin/accounts/${caseData.user.id}`)}
                                className="flex items-center gap-3 text-xs text-blue-600 hover:underline cursor-pointer pl-1 font-medium bg-transparent border-0 p-0"
                            >
                                <User className="h-3.5 w-3.5" />
                                <span>View Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Case Details Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">CASE DETAILS</h4>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium mb-1">Subject</p>
                                <p className="text-xs font-bold text-gray-900 leading-snug">{caseData.caseDetails.subject}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Priority</p>
                                    <p className={`text-xs font-bold ${caseData.caseDetails.priorityColor}`}>
                                        {caseData.caseDetails.priority}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">Category</p>
                                    <p className="text-xs font-semibold text-gray-900">{caseData.caseDetails.category}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 font-medium mb-1.5">Assigned To</p>
                                <div className="flex items-center gap-2">
                                    <img
                                        src={caseData.caseDetails.assignedTo.avatar}
                                        alt={caseData.caseDetails.assignedTo.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span className="text-xs font-semibold text-gray-900">
                                        {caseData.caseDetails.assignedTo.name}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 font-medium mb-1.5">Timestamps</p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <span>Created {caseData.caseDetails.createdAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                        <RefreshCw className="h-3 w-3 text-gray-400" />
                                        <span>Updated {caseData.caseDetails.updatedAt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes Card */}
                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">INTERNAL NOTES</h4>
                        </div>

                        <div className="space-y-2.5 mb-3">
                            {caseData.internalNotes.map((note) => (
                                <div key={note.id} className="bg-white rounded-lg p-2.5 border border-amber-100 shadow-sm">
                                    <p className="text-xs text-gray-700 mb-1.5 leading-relaxed">{note.content}</p>
                                    <p className="text-[10px] text-gray-400 text-right uppercase tracking-wide font-medium">- {note.author}, {note.timestamp}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddNote}
                            className="w-full py-2 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 transition-colors shadow-sm"
                        >
                            Add Note
                        </button>
                    </div>
                </div>

                {/* Right Content - Conversation */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm min-w-0">
                    {/* Conversation Area */}
                    <div className="flex-1 p-8 bg-gray-50/50 custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '100%' }}>
                        {/* Date Header */}
                        <div className="text-center mb-8">
                            <span className="px-3 py-1 bg-gray-200/60 rounded-full text-xs font-bold text-gray-500">Today</span>
                        </div>

                        {/* Messages */}
                        <div className="space-y-8">
                            {caseData.conversation.map((msg) => {
                                if (msg.sender === 'user') {
                                    return (
                                        <div key={msg.id} className="max-w-[75%]">
                                            {/* User name and timestamp inside scrollable area */}
                                            <div className="flex items-center gap-2 mb-2 ml-1">
                                                <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                                                <span className="text-xs text-gray-400 font-medium">{msg.timestamp}</span>
                                            </div>
                                            <div className="bg-white rounded-2xl rounded-tl-sm p-5 shadow-sm border border-gray-200/60">
                                                <p className="text-[15px] text-gray-800 leading-relaxed">{msg.message}</p>
                                            </div>
                                        </div>
                                    );
                                } else if (msg.sender === 'agent') {
                                    return (
                                        <div key={msg.id} className="flex justify-end">
                                            <div className="max-w-[75%]">
                                                {/* Agent name and timestamp inside scrollable area */}
                                                <div className="flex items-center justify-end gap-2 mb-2 mr-1">
                                                    <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{msg.timestamp}</span>
                                                    <div className="w-6 h-6 rounded-full bg-[#003971] flex items-center justify-center text-[10px] text-white font-bold">JT</div>
                                                </div>
                                                <div className="bg-blue-50/50 rounded-2xl rounded-tr-sm p-5 border border-blue-100 shadow-sm">
                                                    <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-line">{msg.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (msg.sender === 'system') {
                                    return (
                                        <div key={msg.id} className="flex justify-center py-2">
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
                                                <div className="p-0.5 bg-gray-400 rounded-full text-white">
                                                    <Clock className="h-2.5 w-2.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500">{msg.message}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                        {/* Scroll anchor at the end of scrollable area */}
                        <div ref={conversationEndRef} />
                    </div>

                    {/* Reply Section */}
                    <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-2">
                            {replyTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-xs font-bold transition-colors ${activeTab === tab
                                        ? 'text-[#003971]'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Reply Input */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Type your ${activeTab === 'Internal Note' ? 'internal note' : 'reply'} here...`}
                                className="w-full h-16 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
                            />
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleAction('report')}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                                        title="Report Issue"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#003971] text-white rounded-lg text-xs font-bold hover:bg-[#002a54] transition-colors shadow-sm"
                                >
                                    <Send className="h-3 w-3" />
                                    {activeTab === 'Internal Note' ? 'Add Note' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeModal && (
                <ActionModal
                    isOpen={!!activeModal}
                    onClose={closeModal}
                    onConfirm={confirmAction}
                    type={activeModal}
                />
            )}
        </div>
    );
}

export default SupportCaseDetails;

const ActionModal = ({ isOpen, onClose, onConfirm, type }) => {
    if (!isOpen) return null;

    let content = {};
    switch (type) {
        case 'assign':
            content = {
                title: 'Assign Case to Me',
                message: 'Are you sure you want to take ownership of this case? It will be moved to your active queue.',
                confirmLabel: 'Confirm Assignment',
                confirmColor: 'bg-blue-600 hover:bg-blue-700'
            };
            break;
        case 'resolve':
            content = {
                title: 'Resolve Case',
                message: 'This will mark the case as resolved and notify the user. Please ensure all issues have been addressed.',
                confirmLabel: 'Mark as Resolved',
                confirmColor: 'bg-green-600 hover:bg-green-700'
            };
            break;
        case 'close':
            content = {
                title: 'Close Case',
                message: 'Closing this case will prevent further replies. Use this for cases that are invalid or completed.',
                confirmLabel: 'Close Case',
                confirmColor: 'bg-orange-600 hover:bg-orange-700'
            };
            break;
        case 'report':
            content = {
                title: 'Report Issue',
                message: 'Flag this case for review by a supervisor? This is used for abusive language or policy violations.',
                confirmLabel: 'Flag Case',
                confirmColor: 'bg-red-600 hover:bg-red-700'
            };
            break;
        default:
            return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{content.title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-8">
                        {content.message}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${content.confirmColor}`}
                        >
                            {content.confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
