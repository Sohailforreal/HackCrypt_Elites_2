const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Session = require('../models/Session');
const TempAuthSession = require('../models/TempAuthSession');
const Attendance = require('../models/Attendance');
const {
    verifyFingerprint,
    verifyFaceDescriptor,
    generateFingerprintHash,
    generateFaceDescriptor,
} = require('../utils/biometricHandler');

// 1. Start Authentication (Verify QR)
router.post('/start', async (req, res) => {
    try {
        const { qrData } = req.body;

        // Parse QR Data
        const parsedData = JSON.parse(qrData);
        if (!parsedData.studentId) {
            throw new Error('Invalid QR Data');
        }

        // Check Active Session
        const activeSession = await Session.findOne({
            isActive: true,
            endTime: { $gt: new Date() },
            startTime: { $lte: new Date() }
        });

        if (!activeSession) {
            return res.status(403).json({ success: false, message: 'No active session' });
        }

        // Find Student
        // First try by custom studentId, then valid ObjectId
        let student = await Student.findOne({ studentId: parsedData.studentId });
        if (!student) {
            // logic to handle older IDs if needed, but primary is by string ID
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Create Temp Session
        const tempSession = new TempAuthSession({
            studentId: student._id,
            sessionId: activeSession._id,
            qrVerified: true // Implicitly verified if we found student via QR data
        });

        await tempSession.save();

        res.status(200).json({
            success: true,
            message: 'QR Verified. Proceed to Fingerprint.',
            tempAuthId: tempSession._id,
            studentName: student.name,
            studentId: student.studentId, // needed for frontend display
            class: student.class,
            division: student.division
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Verify Fingerprint
router.post('/verify-fingerprint', async (req, res) => {
    try {
        const { tempAuthId, fingerprintData } = req.body;

        const tempSession = await TempAuthSession.findById(tempAuthId).populate('studentId');
        if (!tempSession) {
            return res.status(404).json({ success: false, message: 'Session expired or invalid' });
        }

        // Verify Hash
        const incomingHash = generateFingerprintHash(fingerprintData);
        const result = verifyFingerprint(tempSession.studentId.fingerprint, incomingHash);

        if (result.verified) {
            tempSession.fingerprintVerified = true;
            await tempSession.save();
            res.status(200).json({ success: true, message: 'Fingerprint Verified' });
        } else {
            res.status(401).json({ success: false, message: 'Fingerprint Mismatch' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Verify Face
router.post('/verify-face', async (req, res) => {
    try {
        const { tempAuthId, faceImageData } = req.body;

        const tempSession = await TempAuthSession.findById(tempAuthId).populate('studentId');
        if (!tempSession) {
            return res.status(404).json({ success: false, message: 'Session expired or invalid' });
        }

        // Verify Face (Simulated)
        // In real app: generate descriptor from image
        const incomingDescriptor = generateFaceDescriptor(faceImageData);
        // Use verifyFaceDescriptor with voting logic (expects array of descriptors)
        const result = verifyFaceDescriptor(tempSession.studentId.faceDescriptors, incomingDescriptor);

        if (result.verified) {
            tempSession.faceVerified = true;
            await tempSession.save();
            res.status(200).json({ success: true, message: 'Face Verified' });
        } else {
            res.status(401).json({ success: false, message: 'Face Mismatch' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Finalize Attendance
router.post('/finalize', async (req, res) => {
    try {
        const { tempAuthId } = req.body;

        const tempSession = await TempAuthSession.findById(tempAuthId);
        if (!tempSession) {
            return res.status(404).json({ success: false, message: 'Session expired or invalid' });
        }

        if (!tempSession.qrVerified || !tempSession.fingerprintVerified || !tempSession.faceVerified) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete Verification',
                status: {
                    qr: tempSession.qrVerified,
                    fingerprint: tempSession.fingerprintVerified,
                    face: tempSession.faceVerified
                }
            });
        }

        // Check duplicate in Attendance (Final check)
        const existing = await Attendance.findOne({
            studentId: tempSession.studentId,
            sessionId: tempSession.sessionId
        });

        if (existing) {
            await TempAuthSession.findByIdAndDelete(tempAuthId); // Cleanup even if duplicate
            return res.status(409).json({ success: false, message: 'Attendance already marked.' });
        }

        // Create Attendance
        const attendance = new Attendance({
            studentId: tempSession.studentId,
            sessionId: tempSession.sessionId,
            qrVerified: true,
            fingerprintVerified: true,
            photoVerified: true,
            status: 'Present',
            verifiedAt: new Date()
        });

        await attendance.save();

        // Cleanup Temp Session
        await TempAuthSession.findByIdAndDelete(tempAuthId);

        res.status(201).json({ success: true, message: 'Attendance Marked Successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
