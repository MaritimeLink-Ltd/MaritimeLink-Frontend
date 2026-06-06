import { X, Upload } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';

function DocumentWalletSignupPromptModal({ isOpen, onClose, onUpload }) {
    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-lg" closeOnBackdrop={false}>
            <div className="bg-white rounded-2xl p-8 w-full relative shadow-xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                        <Upload className="h-10 w-10 text-[#003366]" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    Upload your documents
                </h2>

                <p className="text-center text-gray-700 font-medium mb-4">
                    Uploading your seagoing certificates is mandatory to complete your signup.
                </p>

                <p className="text-center text-gray-600 mb-8 text-sm leading-relaxed">
                    Upload and manage your seagoing certificates in one secure digital wallet. Earn a
                    MaritimeLink Verified Badge, boost recruiter trust, and apply for jobs and training
                    faster.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onUpload}
                        className="w-full bg-[#003366] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload className="h-5 w-5" />
                        Upload documents
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

export default DocumentWalletSignupPromptModal;
