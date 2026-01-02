import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a lesson title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient sorting/querying of lessons within a course
LessonSchema.index({ courseId: 1, order: 1 });

// Force recompilation in dev
if (process.env.NODE_ENV !== 'production' && mongoose.models.Lesson) {
    delete mongoose.models.Lesson;
}

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
