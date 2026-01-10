// createAdmin.js
import 'dotenv/config'; // loads .env automatically
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js'; // your admin model

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barbershop';
mongoose.connect(DB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createAdmin() {
  try {
    const email = 'admin2@barbershop.com';
    const password = 'Admin2@123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('⚠ Admin already exists');
      process.exit(0);
    }

    const admin = new Admin({
      email,
      password: hashedPassword,
      role: 'superadmin'
    });

    await admin.save();
    console.log('✅ Superadmin created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
