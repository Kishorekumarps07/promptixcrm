
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function auditDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected successfully.\n');

        const db = mongoose.connection.db!;
        const collections = await db.listCollections().toArray();

        console.log('--- Database Collections Audit ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);

            // Sample a document to check structure
            if (count > 0) {
                const sample = await db.collection(col.name).findOne({});
                console.log(`  Sample ID: ${sample?._id}`);
            }
        }

        console.log('\n--- Data Integrity Sanity Check ---');

        // Check for Users
        const usersCount = await db.collection('users').countDocuments();
        if (usersCount === 0) {
            console.warn('⚠️ Warning: No users found in database.');
        } else {
            const adminCount = await db.collection('users').countDocuments({ role: 'ADMIN' });
            console.log(`✅ Users: ${usersCount} total (${adminCount} Admins)`);
        }

        // Check for Events
        const eventsCount = await db.collection('events').countDocuments();
        console.log(`✅ Events: ${eventsCount}`);

        // Check for Attendance
        const attendanceCount = await db.collection('attendances').countDocuments();
        console.log(`✅ Attendance Records: ${attendanceCount}`);

        await mongoose.disconnect();
        console.log('\nAudit complete. Disconnected.');
    } catch (error) {
        console.error('Audit failed:', error);
        process.exit(1);
    }
}

auditDatabase();
