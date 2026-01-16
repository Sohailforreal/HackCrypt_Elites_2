import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import QRScanner from './QRScanner';
import FingerprintScanner from './FingerprintScanner';

import { attendanceAPI, studentAPI, sessionAPI, authFlowAPI } from '../services/api';
import { faceService } from '../services/FaceService';
import './MultiFactorAuth.css';

const MultiFactorAuth = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [tempAuthId, setTempAuthId] = useState(null); // NEW: Temp Auth Session ID
  const [step, setStep] = useState(1); // 1: QR, 2: Fingerprint, 3: Photo
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [qrScanned, setQrScanned] = useState(false);
  const [fingerprintCaptured, setFingerprintCaptured] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [capturedPhotoSrc, setCapturedPhotoSrc] = useState(null);
  const isProcessing = useRef(false); // Ref to prevent double-scan
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  // The backend TempAuthSession handles it. But we keep local flags for UI.

  // Check for active session
  const checkSession = async () => {
    setLoading(true);
    try {
      const response = await sessionAPI.getActive();
      if (response.data.success) {
        setActiveSession(response.data.session);
        setError('');
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      setActiveSession(null);
      console.log("No active session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle QR code scan (Step 1)
  const handleQRScanned = async (qrData) => {
    if (isProcessing.current || qrScanned || error) return; // Prevent loop

    isProcessing.current = true;
    setLoading(true);

    try {
      const response = await authFlowAPI.start({ qrData });

      if (response.data.success) {
        setTempAuthId(response.data.tempAuthId);
        setStudentId(response.data.studentId);
        setStudentId(response.data.studentId);
        setStudent({
          name: response.data.studentName,
          studentId: response.data.studentId,
          class: response.data.class,
          division: response.data.division
        });
        setQrScanned(true);
        showToast(`QR Code Verified! ✅`);

        setTimeout(() => {
          setSuccess('');
          setStep(2);
          isProcessing.current = false;
        }, 1500);
      }
    } catch (err) {
      console.error('QR Error:', err);
      let errorMessage = 'Invalid QR or Student';

      if (err.response?.status === 403) {
        errorMessage = '⚠️ No Active Attendance Session. Please ask admin to start one.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      isProcessing.current = false;
    } finally {
      if (!error) setLoading(false); // Only unset loading if no error (to prevent flicker)
    }
  };

  // Handle fingerprint capture (Step 2)
  const handleFingerprintCapture = async (fingerprintData) => {
    try {
      setLoading(true);
      setError('');

      // CALL BACKEND VERIFY FINGERPRINT
      const response = await authFlowAPI.verifyFingerprint({
        tempAuthId,
        fingerprintData
      });

      if (response.data.success) {
        setFingerprintCaptured(true);
        showToast('Fingerprint Verified! ✅');

        setTimeout(() => {
          setStep(3);
        }, 1200);
      }
    } catch (err) {
      console.error('Fingerprint Error:', err);
      setError(err.response?.data?.message || 'Fingerprint Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  // Capture photo (Step 3)
  const capturePhoto = async () => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedPhotoSrc(imageSrc);
        setLoading(true);
        setError('');

        // Compute Descriptor Client-Side
        const descriptor = await faceService.getFaceDescriptor(imageSrc);

        // CALL BACKEND VERIFY FACE
        const response = await authFlowAPI.verifyFace({
          tempAuthId,
          faceImageData: descriptor // Send descriptor array
        });

        if (response.data.success) {
          setPhotoCaptured(true);
          showToast('Face Verified! ✅ Ready to Submit.');
        }
      } catch (err) {
        console.error('Face Error:', err);
        setError(err.response?.data?.message || err.message || 'Face Verification Failed');
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit attendance (Finalize)
  const submitAttendance = async () => {
    if (!tempAuthId) return;

    setLoading(true);
    setError('');

    try {
      const response = await authFlowAPI.finalize({ tempAuthId });

      if (response.data.success) {
        setSuccess('Attendance Marked Successfully! 🎉 Redirecting...');
        // resetForm(); // No need to reset if redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Finalization Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setStep(1);
      setStudentId(null);
      setStudent(null);
      setQrScanned(false);
      setFingerprintCaptured(false);
      setPhotoCaptured(false);
      setSuccess('');
      setTempAuthId(null);
      setCapturedPhotoSrc(null); // Reset captured photo source
    }, 2000);
  };




  // Custom reset for QR phase
  // Custom reset for QR phase
  const retryQRScan = () => {
    isProcessing.current = false;
    setQrScanned(false);
    setError('');
    setSuccess('');
    setLoading(false);
    setStudent(null);
  };

  return (
    <div className="mfa-container">
      {toast && (
        <div className="toast-notification">
          <span className="toast-icon">✨</span>
          <span>{toast.message}</span>
        </div>
      )}
      <h2>Mark Attendance - Multi-Factor Authentication</h2>

      {error && (
        <div className="alert error">
          {error}
          {step === 1 && <button onClick={retryQRScan} className="btn-retry-small" style={{ marginLeft: '10px', padding: '2px 8px' }}>Try Again</button>}
        </div>
      )}
      {success && <div className="alert success">{success}</div>}

      <div className="progress-bar">
        {/* ... existing progress bar code ... */}
        <div className={`step ${step >= 1 ? 'active' : ''} ${qrScanned ? 'completed' : ''} `}>
          <span>1</span>
          <p>QR Code</p>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${fingerprintCaptured ? 'completed' : ''} `}>
          <span>2</span>
          <p>Fingerprint</p>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${photoCaptured ? 'completed' : ''} `}>
          <span>3</span>
          <p>Photo</p>
        </div>
      </div>

      {student && (
        <div className="student-info">
          <h4>Student Info</h4>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>ID:</strong> {student.studentId}</p>
          <p><strong>Class:</strong> {student.class} - {student.division}</p>
        </div>
      )}

      {/* Only show authentication flow if session is active */}
      {!activeSession ? (
        <div className="no-session-container" style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h3>Attendance Session Not Active</h3>
          <p>Please wait for the administrator to start the attendance session.</p>
          <button
            onClick={checkSession}
            className="btn-reset"
            style={{ marginTop: '20px', maxWidth: '200px' }}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      ) : (
        <>
          {step === 1 && !qrScanned && !error && (
            <div className="auth-section">
              <div className="session-banner" style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>
                ● Active Session: <strong>{activeSession.name}</strong>
              </div>
              <h3>Step 1: Scan QR Code</h3>
              <QRScanner onQRScanned={handleQRScanned} />
            </div>
          )}
        </>
      )}
      {/* Show retry state if scanned but failed/error exists */}
      {step === 1 && error && (
        <div className="auth-section">
          <h3>Scan Failed</h3>
          <p>Please try scanning again.</p>
          <button onClick={retryQRScan} className="btn-reset">Scan Again</button>
        </div>
      )}

      {step === 2 && qrScanned && !fingerprintCaptured && (
        <div className="auth-section">
          <h3>Step 2: Scan Fingerprint</h3>
          <FingerprintScanner
            onFingerprintCapture={handleFingerprintCapture}
            studentId={student?.studentId}
          />
        </div>
      )}

      {step === 3 && fingerprintCaptured && !photoCaptured && (
        <div className="auth-section">
          <h3>Step 3: Capture Photo</h3>
          <div className="webcam-section" style={{ position: 'relative', display: 'inline-block' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
              style={{ borderRadius: '8px' }}
            />

            {/* Green Face Overlay */}
            <div className="face-overlay" style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '70%',
              height: '80%',
              border: '2px solid #00ff00',
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(0,255,0,0.3)',
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                width: '100%',
                textAlign: 'center',
                color: '#fff',
                textShadow: '0 1px 2px black',
                fontWeight: 'bold'
              }}>Align Face</div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <br />
            <button onClick={capturePhoto} className="btn-capture" style={{ marginTop: '40px' }}>
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {photoCaptured && (
        <div className="photo-preview">
          <h4>Photo Preview</h4>
          <img src={capturedPhotoSrc} alt="Captured" />
          <button
            onClick={() => {
              setPhotoCaptured(false);
              setCapturedPhotoSrc(null);
            }}
            className="btn-retake"
          >
            Retake Photo
          </button>
        </div>
      )}

      {qrScanned && fingerprintCaptured && photoCaptured && (
        <div className="submit-section">
          <div className="verification-checklist">
            <div className={`check - item ${qrScanned ? 'verified' : ''} `}>
              <span className="check-icon">✓</span>
              <p>QR Code Verified</p>
            </div>
            <div className={`check - item ${fingerprintCaptured ? 'verified' : ''} `}>
              <span className="check-icon">✓</span>
              <p>Fingerprint Captured</p>
            </div>
            <div className={`check - item ${photoCaptured ? 'verified' : ''} `}>
              <span className="check-icon">✓</span>
              <p>Photo Captured</p>
            </div>
          </div>

          <button
            onClick={submitAttendance}
            disabled={loading}
            className="btn-submit-attendance"
          >
            {loading ? 'Verifying...' : 'Submit Attendance'}
          </button>

          <button
            onClick={() => {
              setStep(1);
              setQrScanned(false);
              setFingerprintCaptured(false);
              setPhotoCaptured(false);
              setStudent(null);
              setStudentId(null);
              setTempAuthId(null);
              setCapturedPhotoSrc(null);
            }}
            className="btn-reset"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiFactorAuth;
