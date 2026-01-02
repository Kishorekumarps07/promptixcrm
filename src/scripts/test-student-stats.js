const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'test-output-stats.log');
fs.writeFileSync(logFile, 'Starting Student Stats Test...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

function error(msg) {
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    console.error(msg);
}

const BASE_URL = 'http://localhost:3000';

async function testStudentStats() {
    try {
        log('Reading .env.local...');
        const envPath = path.join(__dirname, '../../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                const val = line.substring(index + 1).trim().replace(/^"|"$/g, '');
                envVars[key] = val;
            }
        });

        const uri = envVars['MONGODB_URI'];
        await mongoose.connect(uri);

        const User = mongoose.model('User', new mongoose.Schema({
            email: String, role: String, isOnboardingCompleted: Boolean, name: String, password: String
        }, { strict: false }));

        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String, category: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));

        // 1. Create a Test Student
        const testEmail = `stats_test_${Date.now()}@test.com`;
        const student = await User.create({
            name: 'Stats Tester',
            email: testEmail,
            role: 'STUDENT',
            status: 'Active',
            isOnboardingCompleted: true
        });
        log('Created Student: ' + student._id);

        // 2. Identify a Course
        const course = await Course.findOne({ status: 'Active' });
        if (!course) throw new Error('No active course found');
        log('Selected Course: ' + course.title);

        // 3. Create Enrollment (Ongoing)
        await CourseEnrollment.create({
            studentId: student._id,
            courseId: course._id,
            status: 'Ongoing'
        });
        log('Enrolled in course');

        // 4. Generate Token (Mock Login)
        const { SignJWT } = require('jose');
        const secret = new TextEncoder().encode(envVars['JWT_SECRET'] || 'fallback-secret');
        const token = await new SignJWT({
            userId: student._id.toString(),
            role: 'STUDENT',
            isOnboardingCompleted: true
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);

        const cookie = `token=${token}`;
        log('Generated Token');

        // 5. Fetch Stats
        log('Fetching Stats...');
        const res = await fetch(`${BASE_URL}/api/student/stats`, {
            method: 'GET',
            headers: { 'Cookie': cookie }
        });
        const data = await res.json();
        log('Stats Response: ' + JSON.stringify(data));

        if (!res.ok) throw new Error('Failed to fetch stats');

        // 6. Verify Program Field
        // Expected format: "Title (Category)"
        const expectedProgram = `${course.title} (${course.category})`;
        if (data.program !== expectedProgram) {
            throw new Error(`Program mismatch! Expected "${expectedProgram}", got "${data.program}"`);
        }
        log('✅ Program Verified: ' + data.program);

        log('✅ TEST PASSED');

        // Cleanup
        await User.deleteOne({ _id: student._id });
        await CourseEnrollment.deleteMany({ studentId: student._id });

    } catch (e) {
        error('######## TEST FAILED ########');
        error('Error Message: ' + e.message);
        error('Stack: ' + e.stack);
    } finally {
        await mongoose.disconnect();
    }
}

testStudentStats();
