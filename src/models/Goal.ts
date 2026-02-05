import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema(
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
        period: {
            type: String,
            required: true, // e.g. "Q1 2026", "2026 Annual"
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed'],
            default: 'Not Started',
        },
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for linked tasks
GoalSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'goalId',
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
