import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

function VerifyDetailsModal({ isOpen, onClose, onSubmit, onConfirm, initialData, documentType }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        documentType: documentType || 'Driving License',
        documentNumber: '',
        expiryDate: '',
        issuingCountry: ''
    });

    // Track per-field validation errors
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (documentType) {
            setFormData(prev => ({ ...prev, documentType }));
        }
    }, [documentType]);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                firstName: initialData.name?.split(' ')[0] || prev.firstName,
                lastName: initialData.name?.split(' ').slice(1).join(' ') || prev.lastName,
                documentNumber: initialData.number || prev.documentNumber,
                expiryDate: initialData.expiryDate || prev.expiryDate,
                issuingCountry: initialData.issuingCountry || prev.issuingCountry,
            }));
        }
    }, [initialData]);

    if (!isOpen) return null;

    // ─── Validation ───────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        if (!formData.issuingCountry.trim()) newErrors.issuingCountry = 'Issuing country is required';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Block the request — don't fire API with empty fields
        }

        setErrors({});
        if (onConfirm) onConfirm(formData);
        else if (onSubmit) onSubmit(formData);
    };

    // Clears a field's error as soon as the user starts typing
    const clearError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const fieldClass = (field) =>
        `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors bg-white ${errors[field]
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-200 focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70'
        }`;

    const readonlyClass =
        'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50';

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

                <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Details</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Ensure all extracted information is correct
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); clearError('firstName'); }}
                                className={fieldClass('firstName')}
                            />
                            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); clearError('lastName'); }}
                                className={fieldClass('lastName')}
                            />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* Date of Birth & Document Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => { setFormData({ ...formData, dateOfBirth: e.target.value }); clearError('dateOfBirth'); }}
                                max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                                className={fieldClass('dateOfBirth')}
                            />
                            {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                            <input
                                type="text"
                                value={formData.documentType}
                                readOnly
                                className={readonlyClass}
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
                                className={readonlyClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => { setFormData({ ...formData, expiryDate: e.target.value }); clearError('expiryDate'); }}
                                min={new Date().toISOString().split('T')[0]}
                                className={fieldClass('expiryDate')}
                            />
                            {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>}
                        </div>
                    </div>

                    {/* Issuing Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issuing Country <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.issuingCountry}
                            onChange={(e) => { setFormData({ ...formData, issuingCountry: e.target.value }); clearError('issuingCountry'); }}
                            className={fieldClass('issuingCountry')}
                        />
                        {errors.issuingCountry && <p className="text-xs text-red-500 mt-1">{errors.issuingCountry}</p>}
                    </div>

                    {/* Submit */}
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