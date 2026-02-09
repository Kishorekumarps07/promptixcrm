import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fromDate: {
        type: Date,
        required: true,
    },
    toDate: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    leaveType: {
        type: String,
        enum: ['Sick', 'Casual', 'Privilege', 'Unpaid', 'Emergency'],
        required: true,
        default: 'Casual'
    },
    isPaid: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for fetching user history and admin filtering
LeaveRequestSchema.index({ userId: 1 });
LeaveRequestSchema.index({ status: 1 });

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
