import { X, Camera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import kycService from '../../services/kycService';

function TakeSelfieModal({ isOpen, onClose, onPhotoTaken, onSelfieTaken }) {
    const videoRef = useRef(null);

    // FIX #1 & #2: Use a ref instead of state to hold the media stream.
    // A useState setter is async — the cleanup function in useEffect captures
    // the initial null value and never sees the updated stream. A ref is
    // mutated synchronously, so both cleanup and capturePhoto always read
    // the live MediaStream object.
    const streamRef = useRef(null);

    const [photoTaken, setPhotoTaken] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            // Store in ref — not state — so every closure sees the live value
            streamRef.current = mediaStream;
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please ensure camera permissions are enabled.');
        }
    };

    const stopCamera = () => {
        // FIX #1: cleanup now reliably stops the camera because it reads
        // streamRef.current instead of a stale captured state value
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }
        // Cleanup runs when isOpen changes to false OR on unmount
        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const capturePhoto = () => {
        setPhotoTaken(true);
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            if (blob) {
                try {
                    const professionalId = localStorage.getItem('professionalId');
                    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

                    await kycService.uploadSelfie(professionalId, file);

                    // FIX #2: capturePhoto now reads streamRef.current instead
                    // of the stale stream state — tracks are actually stopped here
                    stopCamera();

                    if (onSelfieTaken) {
                        onSelfieTaken();
                    } else if (onPhotoTaken) {
                        onPhotoTaken();
                    }
                } catch (err) {
                    console.error('Selfie upload failed', err);
                    setPhotoTaken(false);
                    alert('Upload failed. Please try again.');
                }
            }
        }, 'image/jpeg');
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full relative my-4 max-h-[95vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={handleClose}
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
                <div
                    className="relative mb-4 sm:mb-6 bg-gray-900 rounded-2xl overflow-hidden"
                    style={{ aspectRatio: '3/4', maxHeight: '60vh' }}
                >
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