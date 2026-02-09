import mongoose from 'mongoose';

const WorkSettingsSchema = new mongoose.Schema({
    // Organization-wide Shift Settings
    shiftStartTime: {
        type: String,
        required: true,
        default: '09:00', // 24-hour format HH:mm
        validate: {
            validator: (v: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
            message: 'Shift start time must be in HH:mm format'
        }
    },
    gracePeriodMinutes: {
        type: Number,
        required: true,
        default: 60, // 1 hour grace period
        min: 0
    },
    // Weekly Offs (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    weeklyOffs: {
        type: [Number],
        default: [0], // Default Sunday off
        validate: {
            validator: (v: number[]) => v.every(n => n >= 0 && n <= 6),
            message: 'Weekly offs must be between 0 (Sunday) and 6 (Saturday)'
        }
    },
    // Meta
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Ensure it's a singleton (conceptually) - we'll likely strict finding the first document
export default mongoose.models.WorkSettings || mongoose.model('WorkSettings', WorkSettingsSchema);
