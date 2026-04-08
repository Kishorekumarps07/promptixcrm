const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const EMAILS = [
    'pavankumar15304@gmail.com'
];

const START_DATE = new Date('2026-03-27T00:00:00Z');
const END_DATE = new Date('2026-04-08T00:00:00Z');

function getRandomTime(date, startHour, endHour, startMin = 0, endMin = 59) {
    const newDate = new Date(date);
    
    // Total minutes range
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    
    const randomTotal = Math.floor(Math.random() * (endTotal - startTotal + 1)) + startTotal;
    
    const hour = Math.floor(randomTotal / 60);
    const minute = randomTotal % 60;
    
    newDate.setHours(hour);
    newDate.setMinutes(minute);
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

            console.log(`Processing user: ${user.email} (${user._id})`);

            let current = new Date(START_DATE);
            while (current <= END_DATE) {
                const dateKey = new Date(current);
                dateKey.setUTCHours(0, 0, 0, 0);

                // Skip Sundays (0 = Sunday)
                if (dateKey.getUTCDay() === 0) {
                    current.setDate(current.getDate() + 1);
                    continue;
                }

                // Check-in: 10:00 - 11:00
                const checkIn = getRandomTime(dateKey, 10, 11, 0, 0);
                // Check-out: 18:30 - 19:30
                const checkOut = getRandomTime(dateKey, 18, 19, 30, 30);

                await Attendance.findOneAndUpdate(
                    { userId: user._id, date: dateKey },
                    {
                        status: 'Approved',
                        type: 'Present',
                        checkIn: checkIn,
                        checkOut: checkOut,
                        isLate: checkIn.getHours() > 10 || (checkIn.getHours() === 10 && checkIn.getMinutes() > 15),
                        lateMinutes: Math.max(0, (checkIn.getHours() * 60 + checkIn.getMinutes()) - (10 * 60 + 15))
                    },
                    { upsert: true, new: true }
                );

                current.setDate(current.getDate() + 1);
            }
        }

        console.log('Bulk backfill for Pavan Kumar P completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Backfill error:', err);
        process.exit(1);
    }
}

backfill();
