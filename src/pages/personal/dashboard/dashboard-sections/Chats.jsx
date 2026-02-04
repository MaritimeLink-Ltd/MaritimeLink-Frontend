import React, { useState } from 'react';
import { MessageCircle, Building2, ArrowUp, ArrowLeft } from 'lucide-react';

const Chats = ({ onViewJob }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showChatList, setShowChatList] = useState(true); // For mobile toggle

  // Sample chat data - using state so messages can be updated
  const [conversations, setConversations] = useState([
    {
      id: 1,
      company: 'ABC Company',
      lastMessage: 'Okay Thanks 🙌',
      time: '14:57',
      unread: 1,
      job: {
        id: 1,
        title: 'Senior Seafarer',
        company: 'ABC Company',
        location: 'London',
        salary: 'GBP 50000',
        category: 'Officer',
        jobType: 'Contract',
        jobDescription: 'On-site Job: United Kingdom (London / Joining Port as Assigned)',
        aboutCompany: 'We are a reputable maritime organization operating international vessels with a strong commitment to safety, compliance, and operational excellence.',
        whatWeLookFor: 'We value professionalism, discipline, and a strong safety mindset.',
        responsibilities: [
          'Navigate and operate vessel safely',
          'Maintain deck equipment and systems',
          'Ensure compliance with maritime regulations',
          'Coordinate with crew members effectively'
        ]
      },
      messages: [
        { id: 1, text: 'Hi, we are intrested in your resume', sender: 'company', timestamp: 'Yesterday 12:56pm' },
        { id: 2, text: 'Hi, Thats Great', sender: 'user' },
        { id: 3, text: 'Lets discuss more , tommorrov', sender: 'company' },
        { id: 4, text: 'is that fine by you?', sender: 'company' },
        { id: 5, text: 'Yes , thats fine by me', sender: 'user', status: 'Seen' },
      ]
    },
    {
      id: 2,
      company: 'ABC Company',
      lastMessage: 'okay got it',
      time: '14:57',
      unread: 0,
      job: null,
      messages: []
    },
    {
      id: 3,
      company: 'ABC Company',
      lastMessage: 'okay got it',
      time: '14:57',
      unread: 0,
      job: null,
      messages: []
    },
    {
      id: 4,
      company: 'ABC Company',
      lastMessage: 'okay got it',
      time: '14:57',
      unread: 0,
      job: null,
      messages: []
    },
    {
      id: 5,
      company: 'ABC Company',
      lastMessage: 'okay got it',
      time: '14:57',
      unread: 0,
      job: null,
      messages: []
    },
  ]);

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      const newMessage = {
        id: Date.now(),
        text: messageInput.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      // Update conversations state
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === selectedChat.id) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageInput.trim(),
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            };
          }
          return conv;
        })
      );

      // Update selected chat to show new message immediately
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

      setMessageInput('');
    }
  };

  // Empty state - no conversations
  if (conversations.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Chats</h1>
          <p className="text-gray-500 mt-1 text-lg">Connect with recruiters</p>
        </div>
        <div className="flex flex-col items-center justify-center mt-32">
          <div className="mb-6">
            <MessageCircle
              size={80}
              strokeWidth={1.5}
              className="text-gray-300"
            />
          </div>
          <p className="text-gray-400 text-lg">No messages yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Chats</h1>
        <p className="text-gray-500 mt-1 text-base sm:text-lg">Connect with recruiters</p>
      </div>

      {/* Chat Layout */}
      <div className="flex-1 flex lg:overflow-hidden">
        {/* Chat List - Left Sidebar - Hidden on mobile when chat is open */}
        <div className={`${selectedChat && 'hidden lg:block'} w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
          {conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                setShowChatList(false);
              }}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedChat?.id === chat.id ? 'bg-[#003971]/5' : ''
                }`}
            >
              {/* Company Icon */}
              <div className="shrink-0">
                <div className="w-12 h-12 bg-[#003971] rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {chat.company}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>

              {/* Unread Badge */}
              {chat.unread > 0 && (
                <div className="shrink-0">
                  <div className="w-6 h-6 bg-[#003971] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">{chat.unread}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Window - Right Side - Full width on mobile when chat is open */}
        <div className={`${!selectedChat && 'hidden lg:flex'} flex-1 flex flex-col bg-white`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      setSelectedChat(null);
                      setShowChatList(true);
                    }}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ArrowLeft size={20} className="text-gray-700" />
                  </button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#003971] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800 truncate">{selectedChat.company}</h2>
                </div>
                {selectedChat.job && (
                  <button 
                    onClick={() => onViewJob && onViewJob(selectedChat.job)}
                    className="hidden sm:flex items-center px-5 py-2 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    View Job Description
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-gray-50">
                {selectedChat.messages.map((message, index) => (
                  <div key={message.id} className="mb-4">
                    {/* Timestamp */}
                    {index === 0 && message.timestamp && (
                      <div className="text-center mb-6">
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl ${message.sender === 'user'
                          ? 'bg-[#003971] text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                          }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>

                    {/* Message Status */}
                    {message.status && (
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-400">{message.status}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003971]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-12 h-12 bg-[#003971] rounded-full flex items-center justify-center hover:bg-[#003971]/90 transition-colors"
                  >
                    <ArrowUp size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No chat selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-gray-400 text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
