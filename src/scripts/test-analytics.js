const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'test-output-analytics.log');
fs.writeFileSync(logFile, 'Starting Analytics Test...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

function error(msg) {
    fs.appendFileSync(logFile, 'ERROR: ' + msg + '\n');
    console.error(msg);
}

const BASE_URL = 'http://localhost:3000';

async function testAnalytics() {
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
            email: String, role: String, isOnboardingCompleted: Boolean, name: String
        }, { strict: false }));
        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));

        // 1. Setup Test Data
        const testEmail = `analytics_test_${Date.now()}@test.com`;
        const student = await User.create({
            name: 'Analytics Tester',
            email: testEmail,
            role: 'STUDENT',
            status: 'Active'
        });

        const course = await Course.findOne({ status: 'Active' });
        if (!course) throw new Error('No active course');

        await CourseEnrollment.create({
            studentId: student._id,
            courseId: course._id,
            status: 'Ongoing'
        });
        log('Created Test Enrollment for: ' + course.title);

        // 2. Admin Token
        const { SignJWT } = require('jose');
        const secret = new TextEncoder().encode(envVars['JWT_SECRET'] || 'fallback-secret');
        const token = await new SignJWT({ userId: new mongoose.Types.ObjectId().toString(), role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);
        const cookie = `token=${token}`;

        // 3. Call API
        log('Calling Stats API...');
        const res = await fetch(`${BASE_URL}/api/admin/stats`, {
            headers: { 'Cookie': cookie }
        });

        if (!res.ok) throw new Error(`API Failed: ${res.status}`);
        const data = await res.json();
        log('API Response received');

        // 4. Verify enrollmentStats
        if (!data.enrollmentStats || !Array.isArray(data.enrollmentStats)) {
            throw new Error('enrollmentStats missing or not an array');
        }

        const stat = data.enrollmentStats.find(s => s.title === course.title);
        if (!stat) throw new Error(`Stat for course "${course.title}" not found`);
        if (stat.count < 1) throw new Error(`Count for "${course.title}" is ${stat.count}, expected >= 1`);

        log(`✅ Validated Enrollment Stat: ${stat.title} has ${stat.count} students`);
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

testAnalytics();
