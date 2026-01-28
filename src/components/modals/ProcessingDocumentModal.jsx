import { X, FileText } from 'lucide-react';

function ProcessingDocumentModal({ isOpen, onClose }) {
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

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-8">
                    <span className="text-gray-900 font-medium">Identity Verification</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#003971] font-medium">Processing</span>
                </div>

                {/* Icon with Animation */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-400 animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Processing Document
                </h2>

                {/* Description */}
                <p className="text-center text-gray-500">
                    Extracting details securely...
                </p>

                {/* Loading Bar */}
                <div className="mt-8">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#003971] rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProcessingDocumentModal;
