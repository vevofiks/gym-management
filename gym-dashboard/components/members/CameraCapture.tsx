import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Could not access camera. Please ensure you have given permission.');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                setIsCaptured(true);
                stopCamera();
            }
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setIsCaptured(false);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedImage && canvasRef.current) {
            canvasRef.current.toBlob((blob) => {
                if (blob) {
                    onCapture(blob);
                }
            }, 'image/jpeg', 0.8);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-border">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                    <h3 className="text-lg font-bold text-text-primary">Capture Member Photo</h3>
                    <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-muted transition-colors text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="p-6 text-center text-red-400">
                            <p>{error}</p>
                            <button
                                type="button"
                                onClick={startCamera}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : isCaptured ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capturedImage!} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="p-6 flex justify-center gap-4 bg-background/50">
                    {!isCaptured ? (
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Camera size={20} />
                            Capture Photo
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={retakePhoto}
                                className="flex items-center gap-2 rounded-xl bg-muted px-6 py-3 text-sm font-bold text-text-primary hover:bg-muted/80 transition-all"
                            >
                                <RefreshCw size={20} />
                                Retake
                            </button>
                            <button
                                type="button"
                                onClick={confirmPhoto}
                                className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-600 transition-all"
                            >
                                <Check size={20} />
                                Use This Photo
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};
