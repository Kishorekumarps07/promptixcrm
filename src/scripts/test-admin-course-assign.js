const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'test-output-admin.log');
fs.writeFileSync(logFile, 'Starting Admin Course Assignment Test...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

function error(msg) {
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    console.error(msg);
}

const BASE_URL = 'http://localhost:3000';

async function testAdminAssign() {
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
        log('Connecting to DB...');
        await mongoose.connect(uri);

        const User = mongoose.model('User', new mongoose.Schema({
            email: String, role: String, isOnboardingCompleted: Boolean, name: String, password: String
        }, { strict: false }));

        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));

        // 1. Create a Test Student
        const testEmail = `student_assign_test_${Date.now()}@test.com`;
        const student = await User.create({
            name: 'Assign Tester',
            email: testEmail,
            role: 'STUDENT',
            status: 'Active'
        });
        log('Created Student: ' + student._id);

        // 2. Identify 2 Courses
        const courses = await Course.find({ status: 'Active' }).limit(2);
        if (courses.length < 2) throw new Error('Need at least 2 active courses');
        const c1 = courses[0];
        const c2 = courses[1];
        log('Course 1: ' + c1.title);
        log('Course 2: ' + c2.title);

        // 3. Admin Login (We need an admin token)
        // I will simulate Admin Login
        const adminEmail = 'admin@promptix.com';
        const hashedPassword = '...'; // Mock login or real login?
        // Let's use real login if admin exists, else we can't test API easily without mocking token.
        // Assuming admin@promptix.com / admin123 exists from seed?
        // If not, I'll create a temp admin.

        const admin = await User.findOne({ email: adminEmail });
        // Assuming password is 'admin123' if seeded, or I can force one for testing?
        // Let's assume I can't easily login as admin without knowing password.
        // BUT I can generate a valid JWT token directly since I have access to JWT_SECRET in .env!

        // Generate Token
        const { SignJWT } = require('jose');
        const secret = new TextEncoder().encode(envVars['JWT_SECRET'] || 'fallback-secret');
        const token = await new SignJWT({ userId: admin?._id?.toString() || new mongoose.Types.ObjectId().toString(), role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);

        const cookie = `token=${token}`;
        log('Generated Admin Token');

        // 4. Assign Course 1 via API
        log('Assigning Course 1...');
        const res1 = await fetch(`${BASE_URL}/api/admin/users/${student._id}/course`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ courseId: c1._id })
        });
        const data1 = await res1.json();
        log('Response 1: ' + JSON.stringify(data1));
        if (!res1.ok) throw new Error('Failed to assign C1');

        // Verify C1 is Ongoing
        const e1 = await CourseEnrollment.findOne({ studentId: student._id, status: 'Ongoing' });
        if (!e1 || e1.courseId.toString() !== c1._id.toString()) throw new Error('C1 not active');
        log('✅ Course 1 Active Verified');

        // 5. Assign Course 2 via API (Should replace C1)
        log('Assigning Course 2...');
        const res2 = await fetch(`${BASE_URL}/api/admin/users/${student._id}/course`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ courseId: c2._id })
        });
        const data2 = await res2.json();
        log('Response 2: ' + JSON.stringify(data2));
        if (!res2.ok) throw new Error('Failed to assign C2');

        // Verify C2 is Ongoing
        const e2 = await CourseEnrollment.findOne({ studentId: student._id, status: 'Ongoing' });
        if (!e2 || e2.courseId.toString() !== c2._id.toString()) throw new Error('C2 not active');

        // Verify C1 is Inactive
        const oldE1 = await CourseEnrollment.findById(e1._id);
        if (oldE1.status !== 'Inactive') throw new Error('C1 was NOT deactivated!');
        log('✅ Course 2 Active, C1 Deactivated Verified');

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

testAdminAssign();
