import { X, Camera } from 'lucide-react';
import { useState, useRef } from 'react';

function TakeSelfieModal({ isOpen, onClose, onPhotoTaken }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photoTaken, setPhotoTaken] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const capturePhoto = () => {
        setPhotoTaken(true);
        // Simulate photo capture and processing
        setTimeout(() => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            onPhotoTaken();
        }, 1500);
    };

    if (!isOpen) return null;

    // Auto-start camera when modal opens
    if (isOpen && !stream && videoRef.current) {
        startCamera();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
                {/* Close Button */}
                <button
                    onClick={() => {
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                        }
                        onClose();
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <span className="text-gray-900 font-medium">Identity Verification</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-[#003971] font-medium">Selfie</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Take a Selfie
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    We'll compare this with your document photo
                </p>

                {/* Camera Preview */}
                <div className="relative mb-6 bg-gray-900 rounded-2xl overflow-hidden aspect-[3/4]">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Face Oval Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-80 border-4 border-white/50 rounded-[50%] relative">
                            {/* Instruction Text */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-4 text-white text-sm font-medium">
                                Position your face in the oval
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capture Button */}
                <button
                    onClick={capturePhoto}
                    disabled={photoTaken}
                    className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${photoTaken
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#003971] hover:bg-[#002855]'
                        } text-white`}
                >
                    <Camera className="h-5 w-5" />
                    {photoTaken ? 'Processing...' : 'Capture Photo'}
                </button>
            </div>
        </div>
    );
}

export default TakeSelfieModal;
