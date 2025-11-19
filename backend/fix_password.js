import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'mutheeswaran1424@gmail.com';
    const user = await User.findOne({ email });
    
    if (user) {
      // Update password to plain text and userType to candidate
      user.password = '123456';
      user.userType = 'candidate';
      user.name = 'Mutheeswaran';
      await user.save();
      
      console.log('✅ Updated user:');
      console.log('Email:', user.email);
      console.log('Password:', user.password);
      console.log('UserType:', user.userType);
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

fixPassword();