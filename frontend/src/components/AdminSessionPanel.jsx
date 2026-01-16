import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import './AdminSessionPanel.css';

const AdminSessionPanel = () => {
    const [activeSession, setActiveSession] = useState(null);
    const [duration, setDuration] = useState(60); // default 60 mins
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchActiveSession = async () => {
        try {
            const response = await sessionAPI.getActive();
            if (response.data.success) {
                setActiveSession(response.data.session);
            } else {
                setActiveSession(null);
            }
        } catch (err) {
            // If 404/not success, assume no session
            setActiveSession(null);
        }
    };

    useEffect(() => {
        fetchActiveSession();
        // Poll every 30 seconds to update status
        const interval = setInterval(fetchActiveSession, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleStartSession = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await sessionAPI.start({
                name: `Session - ${new Date().toLocaleTimeString()}`,
                durationMinutes: parseInt(duration),
            });

            if (response.data.success) {
                setSuccess('Session started successfully!');
                setActiveSession(response.data.session);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const handleStopSession = async () => {
        if (!activeSession) return;

        if (!window.confirm('Are you sure you want to stop the current session?')) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await sessionAPI.stop(activeSession._id);
            setSuccess('Session stopped successfully.');
            setActiveSession(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to stop session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-session-panel">
            <h2>⚠️ Admin Session Controls</h2>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}

            {activeSession ? (
                <div className="active-session-card">
                    <div className="status-indicator active">
                        <span className="blink">●</span> Active Session
                    </div>
                    <h3>{activeSession.name}</h3>
                    <p><strong>Started:</strong> {new Date(activeSession.startTime).toLocaleTimeString()}</p>
                    <p><strong>Ends:</strong> {new Date(activeSession.endTime).toLocaleTimeString()}</p>

                    <button
                        onClick={handleStopSession}
                        className="btn-stop-session"
                        disabled={loading}
                    >
                        {loading ? 'Stopping...' : 'Stop Session'}
                    </button>
                </div>
            ) : (
                <div className="start-session-form">
                    <p className="status-indicator inactive">● No Active Session</p>
                    <form onSubmit={handleStartSession}>
                        <div className="form-group">
                            <label htmlFor="duration">Session Duration (minutes):</label>
                            <select
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="duration-select"
                            >
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                                <option value="120">2 Hours</option>
                                <option value="180">3 Hours</option>
                                <option value="480">8 Hours (Full Day)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="btn-start-session"
                            disabled={loading}
                        >
                            {loading ? 'Starting...' : 'Start Attendance Session'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminSessionPanel;
