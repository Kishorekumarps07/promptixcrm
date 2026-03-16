const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const EMAILS = ['2kamalesh0809@gmail.com', 'Kishore3kumar4@gmail.com'];
const START_DATE = new Date('2026-02-27T00:00:00Z');
const END_DATE = new Date('2026-03-16T00:00:00Z');

function getRandomTime(date, hour, minute, rangeMinutes = 15) {
    const newDate = new Date(date);
    const offset = Math.floor(Math.random() * (rangeMinutes * 2 + 1)) - rangeMinutes;
    newDate.setHours(hour);
    newDate.setMinutes(minute + offset);
    newDate.setSeconds(Math.floor(Math.random() * 60));
    return newDate;
}

async function backfill() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String }));
        const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            date: Date,
            status: String,
            checkIn: Date,
            checkOut: Date,
            type: String
        }, { strict: false }), 'attendances');

        for (const email of EMAILS) {
            const user = await User.findOne({ email });
            if (!user) {
                console.warn(`User ${email} not found, skipping.`);
                continue;
            }

            console.log(`Processing user: ${email} (${user._id})`);

            let current = new Date(START_DATE);
            while (current <= END_DATE) {
                // Skip future dates
                if (current > new Date()) break;

                const dateKey = new Date(current);
                dateKey.setUTCHours(0, 0, 0, 0);

                // Skip Sundays (0 = Sunday)
                if (dateKey.getUTCDay() === 0) {
                    current.setDate(current.getDate() + 1);
                    continue;
                }

                const checkIn = getRandomTime(dateKey, 10, 45, 10);
                const checkOut = getRandomTime(dateKey, 18, 30, 10);

                await Attendance.findOneAndUpdate(
                    { userId: user._id, date: dateKey },
                    {
                        status: 'Approved',
                        type: 'Present',
                        checkIn: checkIn,
                        checkOut: checkOut,
                        isLate: false,
                        lateMinutes: 0
                    },
                    { upsert: true, new: true }
                );

                current.setDate(current.getDate() + 1);
            }
        }

        console.log('Bulk backfill completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Backfill error:', err);
        process.exit(1);
    }
}

backfill();
