import mongoose from 'mongoose';

const StudentOnboardingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalDetails: {
        dateOfBirth: Date,
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        phone: { type: String, required: true },
        address: String
    },
    educationDetails: {
        collegeName: String,
        degree: String,
        department: String,
        yearOfStudy: String,
        graduationYear: String
    },
    feesDetails: {
        totalFees: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        paymentMode: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'] },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Partial', 'Completed'],
            default: 'Pending'
        }
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    // Audit Metadata
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdatedAt: Date
});

// Force recompilation
if (process.env.NODE_ENV !== 'production' && mongoose.models.StudentOnboarding) {
    delete mongoose.models.StudentOnboarding;
}

export default mongoose.models.StudentOnboarding || mongoose.model('StudentOnboarding', StudentOnboardingSchema);
