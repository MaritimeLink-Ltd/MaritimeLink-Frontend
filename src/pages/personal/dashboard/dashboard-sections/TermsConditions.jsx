import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TermsContent from '../../../../components/auth/TermsContent';

const TermsConditions = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-8">
            <div className="absolute top-6 left-6">
                <img src="/images/logo.png" alt="Maritime Link Logo" className="w-16 h-16 object-contain" />
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <button
                    onClick={() => navigate('/personal/profile')}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-lg font-medium">Back to Profile</span>
                </button>

                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800">Terms & Conditions</h1>
                    <TermsContent />
                </div>

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
