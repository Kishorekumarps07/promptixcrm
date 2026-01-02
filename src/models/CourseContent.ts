import mongoose from 'mongoose';

const CourseContentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: false, index: true },
    title: { type: String, required: true },
    description: { type: String },
    fileType: { type: String, enum: ['image', 'video', 'pdf', 'docx'], required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
});

// Force recompilation in dev to prevent OverwriteModelError
if (process.env.NODE_ENV !== 'production' && mongoose.models.CourseContent) {
    delete mongoose.models.CourseContent;
}

export default mongoose.models.CourseContent || mongoose.model('CourseContent', CourseContentSchema);
