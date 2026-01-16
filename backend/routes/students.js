const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { generateQRCode } = require('../utils/qrCodeHandler');
const {
  generateFingerprintHash,
  generateFaceDescriptor,
} = require('../utils/biometricHandler');

// Register a new student
router.post('/register', async (req, res) => {
  try {
    const { name, class: className, division, gender } = req.body;

    // Validation
    if (!name || !className || !division || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, class, division, gender',
      });
    }

    // Auto-generate Student ID (STU + Timestamp + Random 3 digit)
    const studentId = `STU${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Check if student already exists (by ID is now redundant as it's generated, but good for sanity)
    // Maybe check by name + class + division to prevent duplicates?
    // For now, let's trust the generation.

    // Generate QR code
    const qrCodeData = await generateQRCode({
      studentId,
      name,
      class: className,
      division,
    });

    // Create new student
    const newStudent = new Student({
      name,
      studentId,
      class: className,
      division,
      gender,
      qrCode: qrCodeData,
    });

    // Save student
    const savedStudent = await newStudent.save();

    console.log('✅ Student registered:', studentId);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        _id: savedStudent._id,
        name: savedStudent.name,
        studentId: savedStudent.studentId,
        class: savedStudent.class,
        division: savedStudent.division,
        gender: savedStudent.gender,
        qrCode: savedStudent.qrCode,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// Get all students
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
});

// Get single student by ID
router.get('/:studentId', async (req, res) => {
  try {
    let student = null;

    // 1. Try finding by custom studentId (String)
    try {
      student = await Student.findOne({ studentId: req.params.studentId });
    } catch (err) {
      console.error(`Error finding student by studentId "${req.params.studentId}":`, err.message);
    }

    // 2. If not found, check if it's a valid MongoDB ObjectId and try matching _id
    // strict regex for 24 hex characters to avoid CastErrors with partial strings
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!student && objectIdRegex.test(req.params.studentId)) {
      try {
        student = await Student.findById(req.params.studentId);
      } catch (err) {
        console.error(`Error finding student by _id "${req.params.studentId}":`, err.message);
      }
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
});

// Store biometric data
router.post('/biometric/:studentId', async (req, res) => {
  try {
    const { fingerprintData, faceDescriptors } = req.body;

    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Store fingerprint
    if (fingerprintData) {
      student.fingerprint = generateFingerprintHash(fingerprintData);
    }

    // Store face descriptors (Array of arrays)
    if (faceDescriptors) {
      student.faceDescriptors = faceDescriptors;
    }

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Biometric data stored successfully',
      student: {
        _id: updatedStudent._id,
        name: updatedStudent.name,
        studentId: updatedStudent.studentId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to store biometric data',
      error: error.message,
    });
  }
});

module.exports = router;
