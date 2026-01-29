import React from 'react';
import { Lock, CreditCard, Mail, Send, FileText, Shield, LogOut, Trash2, ChevronRight, Crown } from 'lucide-react';


import { useNavigate } from 'react-router-dom';

const Profile = ({ onChangePasswordClick, onManageSubscriptionClick }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Here you would clear auth tokens/state if applicable (e.g., localStorage.removeItem('token');)
        navigate('/signin');
    };

    return (
        <div className="w-full h-full bg-gray-50 overflow-y-auto">
            {/* Main Content - Two Column Layout with spacing */}
            <div className="p-4 sm:p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Left Column - Account Settings */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 sm:mb-8">Account settings</h2>

                        {/* Profile Picture and Info */}
                        <div className="flex flex-col items-start mb-6 sm:mb-8">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 mb-4 overflow-hidden">
                                <img
                                    src="https://placehold.co/128x128/e5e7eb/6b7280?text=User"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Ali Shahzaib</h3>
                            <p className="text-xs sm:text-sm text-gray-500">www.alishahzaib23@gmail.com</p>
                        </div>

                        {/* Maritime Premium Card */}
                        <div className="bg-blue-900 rounded-xl p-4 sm:p-5 text-white cursor-pointer hover:bg-blue-800 transition-colors relative min-h-[44px] flex items-center">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown size={18} />
                                <h4 className="font-semibold text-base">Maritime Premium</h4>
                            </div>
                            <p className="text-sm mb-1">No active membership plan</p>
                            <p className="text-sm opacity-90">Click to see available plans</p>
                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2" size={20} />
                        </div>
                    </div>

                    {/* Right Column - Settings Options */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                        {/* Password Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Password</p>
                            <button
                                onClick={onChangePasswordClick}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group min-h-[44px]"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock size={16} className="text-blue-900" />
                                    <span className="text-gray-800 text-sm">Change password</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Subscription</p>
                            <button
                                onClick={onManageSubscriptionClick}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={16} className="text-blue-900" />
                                    <span className="text-gray-800 text-sm">Manage Subscription</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        {/* Contact Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Contact</p>
                            <div className="space-y-2">
                                <div className="w-full flex items-center justify-between p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-blue-900" />
                                        <span className="text-gray-800 text-sm">info@maritime.com</span>
                                    </div>
                                </div>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Send size={16} className="text-blue-900" />
                                        <span className="text-gray-800 text-sm">Send feedback</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Legal Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Legal</p>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-blue-900" />
                                        <span className="text-gray-800 text-sm">Terms & condition</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Shield size={16} className="text-blue-900" />
                                        <span className="text-gray-800 text-sm">Privacy policy</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Account Section */}
                        <div>
                            <p className="text-xs text-gray-400 mb-3">Account</p>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={handleLogout}>
                                    <div className="flex items-center gap-3">
                                        <LogOut size={16} className="text-blue-900" />
                                        <span className="text-gray-800 text-sm">Log out</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Trash2 size={16} className="text-gray-400" />
                                        <span className="text-gray-400 text-sm">Delete account</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
