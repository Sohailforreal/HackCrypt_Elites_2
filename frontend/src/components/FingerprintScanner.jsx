import React, { useState, useRef } from 'react';
import './FingerprintScanner.css';

const FingerprintScanner = ({ onFingerprintCapture, studentId }) => {
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(false);
  const canvasRef = useRef(null);

  // Simple seeded random number generator
  const seededRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const simulateFingerprintScan = () => {
    setScanning(true);

    // Simulate fingerprint scanning process
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Create a numeric seed from studentId string
      let seed = 0;
      if (studentId) {
        for (let i = 0; i < studentId.length; i++) {
          seed += studentId.charCodeAt(i);
        }
      } else {
        seed = Math.random() * 1000; // Fallback if no ID (shouldn't happen in verified flow)
      }

      // Clear canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw fingerprint pattern based on SEED
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;

      // Draw concentric circles with some seeded variation
      // Adjusted for smaller 120x120 canvas (center 60,60)
      for (let i = 0; i < 8; i++) {
        const radius = 10 + i * 6 + (seededRandom(seed + i) * 5);
        ctx.beginPath();
        // Add some "wobble" to the arc based on seed
        const startAngle = seededRandom(seed + i * 2) * Math.PI;
        ctx.arc(60, 60, radius, startAngle, startAngle + (Math.PI * 1.5));
        ctx.stroke();
      }

      // Add specific "minutiae" points based on seed
      for (let i = 0; i < 20; i++) {
        const x = seededRandom(seed + i * 100) * 120;
        const y = seededRandom(seed + i * 200) * 120;
        ctx.fillStyle = `rgba(0, 0, 0, 0.6)`;
        ctx.fillRect(x, y, 2, 2);
      }

      const fingerprintData = canvas.toDataURL('image/png');
      onFingerprintCapture(fingerprintData);
      setCaptured(true);
      setScanning(false);
    }, 1500);
  };

  const retakeScan = () => {
    setCaptured(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fingerprint-scanner-container" style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="fingerprint-canvas"
        style={{ width: '120px', height: '120px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}
      />

      {!captured ? (
        <>
          <div className="fingerprint-instructions" style={{ marginBottom: '10px' }}>
            {/* Removing large instruction text as requested */}
            <p className="hint" style={{ fontSize: '0.8rem', color: '#666' }}>Scan fingerprint for: {studentId ? studentId.substring(0, 8) + '...' : 'New User'}</p>
          </div>

          <button
            onClick={simulateFingerprintScan}
            disabled={scanning}
            className="btn-scan-fingerprint"
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
          >
            {scanning ? `Scanning...` : 'Scan Fingerprint'}
          </button>
        </>
      ) : (
        <>
          <div className="success-message" style={{ marginBottom: '10px' }}>
            <p className="success-text" style={{ fontSize: '0.9rem', color: 'green' }}>✓ Captured</p>
          </div>
          <button onClick={retakeScan} className="btn-retake-scan" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
            Re-scan
          </button>
        </>
      )}
    </div>
  );
};

export default FingerprintScanner;
