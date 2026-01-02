const baseUrl = 'http://localhost:3000';

async function testAPI() {
    console.log('\\n🧪 E2E API TESTING - CRM SYSTEM\\n');
    console.log('='.repeat(60));

    let passed = 0, failed = 0;

    // Helper function
    async function test(name, fn) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   Error: ${error.message}`);
            failed++;
        }
    }

    // Store cookies
    let adminCookie = '';

    // PHASE 1: Authentication
    console.log('\\n📋 PHASE 1: Authentication & RBAC');

    await test('Admin can login', async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@promptix.com',
                password: 'admin123'
            })
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        adminCookie = res.headers.get('set-cookie') || '';
        if (!adminCookie) throw new Error('No cookie received');
    });

    await test('Invalid credentials rejected', async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@promptix.com',
                password: 'wrongpassword'
            })
        });

        if (res.status === 200) throw new Error('Invalid login succeeded!');
    });

    await test('Admin can access /api/auth/me', async () => {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.user || data.user.role !== 'ADMIN') {
            throw new Error('User data incorrect');
        }
    });

    await test('Logout clears session', async () => {
        const res = await fetch(`${baseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const cookie = res.headers.get('set-cookie');
        if (!cookie || !cookie.includes('expires=Thu, 01 Jan 1970')) {
            throw new Error('Cookie not properly cleared');
        }
    });

    // Re-login for remaining tests
    const relogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@promptix.com',
            password: 'admin123'
        })
    });
    adminCookie = relogin.headers.get('set-cookie') || '';

    // PHASE 2: User Management
    console.log('\\n📋 PHASE 2: User Management');

    await test('Admin can fetch users', async () => {
        const res = await fetch(`${baseUrl}/api/admin/users`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.users || !Array.isArray(data.users)) {
            throw new Error('Users data invalid');
        }
    });

    // PHASE 3: Attendance
    console.log('\\n📋 PHASE 3: Attendance');

    await test('Admin can fetch attendance records', async () => {
        const res = await fetch(`${baseUrl}/api/admin/attendance`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.attendance)) {
            throw new Error('Attendance data invalid');
        }
    });

    // PHASE 4: Leaves
    console.log('\\n📋 PHASE 4: Leave Management');

    await test('Admin can fetch leave requests', async () => {
        const res = await fetch(`${baseUrl}/api/admin/leaves`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.leaves)) {
            throw new Error('Leaves data invalid');
        }
    });

    // PHASE 5: Courses
    console.log('\\n📋 PHASE 5: Courses');

    await test('Can fetch courses', async () => {
        const res = await fetch(`${baseUrl}/api/courses`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.courses) {
            throw new Error('Courses data invalid');
        }
    });

    // PHASE 6: Events
    console.log('\\n📋 PHASE 6: Events');

    await test('Can fetch events', async () => {
        const res = await fetch(`${baseUrl}/api/events`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!data.events) {
            throw new Error('Events data invalid');
        }
    });

    // PHASE 7: Notifications
    console.log('\\n📋 PHASE 7: Notifications');

    await test('Can fetch notifications', async () => {
        const res = await fetch(`${baseUrl}/api/notifications`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.notifications)) {
            throw new Error('Notifications data invalid');
        }
        console.log(`   Found ${data.notifications.length} notifications (${data.unreadCount} unread)`);
    });

    // PHASE 8: Audit Logs
    console.log('\\n📋 PHASE 8: Audit Logs');

    await test('Admin can fetch audit logs', async () => {
        const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.logs)) {
            throw new Error('Audit logs data invalid');
        }
        console.log(`   Found ${data.logs.length} audit log entries`);
    });

    // PHASE 9: Analytics
    console.log('\\n📋 PHASE 9: Analytics');

    await test('Admin can fetch statistics', async () => {
        const res = await fetch(`${baseUrl}/api/admin/stats`, {
            headers: { 'Cookie': adminCookie }
        });

        if (res.status !== 200) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        if (typeof data.employees === 'undefined') {
            throw new Error('Stats data invalid');
        }
        console.log(`   Stats: ${data.employees} employees, ${data.students} students, ${data.events} events`);
    });

    // PHASE 10: RBAC Enforcement
    console.log('\\n📋 PHASE 10: RBAC Enforcement');

    await test('Unauthenticated cannot access protected routes', async () => {
        const res = await fetch(`${baseUrl}/api/admin/stats`);

        if (res.status === 200) throw new Error('Unauth access succeeded!');
    });

    // SUMMARY
    console.log('\\n' + '='.repeat(60));
    console.log(`\\n📊 TEST RESULTS:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('\\n' + '='.repeat(60));

    if (failed === 0) {
        console.log('\\n🎉 ALL TESTS PASSED! System is working correctly.\\n');
    } else {
        console.log(`\\n⚠️  ${failed} test(s) failed. Please review errors above.\\n`);
    }
}

testAPI().catch(console.error);
