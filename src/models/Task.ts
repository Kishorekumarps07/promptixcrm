import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        goalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal',
            required: false,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        dueDate: {
            type: Date,
            required: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });

// Pre-save hook to handle status/progress/completedAt syncing
TaskSchema.pre('save', async function () {
    // If status is "Completed", ensure progress is 100% and completedAt is set
    if (this.status === 'Completed') {
        this.progressPercentage = 100;
        if (!this.completedAt) {
            this.completedAt = new Date();
        }
    } else {
        // If status is changed back from "Completed", clear completedAt
        if (this.isModified('status')) {
            this.completedAt = null;
        }
    }
});

// Prevent compilation errors during hot reload
if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Task) {
        delete mongoose.models.Task;
    }
}

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
