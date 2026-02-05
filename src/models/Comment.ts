import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true
});

// Index for fast retrieval by task
CommentSchema.index({ taskId: 1, createdAt: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
