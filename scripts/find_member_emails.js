const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function findUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const names = ['DEVESH P A', 'Kishore kumar p s', 'Kamalesh kumar M S', 'pavan kumar p'];
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
        
        const users = await User.find({ 
            name: { $in: names.map(n => new RegExp('^' + n + '$', 'i')) } 
        });
        
        console.log(JSON.stringify(users.map(u => ({ name: u.name, email: u.email })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUsers();
