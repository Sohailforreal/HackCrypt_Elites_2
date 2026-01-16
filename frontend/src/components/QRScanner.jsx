import React, { useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import './QRScanner.css';

const QRScanner = ({ onQRScanned }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationId;
    let scanned = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const scanQRCode = () => {
          if (videoRef.current && canvasRef.current && !scanned) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;

              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);

              if (code) {
                scanned = true;
                onQRScanned(code.data);
              }
            }
          }

          if (!scanned) {
            animationId = requestAnimationFrame(scanQRCode);
          }
        };

        scanQRCode();
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };

    startCamera();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onQRScanned]);

  return (
    <div className="qr-scanner-container">
      <video
        ref={videoRef}
        className="qr-scanner-video"
        autoPlay
        playsInline
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="qr-scanner-overlay">
        <div className="qr-scanner-frame"></div>
        <p className="qr-scanner-hint">Point camera at QR code</p>
      </div>
    </div>
  );
};

export default QRScanner;
