import { X, Upload, Info } from 'lucide-react';
import { useState } from 'react';
import kycService from '../../services/kycService';

const resolveProfessionalId = () => {
    const candidateKeys = ['professionalId', 'professional_id', 'userId', 'user_id', 'id'];

    for (const key of candidateKeys) {
        const value = localStorage.getItem(key);
        if (value) return value;
    }

    return null;
};

const resolveEntityId = (userType) => {
    if (userType === 'recruiter') {
        return localStorage.getItem('recruiterId') || localStorage.getItem('userId') || localStorage.getItem('id');
    }

    if (userType === 'training-provider') {
        return localStorage.getItem('trainingProviderId') || localStorage.getItem('training_provider_id') || localStorage.getItem('userId') || localStorage.getItem('id');
    }

    return resolveProfessionalId();
};

function UploadDocumentModal({ isOpen, onClose, documentType, onUploadComplete, userType }) {
    const [frontSide, setFrontSide] = useState(null);
    const [backSide, setBackSide] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    if (!isOpen) return null;

    const handleFrontUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFrontSide(file);
            // Reset back side whenever a new front is selected
            setBackSide(null);
            setUploadError(null);
        }
    };

    const handleBackUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // FIX #6: Guard in the handler — some browsers (Safari, older Chrome)
        // allow clicks through a <label> wrapping a disabled <input>, so the
        // disabled attribute alone is not a reliable gate.
        if (!frontSide) {
            // Reset the input so the same file can be selected again after front is uploaded
            e.target.value = '';
            return;
        }

        setBackSide(file);
        setIsUploading(true);
        setUploadError(null);

        try {
            const entityId = resolveEntityId(userType);

            if (!entityId) {
                throw new Error('Session error: your account ID could not be found. Please log out and log back in.');
            }

            let frontResponse, backResponse;

            if (userType === 'recruiter') {
                frontResponse = await kycService.uploadRecruiterFrontDocument(entityId, frontSide);
                backResponse = await kycService.uploadRecruiterBackDocument(entityId, file);
            } else if (userType === 'training-provider') {
                frontResponse = await kycService.uploadTrainingProviderFrontDocument(entityId, frontSide);
                backResponse = await kycService.uploadTrainingProviderBackDocument(entityId, file);
            } else {
                frontResponse = await kycService.uploadFrontDocument(entityId, frontSide);
                backResponse = await kycService.uploadBackDocument(entityId, file);
            }

            // Merge OCR data with document URLs from both upload responses
            const ocrData = frontResponse.data?.ocrData || frontResponse.data || {};
            const documentFrontUrl = frontResponse.data?.documentUrl || frontResponse.data?.url || '';
            const documentBackUrl = backResponse.data?.documentUrl || backResponse.data?.url || '';

            onUploadComplete({
                ...ocrData,
                documentFrontUrl,
                documentBackUrl,
            });
        } catch (err) {
            console.error('Document upload failed: ', err);
            setUploadError(err.data?.message || err.message || 'Failed to upload documents. Please try again.');
            // Reset back side so the user can retry
            setBackSide(null);
            // Reset the input value so the same file can be reselected
            e.target.value = '';
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/*
             * KEY CHANGE: Added max-h-[90vh] + flex flex-col so the modal
             * never exceeds 90% of the viewport height.
             * The inner scroll container (overflow-y-auto + flex-1) handles
             * overflow independently of the sticky header/footer areas.
             */}
            <div className="bg-white rounded-2xl max-w-md w-full relative flex flex-col max-h-[90vh]">

                {/* ── STICKY HEADER (never scrolls away) ── */}
                <div className="p-6 pb-0 flex-shrink-0">
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
                        <span className="text-[#003971] font-medium">Upload ID</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Upload {documentType || 'driving license'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Make sure all corners are visible and text is clear
                    </p>
                </div>

                {/* ── SCROLLABLE BODY ── */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                    {uploadError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {uploadError}
                        </div>
                    )}

                    {/* Upload Areas */}
                    <div className="space-y-4 mb-6 relative">
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl">
                                <span className="font-medium text-[#003971] bg-white p-2 rounded shadow">
                                    Uploading documents...
                                </span>
                            </div>
                        )}

                        {/* Front Side */}
                        <div>
                            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#003971] transition-colors">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFrontUpload}
                                />
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                <p className="font-medium text-gray-900 mb-1">
                                    {frontSide ? frontSide.name : 'Click to upload front side'}
                                </p>
                                <p className="text-xs text-gray-500">JPG, PNG or PDF up to 5MB</p>
                            </label>
                        </div>

                        {/* Back Side */}
                        {/* FIX #6: The visual disabled state is kept for UX clarity,
                            but the actual gate is inside handleBackUpload above.
                            The input element has no disabled attribute so the handler
                            controls access cross-browser consistently. */}
                        <div>
                            <label
                                className={`block border-2 border-dashed rounded-xl p-8 text-center transition-colors ${frontSide
                                        ? 'border-gray-300 hover:border-[#003971] cursor-pointer'
                                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    }`}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleBackUpload}
                                />
                                <Upload className={`h-8 w-8 mx-auto mb-3 ${frontSide ? 'text-gray-400' : 'text-gray-300'}`} />
                                <p className={`font-medium mb-1 ${frontSide ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {backSide ? backSide.name : 'Click to upload back side'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {frontSide ? 'JPG, PNG or PDF up to 5MB' : 'Upload front side first'}
                                </p>
                            </label>
                        </div>
                    </div>

                    {/* Photo Quality Tips */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-blue-900 mb-2">Photo Quality Tips</p>
                                <ul className="space-y-1 text-sm text-blue-700">
                                    <li>No glare or shadows</li>
                                    <li>High resolution and sharp</li>
                                    <li>All 4 corners visible</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadDocumentModal;