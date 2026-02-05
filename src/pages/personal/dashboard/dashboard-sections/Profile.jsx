import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Mail, Send, FileText, Shield, LogOut, Trash2, ChevronRight, Crown, X, Check, AlertTriangle } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [showPremiumPlans, setShowPremiumPlans] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const handleLogout = () => {
        // Here you would clear auth tokens/state if applicable (e.g., localStorage.removeItem('token');)
        navigate('/signin');
    };

    const handleFeedbackSubmit = () => {
        if (feedbackMessage.trim()) {
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setShowFeedbackModal(false);
                setFeedbackMessage('');
                setFeedbackSubmitted(false);
            }, 2000);
        }
    };

    const handleDeleteAccount = () => {
        // Handle account deletion logic
        console.log('Account deleted');
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
                        <div 
                            onClick={() => setShowPremiumPlans(true)}
                            className="bg-[#003971] rounded-xl p-4 sm:p-5 text-white cursor-pointer hover:bg-[#003971]/90 transition-colors relative"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Crown size={20} />
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
                                onClick={() => navigate('/personal/profile/change-password')}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group min-h-[44px]"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock size={16} className="text-[#003971]" />
                                    <span className="text-gray-800 text-sm">Change password</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Subscription</p>
                            <button
                                onClick={() => navigate('/personal/profile/manage-subscription')}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={16} className="text-[#003971]" />
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
                                        <Mail size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">info@maritime.com</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowFeedbackModal(true)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Send size={16} className="text-[#003971]" />
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
                                <button 
                                    onClick={() => navigate('/personal/terms')}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Terms & condition</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button 
                                    onClick={() => navigate('/personal/privacy')}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield size={16} className="text-[#003971]" />
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
                                        <LogOut size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Log out</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Trash2 size={16} className="text-red-500" />
                                        <span className="text-red-500 text-sm">Delete account</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Plans Modal */}
            {showPremiumPlans && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowPremiumPlans(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-800">Maritime Premium Plans</h2>
                                <button onClick={() => setShowPremiumPlans(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Basic Plan */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£9.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Apply to unlimited jobs</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Basic profile visibility</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Email support</span>
                                            </li>
                                        </ul>
                                        <button className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                                            Select Plan
                                        </button>
                                    </div>

                                    {/* Professional Plan */}
                                    <div className="border-2 border-blue-500 rounded-xl p-6 relative bg-blue-50">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">POPULAR</span>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£19.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Everything in Basic</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Priority profile visibility</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Featured in searches</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Priority support</span>
                                            </li>
                                        </ul>
                                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                            Select Plan
                                        </button>
                                    </div>

                                    {/* Premium Plan */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£29.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Everything in Professional</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Top profile ranking</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Exclusive job opportunities</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Dedicated account manager</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">24/7 priority support</span>
                                            </li>
                                        </ul>
                                        <button className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                                            Select Plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Send Feedback Modal */}
            {showFeedbackModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {feedbackSubmitted ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
                                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Send Feedback</h2>
                                        <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <X size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={feedbackMessage}
                                        onChange={(e) => setFeedbackMessage(e.target.value)}
                                        placeholder="Share your thoughts, suggestions, or report issues..."
                                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                                    />
                                    <button
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackMessage.trim()}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Submit Feedback
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} className="text-red-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Delete Account?</h2>
                                <p className="text-gray-600">This action cannot be undone. All your data, including your resume, applications, and messages will be permanently deleted.</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Yes, Delete My Account
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
