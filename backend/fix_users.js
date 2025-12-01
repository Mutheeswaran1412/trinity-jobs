import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create test users for easy login
    const testUsers = [
      {
        name: 'Test Candidate',
        email: 'test@candidate.com',
        password: '123456',
        userType: 'candidate',
        location: 'Chennai',
        isActive: true
      },
      {
        name: 'Test Employer', 
        email: 'test@employer.com',
        password: '123456',
        userType: 'employer',
        company: 'Test Company',
        isActive: true
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.userType})`);
    }

    console.log('\n--- Test Login Credentials ---');
    console.log('Candidate: test@candidate.com / 123456');
    console.log('Employer: test@employer.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixUsers();