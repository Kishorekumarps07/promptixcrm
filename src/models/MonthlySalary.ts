import mongoose from 'mongoose';

const MonthlySalarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number, // 0-11 for Jan-Dec
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    workingDays: {
        type: Number,
        required: true
    },
    presentDays: {
        type: Number,
        required: true,
        default: 0
    },
    halfDays: {
        type: Number,
        default: 0
    },
    unpaidLeaveDays: {
        type: Number,
        required: true,
        default: 0
    },
    paidLeaveDays: {
        type: Number,
        default: 0
    },
    perDayRate: {
        type: Number,
        required: true
    },
    calculatedSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Approved', 'Paid'],
        default: 'Draft'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: {
        type: Date
    },
    paymentMethod: {
        type: String
    },
    transactionReference: {
        type: String
    }
}, { timestamps: true });

// Prevent duplicate generation for same employee/month/year
MonthlySalarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.MonthlySalary || mongoose.model('MonthlySalary', MonthlySalarySchema);
