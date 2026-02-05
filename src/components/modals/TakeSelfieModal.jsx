import { X, Camera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function TakeSelfieModal({ isOpen, onClose, onPhotoTaken, onSelfieTaken }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photoTaken, setPhotoTaken] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please ensure camera permissions are enabled.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const capturePhoto = () => {
        setPhotoTaken(true);
        // Simulate photo capture and processing
        setTimeout(() => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (onSelfieTaken) {
                onSelfieTaken();
            } else if (onPhotoTaken) {
                onPhotoTaken();
            }
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full relative my-4 max-h-[95vh] overflow-y-auto">
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
                <div className="relative mb-4 sm:mb-6 bg-gray-900 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '60vh' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Face Oval Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 sm:w-64 h-60 sm:h-80 border-4 border-white/50 rounded-[50%] relative">
                            {/* Instruction Text */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2 sm:mt-4 text-white text-xs sm:text-sm font-medium whitespace-nowrap">
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
