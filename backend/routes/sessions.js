const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Create/Start a new session
router.post('/start', async (req, res) => {
    try {
        const { name, durationMinutes } = req.body;

        // Check if there is already an active session
        const activeSession = await Session.findOne({
            isActive: true,
            endTime: { $gt: new Date() }
        });

        if (activeSession) {
            return res.status(409).json({
                success: false,
                message: 'An attendance session is already active.',
                session: activeSession
            });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (durationMinutes || 60) * 60000);

        const newSession = new Session({
            name: name || `Session - ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
            startTime,
            endTime,
            isActive: true
        });

        await newSession.save();

        res.status(201).json({
            success: true,
            message: 'Attendance session started successfully',
            session: newSession
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to start session',
            error: error.message
        });
    }
});

// Stop a session
router.post('/stop/:id', async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.isActive = false;
        session.endTime = new Date(); // End strictly at this moment
        await session.save();

        res.json({
            success: true,
            message: 'Session stopped successfully',
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to stop session',
            error: error.message
        });
    }
});

// Get currently active session
router.get('/active', async (req, res) => {
    try {
        const activeSession = await Session.findOne({
            isActive: true,
            endTime: { $gt: new Date() }
        });

        if (!activeSession) {
            return res.status(200).json({
                success: false,
                message: 'No active session'
            });
        }

        res.status(200).json({
            success: true,
            session: activeSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session',
            error: error.message
        });
    }
});

module.exports = router;
