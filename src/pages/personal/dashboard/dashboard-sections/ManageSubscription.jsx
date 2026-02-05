import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const ManageSubscription = () => {
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const handleUpdatePlan = () => {
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/personal/profile');
        }, 2500);
    };

    const handleCancel = () => {
        navigate('/personal/profile');
    };

    const benefits = [
        {
            title: 'Priority Recruiter Visibility',
            description: 'Your profile appears higher when recruiters initiate chats'
        },
        {
            title: 'Priority Recruiter Visibility',
            description: 'Your profile appears higher when recruiters initiate chats'
        },
        {
            title: 'Priority Recruiter Visibility',
            description: 'Your profile appears higher when recruiters initiate chats'
        },
        {
            title: 'Priority Recruiter Visibility',
            description: 'Your profile appears higher when recruiters initiate chats'
        }
    ];

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-6 left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            {/* Main Form Container - no fixed height, all content visible */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
                {/* Back Button and Title */}
                <button
                    onClick={() => navigate('/personal/profile')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-lg font-medium">Active Subscription</span>
                </button>

                {/* Subscription Card */}
                <div className="bg-blue-900 rounded-xl p-6 text-white mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Crown size={24} />
                            <span className="text-lg font-medium">Monthly</span>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">PKR 1449</div>
                            <div className="text-sm opacity-90">For 30 Days</div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-6">
                    <h3 className="text-sm text-gray-500 mb-4">What Premium Gives You</h3>
                    <div className="space-y-3">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                <h4 className="font-medium text-gray-800 mb-1">{benefit.title}</h4>
                                <p className="text-sm text-gray-500">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleUpdatePlan}
                        className="flex-1 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                    >
                        Update Plan
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Plan Upgraded!</h3>
                            <p className="text-gray-500">
                                Your subscription has been successfully updated
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubscription;
