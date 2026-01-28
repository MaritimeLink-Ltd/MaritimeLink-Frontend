import { useState } from 'react';
import {
    Search,
    Building2,
    Send,
    FileText
} from 'lucide-react';

function AdminChats() {
    const [selectedChat, setSelectedChat] = useState(1);
    const [messageInput, setMessageInput] = useState('');

    const chats = [
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

    const messages = [
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
    ];

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
                            {chats.map((chat) => (
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
                            ))}
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
                                <button className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center gap-1 text-sm">
                                    <FileText className="h-4 w-4" />
                                    Report
                                </button>
                                <button className="bg-[#003971] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#002855] transition-colors flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    View Profile
                                </button>
                            </div>
                        </div>

                        {/* Messages - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#CBD5E0 transparent'
                            }}
                        >
                            {messages.map((message, idx) => (
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
                        </div>

                        {/* Message Input - Fixed at bottom */}
                        <div className="border-t border-gray-100 p-5 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                                />
                                <button className="bg-[#003971] text-white p-3 rounded-full hover:bg-[#002855] transition-colors">
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminChats;
