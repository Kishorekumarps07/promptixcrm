const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const EMAILS = ['2kamalesh0809@gmail.com', 'Kishore3kumar4@gmail.com'];
// Sundays in March 2026: 1, 8, 15, 22, 29
const SUNDAYS = ['2026-03-01', '2026-03-08', '2026-03-15'];

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String }));
        const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            date: Date
        }, { strict: false }), 'attendances');

        for (const email of EMAILS) {
            const user = await User.findOne({ email });
            if (!user) continue;

            console.log(`Cleaning up Sundays for: ${email}`);

            for (const dateStr of SUNDAYS) {
                const date = new Date(dateStr);
                date.setUTCHours(0, 0, 0, 0);

                const result = await Attendance.deleteOne({ userId: user._id, date: date });
                if (result.deletedCount > 0) {
                    console.log(`  Removed record for ${dateStr}`);
                }
            }
        }

        console.log('Sunday cleanup completed.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup error:', err);
        process.exit(1);
    }
}

cleanup();
