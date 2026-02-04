import { X } from 'lucide-react';
import { useState } from 'react';

function VerifyDetailsModal({ isOpen, onClose, onSubmit, onConfirm }) {
    const [formData, setFormData] = useState({
        firstName: 'Sarah',
        lastName: 'Jenkins',
        dateOfBirth: '',
        documentType: 'Driving License',
        documentNumber: '****4832',
        expiryDate: '',
        issuingCountry: 'United Kingdom'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onConfirm) {
            onConfirm(formData);
        } else if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
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
                    <span className="text-[#003971] font-medium">Verify Info</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Verify Details
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Ensure all extracted information is correct
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>
                    </div>

                    {/* Date of Birth & Document Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                            <input
                                type="text"
                                value={formData.documentType}
                                readOnly
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Document Number & Expiry Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
                            <input
                                type="text"
                                value={formData.documentNumber}
                                readOnly
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                            />
                        </div>
                    </div>

                    {/* Issuing Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Country</label>
                        <input
                            type="text"
                            value={formData.issuingCountry}
                            onChange={(e) => setFormData({ ...formData, issuingCountry: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/20 focus:border-[#003971]"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#003971] text-white py-3 rounded-xl font-bold hover:bg-[#002855] transition-colors mt-6"
                    >
                        Submit Verification
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerifyDetailsModal;
