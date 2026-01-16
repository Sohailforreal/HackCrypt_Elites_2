const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    photoVerified: {
      type: Boolean,
      default: false,
    },
    fingerprintVerified: {
      type: Boolean,
      default: false,
    },
    qrcodeVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Pending'],
      default: 'Pending',
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
