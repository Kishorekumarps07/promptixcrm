const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'test-output.log');
fs.writeFileSync(logFile, 'Starting Test...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

function error(msg) {
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    console.error(msg);
}

const BASE_URL = 'http://localhost:3000';

async function testOnboarding() {
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
        if (!uri) throw new Error('MONGODB_URI not found');

        log('Connecting to DB...');
        await mongoose.connect(uri);

        const User = mongoose.model('User', new mongoose.Schema({
            email: String, role: String, isOnboardingCompleted: Boolean, name: String, password: String
        }, { strict: false }));

        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));
        const StudentOnboarding = mongoose.models.StudentOnboarding || mongoose.model('StudentOnboarding', new mongoose.Schema({ studentId: mongoose.Types.ObjectId }, { strict: false }));

        const testEmail = `onboard_test_${Date.now()}@test.com`;
        const testPass = 'password123';
        // Need bcrypt to create valid user for login
        // If bcrypt not available, I can't login easily.
        // Assuming bcryptjs is installed as it is in package.json
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(testPass, 10);

        const student = await User.create({
            name: 'Onboarding Tester',
            email: testEmail,
            password: hashedPassword,
            role: 'STUDENT',
            isOnboardingCompleted: false
        });
        log('Created fresh student: ' + testEmail);

        const course = await Course.findOne({ status: 'Active' });
        if (!course) throw new Error('No active course found');
        log('Selected Course: ' + course.title);

        // 2. Login to get Cookie
        log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPass })
        });

        if (!loginRes.ok) {
            const txt = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} - ${txt}`);
        }
        const cookie = loginRes.headers.get('set-cookie');
        log('Logged in, got cookie');

        // 3. Submit Onboarding with CourseID
        log('Submitting Onboarding...');
        const onboardRes = await fetch(`${BASE_URL}/api/student/onboarding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                personalDetails: { phone: '9999999999' },
                educationDetails: { collegeName: 'Test College' },
                feesDetails: { totalFees: 50000 },
                courseId: course._id.toString()
            })
        });

        const data = await onboardRes.json();
        log('Onboarding Response: ' + JSON.stringify(data));

        if (!onboardRes.ok) throw new Error('Onboarding API failed: ' + data.message);

        // 4. Verify DB State
        const enrollment = await CourseEnrollment.findOne({ studentId: student._id });
        if (!enrollment) throw new Error('Enrollment NOT created!');
        if (enrollment.courseId.toString() !== course._id.toString()) throw new Error('Wrong course enrolled');
        if (enrollment.status !== 'Ongoing') throw new Error('Enrollment status incorrect');
        log('✅ Course Enrollment Verified');

        const updatedStudent = await User.findById(student._id);
        if (!updatedStudent.isOnboardingCompleted) throw new Error('User not marked as onboarded');
        log('✅ User Onboarding Flag Verified');

        log('✅ TEST PASSED');

        // Cleanup
        log('Cleaning up...');
        await User.deleteOne({ _id: student._id });
        await CourseEnrollment.deleteMany({ studentId: student._id });
        await StudentOnboarding.deleteOne({ studentId: student._id });

    } catch (e) {
        error('######## TEST FAILED ########');
        error('Error Message: ' + e.message);
        error('Stack: ' + e.stack);
        if (e.cause) error('Cause: ' + e.cause);
    } finally {
        await mongoose.disconnect();
    }
}

testOnboarding();
