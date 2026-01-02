import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description']
    },
    category: {
        type: String,
        enum: ['Internship', 'Workshop', 'Bootcamp', 'AI & Data', 'Software', 'Design', 'Marketing', 'Quality', 'Cloud', 'Cyber Security'],
        required: [true, 'Please specify a category']
    },
    duration: {
        type: String,
        required: [true, 'Please provide duration (e.g., "3 Months")']
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

// Force recompilation in dev
if (process.env.NODE_ENV !== 'production' && mongoose.models.Course) {
    delete mongoose.models.Course;
}

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
