import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function deleteEmployers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.deleteMany({ userType: 'employer' });
    
    console.log(`🗑️  Deleted ${result.deletedCount} employer accounts`);
    
    const remainingUsers = await User.find({ userType: 'employer' });
    console.log(`📊 Remaining employers: ${remainingUsers.length}`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteEmployers();
