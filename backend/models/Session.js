const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Attendance Session',
        },
        startTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endTime: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: String, // Could be Admin ID in future
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
