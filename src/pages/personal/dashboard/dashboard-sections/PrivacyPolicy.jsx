import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
                    <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
                    <p className="font-semibold text-gray-600">Last updated: February 5, 2026</p>
                    
                    <p className="text-gray-600 leading-relaxed">
                        At Maritime Link, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
                    </p>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We collect information you provide directly, including name, email, phone number, resume data, and professional qualifications. We also collect information automatically through your use of our services, including device information, IP address, and usage patterns.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Your information is used to provide and improve our services, match you with job opportunities, communicate with you about updates and opportunities, analyze platform usage, and comply with legal obligations. We use this data to enhance your experience and provide relevant career opportunities.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Information Sharing</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We may share your information with employers, recruiters, and training providers as part of our services. We do not sell your personal data to third parties. We may share data with service providers who help us operate our platform, and we may disclose information when required by law.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Data Security</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We implement appropriate security measures to protect your information from unauthorized access, alteration, or destruction. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5. Cookies and Tracking</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser, but some features may not function properly if cookies are disabled.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6. Your Rights</h3>
                            <p className="text-gray-600 leading-relaxed">
                                You have the right to access, correct, or delete your personal information. You may also object to certain processing activities, request data portability, and withdraw consent at any time. To exercise these rights, please contact us at privacy@maritime.com.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">7. Data Retention</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your data within 30 days, except where retention is required by law.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">8. Children's Privacy</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it immediately.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to Privacy Policy</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this privacy policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of our services after changes constitutes acceptance of the updated policy.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">10. Contact Us</h3>
                            <p className="text-gray-600 leading-relaxed">
                                If you have questions about this privacy policy or how we handle your personal information, please contact us at privacy@maritime.com or write to us at our registered office address.
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

export default PrivacyPolicy;
