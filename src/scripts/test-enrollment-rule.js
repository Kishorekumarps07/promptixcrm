const mongoose = require('mongoose');

// Simplified Schemas for Script
const UserSchema = new mongoose.Schema({ email: String, role: String }, { strict: false });
const CourseSchema = new mongoose.Schema({ title: String, status: String }, { strict: false });
const CourseEnrollmentSchema = new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
    status: String
}, { strict: false });

// Add the index definition to test strictness (Mongoose syncs this)
CourseEnrollmentSchema.index({ studentId: 1 }, { unique: true, partialFilterExpression: { status: 'Ongoing' } });

const MONGODB_URI = 'mongodb+srv://infopromptix_db_user:SvexHPm0LJcTdwo5@promptixadmin.vajvprn.mongodb.net/?appName=Promptixadmin';

async function testConstraint() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
        const CourseEnrollment = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', CourseEnrollmentSchema);

        // Ensure indexes are built
        await CourseEnrollment.syncIndexes();
        console.log('Indexes synced');

        // 1. Setup Data
        // Create dummy student
        const studentEmail = 'constraint_test_student@test.com';
        await User.deleteOne({ email: studentEmail });
        const student = await User.create({ email: studentEmail, role: 'STUDENT' });
        console.log('Created Student:', student._id);

        // Find 2 courses
        const courses = await Course.find({ status: 'Active' }).limit(2);
        if (courses.length < 2) throw new Error('Need 2 active courses');
        const [c1, c2] = courses;

        // Clean previous enrollments
        await CourseEnrollment.deleteMany({ studentId: student._id });

        // 2. Test Success Case (First Enrollment)
        console.log('Enrolling in Course 1...');
        await CourseEnrollment.create({
            studentId: student._id,
            courseId: c1._id,
            status: 'Ongoing'
        });
        console.log('✅ Enrollment 1 Success');

        // 3. Test Failure Case (Duplicate Ongoing)
        console.log('Enrolling in Course 2 (Should Fail)...');
        try {
            await CourseEnrollment.create({
                studentId: student._id,
                courseId: c2._id,
                status: 'Ongoing'
            });
            console.error('❌ Error: Duplicate Enrollment Allowed!');
        } catch (e) {
            if (e.code === 11000) {
                console.log('✅ Duplicate Enrollment Blocked (Duplicate Key Error)');
            } else {
                console.error('❌ Unexpected Error:', e);
            }
        }

        // 4. Test Update Logic (Deactivate then Enroll)
        console.log('Simulating Admin Update (Deactivate C1 -> Enroll C2)...');
        // Transaction style or sequential
        await CourseEnrollment.updateOne(
            { studentId: student._id, status: 'Ongoing' },
            { $set: { status: 'Inactive' } }
        );
        await CourseEnrollment.create({
            studentId: student._id,
            courseId: c2._id,
            status: 'Ongoing'
        });
        console.log('✅ Admin Update Logic Success');

        // Verify End State
        const active = await CourseEnrollment.find({ studentId: student._id, status: 'Ongoing' });
        const history = await CourseEnrollment.find({ studentId: student._id });

        console.log(`Active Count: ${active.length} (Expected: 1)`);
        console.log(`Total History: ${history.length} (Expected: 2)`);

        // Clean up
        await User.deleteOne({ _id: student._id });
        await CourseEnrollment.deleteMany({ studentId: student._id });

        await mongoose.disconnect();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testConstraint();
