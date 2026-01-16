const mongoose = require('mongoose');

const tempAuthSessionSchema = new mongoose.Schema(
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
        qrVerified: {
            type: Boolean,
            default: false,
        },
        fingerprintVerified: {
            type: Boolean,
            default: false,
        },
        faceVerified: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // Documents expire after 300 seconds (5 minutes)
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TempAuthSession', tempAuthSessionSchema);
