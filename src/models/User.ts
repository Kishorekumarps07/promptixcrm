import mongoose from 'mongoose';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'STUDENT';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this user.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    phone: {
        type: String,
        default: '',
    },
    photo: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for this user.'],
    },
    role: {
        type: String,
        enum: ['ADMIN', 'EMPLOYEE', 'STUDENT'],
        default: 'STUDENT',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Student specific fields
    course: String,
    internshipStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
    },
    projectTitle: String,
    startDate: Date,
    endDate: Date,
    projectFeedback: String,
    isOnboardingCompleted: {
        type: Boolean,
        default: false
    },
    onboardingCompletedAt: {
        type: Date
    },
    forcePasswordChange: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for performance
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ email: 1 }); // Already unique but good to be explicit if needed, though unique implies index

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
