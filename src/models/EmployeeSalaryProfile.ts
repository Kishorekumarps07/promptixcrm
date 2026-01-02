import mongoose from 'mongoose';

const EmployeeSalaryProfileSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    monthlySalary: {
        type: Number,
        required: true
    },
    // We store the effective date, usually start of current month or joining date
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Virtual for perDayRate - calculated on the fly based on CURRENT month if needed, 
// but mostly handled by service logic. 
// We generally don't store "perDayRate" permanently because working days change every month.

export default mongoose.models.EmployeeSalaryProfile || mongoose.model('EmployeeSalaryProfile', EmployeeSalaryProfileSchema);
