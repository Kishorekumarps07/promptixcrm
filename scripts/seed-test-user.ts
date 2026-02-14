import dbConnect from '../src/lib/db';
import User from '../src/models/User';
import { hashPassword } from '../src/lib/auth';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedTestAdmin() {
    try {
        await dbConnect();
        console.log('Connected to database...');

        const testEmail = 'test_admin@promptix.com';
        const existing = await User.findOne({ email: testEmail });

        if (existing) {
            console.log('Test admin already exists. Skipping...');
            process.exit(0);
        }

        const password = 'TestAdmin123!';
        const hashedPassword = await hashPassword(password);

        await User.create({
            name: 'Test Admin (Automation)',
            email: testEmail,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'Active'
        });

        console.log('✅ Test Admin created successfully!');
        console.log(`Email: ${testEmail}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed test admin:', error);
        process.exit(1);
    }
}

seedTestAdmin();
