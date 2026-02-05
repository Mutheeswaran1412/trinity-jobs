import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from './models/Application.js';
import Job from './models/Job.js';
import User from './models/User.js';

dotenv.config();

async function testApplicationSystem() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if we can create a test application
    console.log('\n📝 Testing application creation...');
    
    const testApplication = new Application({
      jobId: new mongoose.Types.ObjectId(),
      candidateName: 'Test User',
      candidateEmail: 'test@example.com',
      candidatePhone: '1234567890',
      status: 'applied',
      timeline: [{
        status: 'applied',
        date: new Date(),
        note: 'Test application created',
        updatedBy: 'Test User'
      }]
    });

    const savedApplication = await testApplication.save();
    console.log('✅ Test application created:', savedApplication._id);

    // Test 2: Check existing applications
    console.log('\n📊 Checking existing applications...');
    const applicationCount = await Application.countDocuments();
    console.log(`📈 Total applications in database: ${applicationCount}`);

    // Test 3: Check recent applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('jobId', 'jobTitle title company');
    
    console.log('\n📋 Recent applications:');
    recentApplications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.candidateName} - ${app.candidateEmail} - Status: ${app.status}`);
    });

    // Test 4: Check jobs
    console.log('\n💼 Checking jobs...');
    const jobCount = await Job.countDocuments();
    console.log(`📈 Total jobs in database: ${jobCount}`);

    // Test 5: Check users
    console.log('\n👥 Checking users...');
    const userCount = await User.countDocuments();
    console.log(`📈 Total users in database: ${userCount}`);

    // Clean up test data
    await Application.findByIdAndDelete(savedApplication._id);
    console.log('🧹 Test application cleaned up');

    console.log('\n✅ All tests passed! Database connection is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testApplicationSystem();