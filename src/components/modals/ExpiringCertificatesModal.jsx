import { X, AlertCircle } from 'lucide-react';

function ExpiringCertificatesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    // Sample expiring certificates data
    const expiringCertificates = [
        {
            id: 1,
            name: 'Basic Safety Training',
            certificateNumber: 'BST-2024-001',
            expiryDate: '2026-04-15',
            daysRemaining: 69
        },
        {
            id: 2,
            name: 'Advanced Fire Fighting',
            certificateNumber: 'AFF-2024-002',
            expiryDate: '2026-04-20',
            daysRemaining: 74
        },
        {
            id: 3,
            name: 'Medical Care Certificate',
            certificateNumber: 'MCC-2024-003',
            expiryDate: '2026-04-25',
            daysRemaining: 79
        },
        {
            id: 4,
            name: 'Proficiency in Survival Craft',
            certificateNumber: 'PSC-2024-004',
            expiryDate: '2026-04-30',
            daysRemaining: 84
        },
        {
            id: 5,
            name: 'GMDSS Radio Operator Certificate',
            certificateNumber: 'GMDSS-2024-005',
            expiryDate: '2026-05-05',
            daysRemaining: 89
        }
    ];

    const getDaysRemainingColor = (days) => {
        if (days <= 30) return 'text-red-600 bg-red-50';
        if (days <= 60) return 'text-orange-600 bg-orange-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full relative my-4 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Certificates Expiring Soon
                        </h2>
                        <p className="text-sm text-gray-500">
                            {expiringCertificates.length} certificates expiring in the next 90 days
                        </p>
                    </div>
                </div>

                {/* Certificates List */}
                <div className="space-y-3">
                    {expiringCertificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {cert.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Certificate No: {cert.certificateNumber}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Expires: {new Date(cert.expiryDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${getDaysRemainingColor(cert.daysRemaining)}`}>
                                    {cert.daysRemaining} days left
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-[#003971] text-white py-3 rounded-xl font-semibold hover:bg-[#002855] transition-colors"
                    >
                        Go to Documents
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExpiringCertificatesModal;
