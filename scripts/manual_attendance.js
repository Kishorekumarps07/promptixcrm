const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

/**
 * MANUAL ATTENDANCE UPDATE SCRIPT
 * 
 * Usage: node scripts/manual_attendance.js <email> <date_YYYY-MM-DD> <status>
 * Example: node scripts/manual_attendance.js user@example.com 2026-03-10 Approved
 */

async function updateAttendance() {
    const [,, email, dateStr, status] = process.argv;

    if (!email || !dateStr || !status) {
        console.error('Usage: node scripts/manual_attendance.js <email> <date_YYYY-MM-DD> <status>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        // Get Models (Directly to avoid Next.js import issues in scripts)
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String }));
        const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            date: Date,
            status: String
        }, { strict: false }), 'attendances');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        const date = new Date(dateStr);
        date.setUTCHours(0, 0, 0, 0);

        const result = await Attendance.findOneAndUpdate(
            { userId: user._id, date: date },
            { status: status },
            { upsert: true, new: true }
        );

        console.log('Successfully updated attendance:');
        console.log(`User: ${email} (${user._id})`);
        console.log(`Date: ${date.toISOString().split('T')[0]}`);
        console.log(`New Status: ${result.status}`);

        process.exit(0);
    } catch (err) {
        console.error('Error updating attendance:', err);
        process.exit(1);
    }
}

updateAttendance();
