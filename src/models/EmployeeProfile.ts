import mongoose from 'mongoose';

const EmployeeProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
    },
    designation: {
        type: String,
    },
    dateOfJoining: {
        type: Date,
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Intern', 'Contract'],
    },
    department: {
        type: String,
        default: '',
    },
    // Personal Details
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    maritalStatus: { type: String, enum: ['Single', 'Married'] },
    currentAddress: { type: String },
    permanentAddress: { type: String },

    // Educational Details
    education: [{
        level: { type: String },
        institution: { type: String },
        year: { type: Number },
        score: { type: String }
    }],

    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relation: { type: String, default: '' }
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
EmployeeProfileSchema.pre('save', function (next: any) {
    this.updatedAt = new Date();
    next();
});

// Prevent compilation errors during hot reload
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.EmployeeProfile) {
        delete mongoose.models.EmployeeProfile;
    }
}
export default mongoose.models.EmployeeProfile || mongoose.model('EmployeeProfile', EmployeeProfileSchema);
