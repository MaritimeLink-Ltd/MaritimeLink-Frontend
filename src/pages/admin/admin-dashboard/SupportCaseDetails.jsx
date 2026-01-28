import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, Clock, RefreshCw, Lock, Paperclip, AlertTriangle, Send, CheckCircle } from 'lucide-react';

function SupportCaseDetails() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('Reply to User');
    const [replyText, setReplyText] = useState('');

    // Sample case detail data (in real app, this would be fetched based on id)
    const caseDetail = {
        id: `#${id}`,
        user: {
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
    };

    const replyTabs = ['Reply to User', 'Internal Note'];

    return (
        <div className="h-[calc(100vh-9rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-6 pt-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/operations"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Back to Cases</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-gray-900">{caseDetail.id}</span>
                            <span className="text-lg text-gray-600">{caseDetail.user.name}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                            Assign to Me
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 border border-green-200 bg-green-50 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">
                            <CheckCircle className="h-4 w-4" />
                            Resolve
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
                            <span className="text-orange-600 font-bold text-lg leading-none">&times;</span>
                            Close Case
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-8 overflow-hidden pb-1">
                {/* Left Sidebar */}
                <div className="w-[360px] flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* User Info Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-100 mb-3 overflow-hidden">
                                <img
                                    src={caseDetail.user.avatar}
                                    alt={caseDetail.user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{caseDetail.user.name}</h3>
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase rounded-md">
                                {caseDetail.user.role}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600 pl-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{caseDetail.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 pl-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{caseDetail.user.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-blue-600 hover:underline cursor-pointer pl-2 font-medium">
                                <User className="h-4 w-4" />
                                <span>View Profile</span>
                            </div>
                        </div>
                    </div>

                    {/* Case Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">CASE DETAILS</h4>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1.5">Subject</p>
                                <p className="text-sm font-bold text-gray-900 leading-snug">{caseDetail.caseDetails.subject}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1.5">Priority</p>
                                    <p className={`text-sm font-bold ${caseDetail.caseDetails.priorityColor}`}>
                                        {caseDetail.caseDetails.priority}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1.5">Category</p>
                                    <p className="text-sm font-semibold text-gray-900">{caseDetail.caseDetails.category}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2">Assigned To</p>
                                <div className="flex items-center gap-2.5">
                                    <img
                                        src={caseDetail.caseDetails.assignedTo.avatar}
                                        alt={caseDetail.caseDetails.assignedTo.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className="text-sm font-semibold text-gray-900">
                                        {caseDetail.caseDetails.assignedTo.name}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2">Timestamps</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Created {caseDetail.caseDetails.createdAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Updated {caseDetail.caseDetails.updatedAt}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes Card */}
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="h-4 w-4 text-amber-500" />
                            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">INTERNAL NOTES</h4>
                        </div>

                        <div className="space-y-3 mb-4">
                            {caseDetail.internalNotes.map((note) => (
                                <div key={note.id} className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                                    <p className="text-sm text-gray-700 mb-2 leading-relaxed">{note.content}</p>
                                    <p className="text-[10px] text-gray-400 text-right uppercase tracking-wide font-medium">- {note.author}, {note.timestamp}</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-2.5 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors shadow-sm">
                            Add Note
                        </button>
                    </div>
                </div>

                {/* Right Content - Conversation */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm">
                    {/* Conversation Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 custom-scrollbar">
                        {/* Date Header */}
                        <div className="text-center mb-8">
                            <span className="px-3 py-1 bg-gray-200/60 rounded-full text-xs font-bold text-gray-500">Today</span>
                        </div>

                        {/* Messages */}
                        <div className="space-y-8">
                            {caseDetail.conversation.map((msg) => {
                                if (msg.sender === 'user') {
                                    return (
                                        <div key={msg.id} className="max-w-[75%]">
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
                    </div>

                    {/* Reply Section */}
                    <div className="flex-shrink-0 border-t border-gray-100 bg-white p-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-6 mb-4">
                            {replyTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-sm font-bold transition-colors ${activeTab === tab
                                        ? 'text-[#003971]'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <span className="text-sm font-bold text-gray-300">Internal Note</span>
                        </div>

                        {/* Reply Input */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply here..."
                                className="w-full h-24 bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors">
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors">
                                        <AlertTriangle className="h-5 w-5" />
                                    </button>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#003971] text-white rounded-lg text-sm font-bold hover:bg-[#002a54] transition-colors shadow-sm">
                                    <Send className="h-4 w-4" />
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupportCaseDetails;
