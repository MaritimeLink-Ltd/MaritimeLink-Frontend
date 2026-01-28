import { X, Globe, CreditCard, User, FileText } from 'lucide-react';

function SelectDocumentModal({ isOpen, onClose, onSelectDocument }) {
    if (!isOpen) return null;

    const documentTypes = [
        { id: 'passport', label: 'Passport', icon: Globe },
        { id: 'driving-license', label: 'Driving License', icon: CreditCard },
        { id: 'national-id', label: 'National ID', icon: User },
        { id: 'residence-permit', label: 'Residence Permit', icon: FileText }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <span className="text-gray-900 font-medium">Identity Verification</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#003971] font-medium">Document Type</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Select Document Type
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Use a valid government-issued ID
                </p>

                {/* Document Options */}
                <div className="space-y-3">
                    {documentTypes.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => {
                                onSelectDocument(doc.id);
                                onClose();
                            }}
                            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#003971] hover:bg-blue-50 transition-all"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <doc.icon className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="text-gray-900 font-medium">{doc.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SelectDocumentModal;
