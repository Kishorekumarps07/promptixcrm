const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
// const { StudentExportService } = require('../lib/student-export-service'); // Removed invalid import

// We need to shim StudentExportService imports because it uses @ alias which node doesn't understand 
// directly without ts-node or alias config. 
// BUT simpler: We can just use a full integration test calling the API? 
// No, simpler to test service if we can.
// Actually, since this is a compiled Next.js app, running TS files directly is hard.
// I will test via API call like previous tests.

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'test-output-export.log');
fs.writeFileSync(logFile, 'Starting Export Test...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

function error(msg) {
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    console.error(msg);
}

const BASE_URL = 'http://localhost:3000';

async function testExport() {
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
            email: String, role: String, isOnboardingCompleted: Boolean, name: String
        }, { strict: false }));

        // 1. Create a Test Student (Onboarded)
        const testEmail = `export_test_${Date.now()}@test.com`;
        const student = await User.create({
            name: 'Export Tester',
            email: testEmail,
            role: 'STUDENT',
            status: 'Active',
            isOnboardingCompleted: true
        });
        log('Created Student: ' + student._id);

        // 2. Enroll in Course
        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String, category: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));

        const course = await Course.findOne({ status: 'Active' });
        if (!course) throw new Error('No active course');
        log('Selected Course: ' + course.title);

        await CourseEnrollment.create({
            studentId: student._id,
            courseId: course._id,
            status: 'Ongoing'
        });

        // 3. Admin Login for Token
        // Assuming I can generate one
        const { SignJWT } = require('jose');
        const secret = new TextEncoder().encode(envVars['JWT_SECRET'] || 'fallback-secret');
        const token = await new SignJWT({ userId: new mongoose.Types.ObjectId().toString(), role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);
        const cookie = `token=${token}`;

        // 4. Call Export API
        log('Calling Export API...');
        const res = await fetch(`${BASE_URL}/api/admin/students/export?format=csv&status=Active`, {
            headers: { 'Cookie': cookie }
        });

        if (!res.ok) throw new Error(`Export failed: ${res.status}`);

        const csvText = await res.text();
        log('CSV Received, length: ' + csvText.length);

        // 5. Verify Content
        // Check header
        if (!csvText.includes('Course Name,Course Category')) {
            throw new Error('CSV Headers missing new fields!');
        }

        // Check data row
        // Should contain student email and course title
        if (!csvText.includes(testEmail)) throw new Error('Student email not found in CSV');
        if (!csvText.includes(course.title)) throw new Error('Course Title not found in CSV');
        if (!csvText.includes(course.category)) throw new Error('Course Category not found in CSV');

        log('✅ CSV Content Verified: Headers and Data present');

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

testExport();
