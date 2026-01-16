import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import Webcam from 'react-webcam';
import { studentAPI } from '../services/api';
import FingerprintScanner from './FingerprintScanner';
import { faceService } from '../services/FaceService';
import './RegistrationForm.css';

const RegistrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    division: '',
    gender: '',
  });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [faceCaptureStep, setFaceCaptureStep] = useState(0); // 0=Idle, 1..5=Capturing
  const [capturedSamples, setCapturedSamples] = useState([]);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('');

  const qrRef = useRef();
  const webcamRef = useRef(null);

  const handleBiometricEnrollment = async (fingerprintData) => {
    try {
      const response = await studentAPI.storeBiometric(qrCode._id, {
        fingerprintData: fingerprintData
      });
      if (response.data.success) {
        setBiometricEnrolled(true);
        // setEnrollmentSuccess('Fingerprint registered successfully! ✅'); // Don't show global success yet
      }
    } catch (err) {
      setError('Failed to enroll fingerprint. Please try again.');
    }
  };

  const handleFaceEnrollment = async () => {
    if (!webcamRef.current) return;
    setLoading(true);
    setCapturedSamples([]);
    setFaceCaptureStep(1);
    setError('');

    const MAX_SAMPLES = 5;
    const samples = [];

    // Instructions for each sample to get diverse angles
    const instructions = [
      "Look Straight (Front)",
      "Look Straight (Front)",
      "Turn Head Slightly Left",
      "Turn Head Slightly Right",
      "Look Straight (Front)"
    ];

    try {
      // Capture loop
      for (let i = 1; i <= MAX_SAMPLES; i++) {
        setFaceCaptureStep(i);

        // Update instruction text dynamically if you want, or just rely on the step number
        // We will pass `i` to the render to show correct instruction

        // Small delay to allow user to adjust
        await new Promise(resolve => setTimeout(resolve, 1000));

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) throw new Error("Camera error");

        try {
          // Detect (Single Face)
          const descriptor = await faceService.getFaceDescriptor(imageSrc);

          console.log(`Captured sample ${i}/${MAX_SAMPLES}`);
          samples.push(descriptor);
          setCapturedSamples(prev => [...prev, descriptor]);
          setError(''); // Clear any previous transient error
        } catch (detectionErr) {
          console.warn(`Sample ${i} failed detection:`, detectionErr);
          setError(`Face not detected for Sample ${i}. Please hold steady.`);
          i--; // Retry this sample
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        }
      }

      // Send ALL samples to backend
      const response = await studentAPI.storeBiometric(qrCode._id, {
        faceDescriptors: samples // Send array of 5 descriptors
      });

      if (response.data.success) {
        setFaceEnrolled(true);
        setEnrollmentSuccess('Face Registered Successfully (5 Samples) ✅');
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Face enrollment failed.');
      setFaceCaptureStep(0); // Reset
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.class || !formData.division || !formData.gender) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await studentAPI.register({
        name: formData.name,
        class: formData.class,
        division: formData.division,
        gender: formData.gender,
      });

      if (response.data.success) {
        setSuccess('Student registered successfully!');
        setQrCode(response.data.student);

        if (onSuccess) {
          onSuccess(response.data.student);
        }

        if (onSuccess) {
          onSuccess(response.data.student);
        }

        // Do not reset form immediately, wait for biometric enrollment

      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCode.qrCode) {
      // Download from data URL
      const link = document.createElement('a');
      link.href = qrCode.qrCode;
      link.download = `QRCode_${qrCode.studentId}.png`;
      link.click();
    } else {
      // Fallback to canvas method
      const element = qrRef.current?.querySelector('canvas');
      if (element) {
        const link = document.createElement('a');
        link.href = element.toDataURL('image/png');
        link.download = `QRCode_${qrCode.studentId}.png`;
        link.click();
      }
    }
  };

  return (
    <div className="registration-container">
      <div className="form-section">
        <h2>Student Registration</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="class">Class *</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Class</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="division">Division *</label>
              <select
                id="division"
                name="division"
                value={formData.division}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>

      {qrCode && (
        <div className="post-registration-flow">
          <div className="qr-section">
            <h3>Generated QR Code</h3>
            <div className="qr-display" ref={qrRef}>
              {qrCode.qrCode ? (
                <img
                  src={qrCode.qrCode}
                  alt="QR Code"
                  style={{ width: '256px', height: '256px' }}
                />
              ) : (
                <QRCode
                  value={JSON.stringify({
                    studentId: qrCode.studentId,
                    name: qrCode.name,
                    class: qrCode.class,
                    division: qrCode.division,
                  })}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="qr-info">
              {qrCode.name} - ID: {qrCode.studentId}
            </p>
            <button onClick={downloadQRCode} className="btn-download">
              Download QR Code
            </button>
          </div>


          <div className="biometric-enrollment-section" style={{ marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3>Enroll Biometrics (Simulated)</h3>

            {!biometricEnrolled && <p style={{ marginBottom: '15px' }}>Please register your fingerprint to complete enrollment.</p>}

            <FingerprintScanner
              studentId={qrCode.studentId}
              onFingerprintCapture={handleBiometricEnrollment}
            />

            {biometricEnrolled && (
              <p className="alert success" style={{ marginTop: '10px' }}>Fingerprint Registered Successfully! ✅</p>
            )}

            {/* FACE ENROLLMENT SECTION - Shows only after Fingerprint is done */}
            {biometricEnrolled && !faceEnrolled && (
              <div className="face-enrollment-section" style={{ marginTop: '30px', borderTop: '2px dashed #eee', paddingTop: '20px' }}>
                <h3>Enroll Face (Simulated)</h3>

                <div className="face-instructions" style={{ marginBottom: '15px', textAlign: 'center' }}>
                  <p>Capture your face from 3 angles for better accuracy.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                    <span className={`badge ${faceCaptureStep >= 1 ? 'active-step' : ''}`}>1. Front</span>
                    <span className={`badge ${faceCaptureStep >= 2 ? 'active-step' : ''}`}>2. Left</span>
                    <span className={`badge ${faceCaptureStep >= 3 ? 'active-step' : ''}`}>3. Right</span>
                  </div>
                </div>

                <div className="webcam-container" style={{ textAlign: 'center', position: 'relative', display: 'inline-block' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={320}
                    height={240}
                    style={{ borderRadius: '8px', marginBottom: '10px' }}
                  />

                  {/* Face Detection Overlay (Simulated Green Box) */}
                  <div className="face-overlay">
                    <div className="scan-corner top-left"></div>
                    <div className="scan-corner top-right"></div>
                    <div className="scan-corner bottom-left"></div>
                    <div className="scan-corner bottom-right"></div>
                    <div className="scan-text">
                      {faceCaptureStep > 0 ? (
                        <>
                          <div>Capturing {faceCaptureStep}/5</div>
                          <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                            {["", "Look Straight", "Look Straight", "Turn Left", "Turn Right", "Look Straight"][faceCaptureStep]}
                          </div>
                        </>
                      ) : 'Look Forward & Click Start'}
                    </div>
                  </div>

                  <br />
                  <button
                    onClick={handleFaceEnrollment}
                    className="btn-submit"
                    style={{ width: 'auto', padding: '10px 20px' }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (faceCaptureStep > 0 ? 'Capturing...' : 'Start Face Capture')}
                  </button>
                </div>
              </div>
            )}

            {faceEnrolled && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p className="alert success" style={{ display: 'inline-block' }}>Face Registered Successfully! ✅</p>
                <br />
                <div style={{ background: '#d4edda', color: '#155724', padding: '15px', marginTop: '10px', borderRadius: '5px' }}>
                  <strong>🎉 Enrollment Complete!</strong><br />
                  Student is fully registered with 3 factors.
                </div>
                <button
                  onClick={() => {
                    setQrCode(null);
                    setBiometricEnrolled(false);
                    setFaceEnrolled(false);
                    setFaceCaptureStep(1);
                    setEnrollmentSuccess('');
                    setFormData({
                      name: '',
                      class: '',
                      division: '',
                      gender: '',
                    });
                  }}
                  className="btn-submit"
                  style={{ marginTop: '20px', backgroundColor: '#6c757d' }}
                >
                  Register New Student
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
