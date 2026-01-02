import mongoose from 'mongoose';

const EventRegistrationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    attended: {
        type: Boolean,
        default: false,
    },
    feedback: {
        type: String,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
});

// One registration per user per event
EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.models.EventRegistration || mongoose.model('EventRegistration', EventRegistrationSchema);
