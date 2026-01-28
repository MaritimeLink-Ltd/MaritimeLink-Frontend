import { X, CheckCircle } from 'lucide-react';

function VerificationSubmittedModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Verification Submitted
                </h2>

                {/* Description */}
                <p className="text-center text-gray-600 mb-8">
                    Your verification has been submitted successfully. Our team will review it and notify you shortly via email.
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default VerificationSubmittedModal;
