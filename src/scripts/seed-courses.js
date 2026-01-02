const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// 1. Read .env.local manually
const envPath = path.join(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const index = line.indexOf('=');
    if (index !== -1) {
        const key = line.substring(0, index).trim();
        const value = line.substring(index + 1).trim();
        // Remove quotes if present
        envVars[key] = value.replace(/^"|"$/g, '');
    }
});

const MONGODB_URI = envVars['MONGODB_URI'];
if (!MONGODB_URI) { console.error('MONGODB_URI not found'); process.exit(1); }

// 2. Data
const courses = [
    // AI & Data
    { title: "Artificial Intelligence (AI)", category: "AI & Data" },
    { title: "Machine Learning (ML)", category: "AI & Data" },
    { title: "Deep Learning (DL)", category: "AI & Data" },
    { title: "Natural Language Processing (NLP)", category: "AI & Data" },
    { title: "AI Automation & Workflow", category: "AI & Data" },
    { title: "AI Industry Tools", category: "AI & Data" },
    { title: "Data Analyst", category: "AI & Data" },
    { title: "Data Science", category: "AI & Data" },
    { title: "Business Analyst", category: "AI & Data" },
    // Software
    { title: "Full Stack Development", category: "Software" },
    { title: "Frontend Development", category: "Software" },
    { title: "Backend Development", category: "Software" },
    { title: "Website Development & Deployment (Vercel, Hostinger)", category: "Software" },
    { title: "API Development (Postman)", category: "Software" },
    { title: "Java Programming", category: "Software" },
    { title: "Python Programming", category: "Software" },
    { title: "Flask & Django", category: "Software" },
    // Design
    { title: "UI / UX & Product Design", category: "Design" },
    { title: "Video Editing", category: "Design" },
    { title: "Content Creation & Communication", category: "Design" },
    // Marketing
    { title: "Digital Marketing, SEO & Growth", category: "Marketing" },
    // Quality
    { title: "QA (Quality Assurance)", category: "Quality" },
    { title: "Testing & Automation (Selenium)", category: "Quality" },
    // Cloud
    { title: "Cyber Security", category: "Cloud" },
    { title: "Cloud, DevOps & Automation", category: "Cloud" },
    { title: "RPA & Automation", category: "Cloud" }
];

async function seed() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);

        // Define generic Schema for script usage to avoid loading app code which might have issues
        // Course Schema (Simplified)
        const CourseSchema = new mongoose.Schema({
            title: String,
            description: String,
            category: String,
            duration: String,
            status: String,
            createdBy: mongoose.Schema.Types.ObjectId,
            createdAt: Date
        }, { strict: false });
        const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

        // User Schema (Simplified)
        const UserSchema = new mongoose.Schema({ email: String }, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Find Admin
        const adminEmail = 'admin@promptix.com';
        const admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.error(`Admin user ${adminEmail} not found! Cannot assign createdBy.`);
            // Try fallback? No, must have admin.
            // Check if ANY admin exists?
            const anyAdmin = await User.findOne({ role: 'ADMIN' });
            if (anyAdmin) {
                console.log(`Using alternative admin: ${anyAdmin.email}`);
            } else {
                console.error('No admin found at all');
                process.exit(1);
            }
        }

        const adminId = admin._id;
        console.log(`Using Admin ID: ${adminId}`);

        console.log(`Seeding ${courses.length} courses...`);

        for (const c of courses) {
            await Course.findOneAndUpdate(
                { title: c.title },
                {
                    $set: {
                        title: c.title,
                        category: c.category,
                        description: `Comprehensive course on ${c.title} covering key concepts, tools, and practical industry applications.`,
                        duration: "3 Months", // Default
                        status: "Active",
                        createdBy: adminId
                    },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true, new: true }
            );
            process.stdout.write('.');
        }

        console.log('\n✅ Seeding Complete.');
        await mongoose.disconnect();

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
