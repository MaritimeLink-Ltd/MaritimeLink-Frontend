import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-8">
            {/* Logo in top-left corner */}
            <div className="absolute top-6 left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                {/* Back Button and Title */}
                <button
                    onClick={() => navigate('/personal/profile')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-lg font-medium">Back to Profile</span>
                </button>

                {/* Content */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800">Terms & Conditions</h1>
                    <p className="font-semibold text-gray-600">Last updated: February 5, 2026</p>
                    
                    <p className="text-gray-600 leading-relaxed">
                        Welcome to Maritime Link. By accessing or using our services, you agree to be bound by these Terms and Conditions.
                    </p>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h3>
                            <p className="text-gray-600 leading-relaxed">
                                By using Maritime Link, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree to these terms, please do not use our services.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. User Accounts</h3>
                            <p className="text-gray-600 leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must notify us immediately of any unauthorized use of your account.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Service Usage</h3>
                            <p className="text-gray-600 leading-relaxed">
                                You agree to use our services only for lawful purposes and in accordance with these terms. You must not misuse our platform or interfere with its operation. Any misuse may result in suspension or termination of your account.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Intellectual Property</h3>
                            <p className="text-gray-600 leading-relaxed">
                                All content, trademarks, and intellectual property on Maritime Link are owned by us or our licensors. You may not reproduce, distribute, or create derivative works without our express written permission.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5. User Content</h3>
                            <p className="text-gray-600 leading-relaxed">
                                By uploading content to our platform, you grant Maritime Link a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of providing our services.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6. Limitation of Liability</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Maritime Link shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for our services in the past 12 months.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">7. Dispute Resolution</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Any disputes arising from these terms shall be resolved through arbitration in accordance with applicable laws. You agree to waive your right to participate in class actions.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">8. Changes to Terms</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify you of significant changes via email or platform notification. Continued use of our services constitutes acceptance of modified terms.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">9. Termination</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We may terminate or suspend your account at any time for violation of these terms. Upon termination, your right to use our services will immediately cease.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">10. Contact Information</h3>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about these Terms & Conditions, please contact us at legal@maritime.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Button at Bottom */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => navigate('/personal/profile')}
                        className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
