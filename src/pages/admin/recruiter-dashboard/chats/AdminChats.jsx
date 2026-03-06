import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    Building2,
    Send,
    FileText,
    X,
    AlertTriangle
} from 'lucide-react';

function AdminChats({ candidateId: propCandidateId, candidateName: propCandidateName, onViewProfile, isAdmin }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Support both props (if mounted as component) and location.state (if navigated via route)
    const candidateId = propCandidateId || location.state?.candidateId;
    const candidateName = propCandidateName || location.state?.candidateName;

    const [selectedChat, setSelectedChat] = useState(candidateId || 1);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const messagesEndRef = useRef(null);
    const [messagesList, setMessagesList] = useState([
        {
            id: 1,
            text: 'Hi , we are interested in your resume',
            sent: false,
            time: 'Yesterday 12:56pm'
        },
        {
            id: 2,
            text: 'Lets discuss more , tommorow',
            sent: false
        },
        {
            id: 3,
            text: 'is that fine by you?',
            sent: false
        },
        {
            id: 4,
            text: 'Hi, Thats Great',
            sent: true
        },
        {
            id: 5,
            text: 'Yes , thats fine by me',
            sent: true,
            seen: true
        }
    ]);

    const baseChats = [
        ...(candidateId && candidateName ? [{
            id: candidateId,
            name: candidateName,
            lastMessage: 'Start conversation',
            time: 'Now',
            unread: 0,
            online: true
        }] : []),
        {
            id: 1,
            name: 'Ali Shahzaib',
            lastMessage: 'Okay Thanks 🙌',
            time: '14:57',
            unread: 1,
            online: true
        },
        {
            id: 2,
            name: 'Abraham',
            lastMessage: 'okay got it',
            time: '14:57',
            unread: 0,
            online: false
        },
        {
            id: 3,
            name: 'Osifo',
            lastMessage: 'okay got it',
            time: '14:57',
            unread: 0,
            online: false
        },
        {
            id: 4,
            name: 'Umair',
            lastMessage: 'okay got it',
            time: '14:57',
            unread: 0,
            online: false
        },
        {
            id: 5,
            name: 'Quddus',
            lastMessage: 'okay got it',
            time: '14:57',
            unread: 0,
            online: false
        }
    ];

    const chats = baseChats;

    // Filter chats based on search query
    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const reportReasons = [
        { id: 'spam', label: 'Spam or unwanted messages' },
        { id: 'inappropriate', label: 'Inappropriate content' },
        { id: 'harassment', label: 'Harassment or bullying' },
        { id: 'scam', label: 'Scam or fraud' },
        { id: 'fake', label: 'Fake profile' },
        { id: 'other', label: 'Other' }
    ];

    const handleReport = () => {
        if (selectedReason) {
            console.log('Report submitted:', { chatId: selectedChat, reason: selectedReason });
            // Here you would send to backend
            setShowReportModal(false);
            setSelectedReason('');
            // You could show a success message here
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesList]);

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            setMessagesList([...messagesList, {
                id: messagesList.length + 1,
                text: messageInput,
                sent: true,
                time: undefined
            }]);
            setMessageInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const currentChat = chats.find(c => c.id === selectedChat);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
                <p className="text-gray-500 mt-1 text-sm">Connect with professionals</p>
            </div>

            {/* Chat Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-220px)]">
                {/* Chat List Sidebar */}
                <div className="lg:col-span-1 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col">
                        {/* Search */}
                        <div className="relative mb-4 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>

                        {/* Chat List - Scrollable */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#CBD5E0 transparent'
                            }}
                        >
                            {filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-gray-50' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 bg-[#003971] rounded-xl flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            {chat.online && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-bold text-gray-900 text-sm">{chat.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                                    {chat.unread > 0 && (
                                                        <div className="bg-[#003971] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                            {chat.unread}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No chats found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="lg:col-span-2 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Chat Header - Fixed */}
                        <div className="border-b border-gray-100 p-5 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-[#003971] rounded-xl flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    {currentChat?.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{currentChat?.name}</h3>
                                    {currentChat?.online && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                            Online
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    Report
                                </button>
                                <button
                                    onClick={() => onViewProfile ? onViewProfile(selectedChat) : navigate(isAdmin ? `/admin/candidate/${selectedChat}` : `/recruiter/candidate/${selectedChat}`)}
                                    className="bg-[#003971] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Profile
                                </button>
                            </div>
                        </div>

                        {/* Messages - Scrollable */}
                        <div
                            className="flex-1 overflow-y-auto p-5 space-y-4"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#CBD5E0 transparent',
                                maxHeight: 'calc(100vh - 400px)',
                                minHeight: '400px'
                            }}
                        >
                            {messagesList.map((message, idx) => (
                                <div key={message.id}>
                                    {message.time && (
                                        <div className="text-center mb-4">
                                            <span className="text-xs text-gray-500">{message.time}</span>
                                        </div>
                                    )}
                                    <div className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${message.sent ? '' : ''}`}>
                                            <div className={`px-4 py-3 rounded-2xl ${message.sent
                                                ? 'bg-[#003971] text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                }`}>
                                                <p className="text-sm">{message.text}</p>
                                            </div>
                                            {message.seen && (
                                                <p className="text-xs text-gray-500 mt-1 text-right">Seen</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input - Fixed at bottom */}
                        <div className="border-t border-gray-100 p-5 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[#003971] text-white p-3 rounded-full hover:bg-[#002855] transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h2 className="text-xl font-bold text-gray-900">Report User</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Please select a reason for reporting {currentChat?.name}
                        </p>

                        <div className="space-y-2 mb-6">
                            {reportReasons.map((reason) => (
                                <label
                                    key={reason.id}
                                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedReason === reason.id
                                        ? 'border-red-600 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason.id}
                                        checked={selectedReason === reason.id}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-900">{reason.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedReason('');
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!selectedReason}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${selectedReason
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminChats;
