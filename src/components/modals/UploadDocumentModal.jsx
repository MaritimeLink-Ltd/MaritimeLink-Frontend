import { X, Upload, Info } from 'lucide-react';
import { useState } from 'react';

function UploadDocumentModal({ isOpen, onClose, documentType, onUploadComplete }) {
    const [frontSide, setFrontSide] = useState(null);
    const [backSide, setBackSide] = useState(null);

    if (!isOpen) return null;

    const handleFrontUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFrontSide(file);
        }
    };

    const handleBackUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackSide(file);
            // Simulate upload complete
            setTimeout(() => {
                onUploadComplete();
            }, 1500);
        }
    };

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
                    <span className="text-[#003971] font-medium">Upload ID</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Upload {documentType || 'driving license'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Make sure all corners are visible and text is clear
                </p>

                {/* Upload Areas */}
                <div className="space-y-4 mb-6">
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
                    <div>
                        <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${frontSide
                                ? 'border-gray-300 hover:border-[#003971]'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            }`}>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleBackUpload}
                                disabled={!frontSide}
                            />
                            <p className={`font-medium mb-1 ${frontSide ? 'text-gray-900' : 'text-gray-400'}`}>
                                {backSide ? backSide.name : 'Back side (Upload front first)'}
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
    );
}

export default UploadDocumentModal;
