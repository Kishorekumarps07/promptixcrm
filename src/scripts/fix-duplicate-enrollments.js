const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://infopromptix_db_user:SvexHPm0LJcTdwo5@promptixadmin.vajvprn.mongodb.net/?appName=Promptixadmin';

const CourseEnrollmentSchema = new mongoose.Schema({
    studentId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
    status: String,
    enrolledAt: Date
}, { strict: false });

async function fixDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const CourseEnrollment = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', CourseEnrollmentSchema);

        // Find students with duplicates
        const agg = await CourseEnrollment.aggregate([
            { $match: { status: 'Ongoing' } },
            { $group: { _id: '$studentId', count: { $sum: 1 }, enrollments: { $push: { id: '$_id', date: '$enrolledAt' } } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log(`Found ${agg.length} students with duplicate active enrollments.`);

        for (const record of agg) {
            const studentId = record._id;
            // Sort by date descending (newest first)
            const sorted = record.enrollments.sort((a, b) => new Date(b.date) - new Date(a.date));
            const keep = sorted[0];
            const toDeactivate = sorted.slice(1);

            console.log(`Student ${studentId}: Keeping ${keep.id} (${keep.date}), Deactivating ${toDeactivate.length} records.`);

            const idsToUpdate = toDeactivate.map(e => e.id);
            await CourseEnrollment.updateMany(
                { _id: { $in: idsToUpdate } },
                { $set: { status: 'Inactive' } }
            );
        }

        console.log('✅ Cleanup Complete. Indexes should build now.');

        // Attempt index sync
        await CourseEnrollment.syncIndexes();
        console.log('✅ Indexes Synced Successfully.');

        await mongoose.disconnect();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDuplicates();
