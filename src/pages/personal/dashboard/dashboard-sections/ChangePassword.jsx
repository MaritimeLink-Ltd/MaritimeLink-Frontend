import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
// Logo image is now in public/images. Use direct path in <img src="/images/logo.png" />

const ChangePassword = ({ onBack }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = () => {
        // Handle password change logic
        alert('Password changed successfully!');
        onBack();
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-6 left-6">
                <img src={logo} alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            {/* Main Form Container - matching officer dashboard sizing */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 h-[80vh] flex flex-col">
                {/* Content Area - scrollable if needed */}
                <div className="flex-1 overflow-y-auto">
                    {/* Back Button and Title */}
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-lg font-medium">Change Password</span>
                    </button>

                    {/* Current Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <button className="text-blue-900 text-sm mt-2 hover:underline">
                            Forgot Password?
                        </button>
                    </div>

                    {/* New Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button - stays at bottom */}
                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors mt-6"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;
