import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    checkIn: {
        type: Date,
    },
    checkOut: {
        type: Date,
    },
    type: {
        type: String,
        enum: ['Present', 'WFH', 'Half Day', 'Leave'],
        default: 'Present',
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    // Salary Integration Fields
    isHalfDay: {
        type: Boolean,
        default: false
    },
    isLate: {
        type: Boolean,
        default: false
    },
    lateMinutes: {
        type: Number,
        default: 0
    }
});

// Ensure one record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
