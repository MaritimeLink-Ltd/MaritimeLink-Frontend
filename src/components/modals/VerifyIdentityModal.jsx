import { X, ShieldCheck } from 'lucide-react';

function VerifyIdentityModal({ isOpen, onClose, onStartVerification }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full relative my-4 max-h-[95vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-[#003971]" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Verify Your Identity
                </h2>

                {/* Description */}
                <p className="text-center text-gray-600 mb-8">
                    To protect professionals from scams and keep MaritimeLink trusted, we need to verify your identity before we continue.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onStartVerification || onClose}
                        className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors"
                    >
                        Start Now
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyIdentityModal;
