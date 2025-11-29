import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if User collection exists and has data
    console.log('\n--- Checking Users Collection ---');
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      console.log('\n--- Sample Users ---');
      const users = await User.find().limit(5).select('name email userType company createdAt');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Type: ${user.userType}, Company: ${user.company || 'N/A'}`);
      });
    } else {
      console.log('❌ No users found in database');
      
      // Create test users
      console.log('\n--- Creating Test Users ---');
      const testUsers = [
        {
          name: 'Test Candidate',
          email: 'candidate@test.com',
          password: '123456',
          userType: 'candidate',
          location: 'Chennai'
        },
        {
          name: 'Test Employer',
          email: 'employer@test.com',
          password: '123456',
          userType: 'employer',
          company: 'Test Company'
        }
      ];

      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      }
    }

    // Test login with existing users
    console.log('\n--- Testing Login ---');
    const testEmail = 'candidate@test.com';
    const testPassword = '123456';
    
    const user = await User.findOne({ email: testEmail });
    if (user) {
      console.log(`✅ Found user: ${user.email}`);
      console.log(`Password match: ${user.password === testPassword ? '✅ Yes' : '❌ No'}`);
      console.log(`User active: ${user.isActive !== false ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log(`❌ User not found: ${testEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();