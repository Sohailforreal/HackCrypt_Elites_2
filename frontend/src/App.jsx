import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import MultiFactorAuth from './components/MultiFactorAuth';
import AttendanceDashboard from './components/AttendanceDashboard';
import AdminSessionPanel from './components/AdminSessionPanel';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-logo">
              🎓 Attendance System
            </h1>
            <ul className="nav-menu">
              <li>
                <Link
                  to="/"
                  className={activeTab === 'home' ? 'active' : ''}
                  onClick={() => setActiveTab('home')}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={activeTab === 'register' ? 'active' : ''}
                  onClick={() => setActiveTab('register')}
                >
                  Register Student
                </Link>
              </li>
              <li>
                <Link
                  to="/mark-attendance"
                  className={activeTab === 'attendance' ? 'active' : ''}
                  onClick={() => setActiveTab('attendance')}
                >
                  Mark Attendance
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={activeTab === 'dashboard' ? 'active' : ''}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className={activeTab === 'admin' ? 'active' : ''}
                  onClick={() => setActiveTab('admin')}
                  style={{ color: '#dc3545' }}
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/mark-attendance" element={<MultiFactorAuth />} />
            <Route path="/dashboard" element={<AttendanceDashboard />} />
            <Route path="/admin" element={<div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
              <AdminSessionPanel />
              {/* You could add other admin tools here later */}
            </div>}
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Advanced Attendance System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Welcome to Advanced Attendance System</h2>
        <p>Secure attendance registration with Multi-Factor Authentication</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>QR Code Scanning</h3>
            <p>Quick and secure student identification using QR codes generated during registration.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👆</div>
            <h3>Fingerprint Scanner</h3>
            <p>Biometric fingerprint verification for enhanced security and authenticity.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h3>Face Recognition</h3>
            <p>Photo-based identity verification to prevent proxy attendance and ensure accuracy.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard Analytics</h3>
            <p>Real-time attendance tracking and comprehensive reports for administrators.</p>
          </div>
        </div>

        <div className="how-it-works">
          <h3>How It Works</h3>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Registration</h4>
              <p>Students register with their basic information and receive a unique QR code.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h4>Enrollment</h4>
              <p>Biometric data (fingerprint & face) is captured and stored securely.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h4>Authentication</h4>
              <p>Student must provide all three factors: QR code, fingerprint, and face.</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h4>Confirmation</h4>
              <p>Attendance is marked only if all three authentication methods are verified.</p>
            </div>
          </div>
        </div>

        <div className="requirements">
          <h3>Requirements for Attendance</h3>
          <div className="requirements-list">
            <div className="req-item required">
              <span className="req-icon">✓</span>
              <span>QR Code (Required)</span>
            </div>
            <div className="req-item required">
              <span className="req-icon">✓</span>
              <span>Fingerprint (Required)</span>
            </div>
            <div className="req-item required">
              <span className="req-icon">✓</span>
              <span>Photo Recognition (Required)</span>
            </div>
            <p className="req-note">Note: All three authentication methods must be successfully verified. If any factor is missing or fails, attendance will not be marked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
