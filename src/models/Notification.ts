import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['TASK_ASSIGNED', 'GOAL_ASSIGNED', 'GENERAL'],
            default: 'GENERAL',
        },
        link: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of unread notifications
NotificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
