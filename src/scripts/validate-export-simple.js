const baseUrl = 'http://localhost:3000';

async function validate() {
    console.log('--- Validating Student Export API ---\n');

    // 1. ANONYMOUS ACCESS TEST
    console.log('1. Testing Anonymous Access (Should Fail)...');
    const anonRes = await fetch(`${baseUrl}/api/admin/students/export?format=csv`, {
        redirect: 'manual'
    });
    console.log(`   Status: ${anonRes.status}`);
    if (anonRes.status === 401 || anonRes.status === 403 || anonRes.status === 307 || anonRes.status === 302) {
        console.log('   ✅ Anonymous access blocked correctly.');
    } else {
        console.error('   ❌ Anonymous access allowed or unexpected status:', anonRes.status);
    }

    // 2. ADMIN ACCESS TEST
    console.log('\n2. Testing Admin Access (Should Succeed)...');

    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@promptix.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        console.error('   ❌ Admin login failed');
        return;
    }

    // Extract Cookie
    const cookieHeader = loginRes.headers.get('set-cookie');
    if (!cookieHeader) {
        console.error('   ❌ No cookie received on login');
        return;
    }
    const token = cookieHeader.split(';')[0];

    // Request Export
    const exportRes = await fetch(`${baseUrl}/api/admin/students/export?format=csv&status=Active`, {
        headers: { 'Cookie': token }
    });

    console.log(`   Status: ${exportRes.status}`);
    const contentType = exportRes.headers.get('content-type');
    console.log(`   Content-Type: ${contentType}`);

    if (exportRes.status === 200 && contentType.includes('csv')) {
        const text = await exportRes.text();
        // Check for expected headers
        if (text.includes('Student ID') && text.includes('Full Name') && text.includes('Email')) {
            console.log('   ✅ Valid CSV received with correct headers.');
            if (!text.toLowerCase().includes('password')) {
                console.log('   ✅ No password field found (Security Check).');
            } else {
                console.error('   ❌ Password field detected!');
            }
        } else {
            console.error('   ❌ CSV content mismatch. Received:\n', text.substring(0, 200));
        }
    } else {
        console.error('   ❌ Export request failed.');
        // Added logging here
        const body = await exportRes.text();
        console.error('   Response Body:', body);
    }
}

validate().catch(err => console.error(err));
