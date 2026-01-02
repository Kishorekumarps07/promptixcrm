import mongoose from 'mongoose';

const CourseEnrollmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Inactive'],
        default: 'Ongoing'
    }
});

// Compound index to prevent duplicate enrollments
CourseEnrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

// Enforce single active (Ongoing) course per student
CourseEnrollmentSchema.index(
    { studentId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'Ongoing' }
    }
);

// Force recompilation in dev
if (process.env.NODE_ENV !== 'production' && mongoose.models.CourseEnrollment) {
    delete mongoose.models.CourseEnrollment;
}

export default mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', CourseEnrollmentSchema);
