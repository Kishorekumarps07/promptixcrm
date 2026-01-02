import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ['Workshop', 'Bootcamp', 'Guest Lecture', 'Announcement'],
        default: 'Workshop',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Archived'],
        default: 'Upcoming',
    },
    isActive: { // Deprecated but kept for backward compat if needed, synced with status
        type: Boolean,
        default: true
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['EMPLOYEE', 'STUDENT', 'ADMIN'],
            required: true
        },
        status: {
            type: String,
            enum: ['Registered', 'Attended', 'Absent'],
            default: 'Registered'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        feedback: {
            rating: { type: Number, min: 1, max: 5 },
            comment: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for sorting upcoming events
EventSchema.index({ date: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
