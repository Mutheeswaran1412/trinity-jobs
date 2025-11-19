import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'mutheeswaran1424@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      console.log('✅ User found:');
      console.log('Email:', user.email);
      console.log('Password:', user.password);
      console.log('UserType:', user.userType);
      console.log('IsActive:', user.isActive);
      console.log('Name:', user.name);
    } else {
      console.log('❌ User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();