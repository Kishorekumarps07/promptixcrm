const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const logFile = path.join(__dirname, 'repro-output.log');
fs.writeFileSync(logFile, 'Starting Repro...\n');

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

const BASE_URL = 'http://localhost:3000';

async function repro() {
    try {
        log('Reading .env.local...');
        const envPath = path.join(__dirname, '../../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const index = line.indexOf('=');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                envVars[key] = line.substring(index + 1).trim().replace(/^"|"$/g, '');
            }
        });

        await mongoose.connect(envVars['MONGODB_URI']);

        const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String, name: String }, { strict: false }));
        const Course = mongoose.model('Course', new mongoose.Schema({ title: String, status: String }, { strict: false }));
        const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({ studentId: mongoose.Types.ObjectId, courseId: mongoose.Types.ObjectId, status: String }, { strict: false }));

        // 1. Create Student
        const student = await User.create({
            name: 'Repro Tester',
            email: `repro_${Date.now()}@test.com`,
            role: 'STUDENT'
        });

        // 2. Get 2 Active Courses
        const courses = await Course.find({ status: 'Active' }).limit(2);
        if (courses.length < 2) throw new Error('Need 2 active courses');
        const [c1, c2] = courses;

        // 3. Enroll in C1 manually (simulate existing state)
        await CourseEnrollment.create({
            studentId: student._id,
            courseId: c1._id,
            status: 'Ongoing'
        });
        log('Enrolled in C1: ' + c1.title);

        // 4. Try to Enroll in C2 via API (Should fail currently)
        const { SignJWT } = require('jose');
        const secret = new TextEncoder().encode(envVars['JWT_SECRET'] || 'fallback-secret');
        const token = await new SignJWT({ userId: new mongoose.Types.ObjectId().toString(), role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        log('Calling Assign API for C2...');
        const res = await fetch(`${BASE_URL}/api/courses/${c2._id}/assign-students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${token}`
            },
            body: JSON.stringify({ studentId: student._id })
        });

        log(`Response Status: ${res.status}`);
        const json = await res.json();
        log('Response Body: ' + JSON.stringify(json));

        if (res.status === 200) {
            log('✅ VERIFICATION SUCCESS: Got 200 OK');
            // Check if C1 is inactive?
            const oldEnrollment = await CourseEnrollment.findOne({ studentId: student._id, courseId: c1._id });
            if (oldEnrollment.status === 'Inactive') {
                log('✅ C1 Automatically Inactivated');
            } else {
                log('❌ C1 FAILED TO INACTIVATE');
            }
        } else {
            log('❌ VERIFICATION FAILED: Expected 200, got ' + res.status);
        }

        // Cleanup
        await User.deleteOne({ _id: student._id });
        await CourseEnrollment.deleteMany({ studentId: student._id });

    } catch (e) {
        log('ERROR: ' + e.message);
    } finally {
        await mongoose.disconnect();
    }
}

repro();
