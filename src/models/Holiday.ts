import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['National', 'State', 'Regional', 'Custom'],
        default: 'Custom'
    },
    region: {
        type: String,
        required: false,
        default: 'All India'
    },
    isGovernmentHoliday: {
        type: Boolean,
        default: false
    },
    department: {
        type: String,
        default: 'All' // Can be 'All' or specific departments if needed later
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Note: Removed unique index on date to allow multiple holidays on the same date
// (e.g., National holiday + State holiday on April 14)
// HolidaySchema.index({ date: 1 }, { unique: true });

export default mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);
