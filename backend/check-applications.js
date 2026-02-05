import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from './models/Application.js';
import Job from './models/Job.js';
import User from './models/User.js';

dotenv.config();

async function checkRecentApplications() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get recent applications
    console.log('\n📋 Recent applications (last 10):');
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('jobId', 'jobTitle title company')
      .populate('candidateId', 'name email');
    
    if (recentApplications.length === 0) {
      console.log('❌ No applications found in database');
    } else {
      recentApplications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.candidateName} (${app.candidateEmail})`);
        console.log(`   Job: ${app.jobId?.jobTitle || app.jobId?.title || 'Unknown Job'}`);
        console.log(`   Company: ${app.jobId?.company || 'Unknown Company'}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.createdAt.toLocaleString()}`);
        console.log(`   Timeline entries: ${app.timeline?.length || 0}`);
        console.log('   ---');
      });
    }

    // Check applications by specific email (if you want to test with your email)
    const testEmail = 'mutheeswaran124@gmail.com'; // Replace with your test email
    console.log(`\n🔍 Applications for ${testEmail}:`);
    const userApplications = await Application.find({ 
      candidateEmail: { $regex: new RegExp(testEmail, 'i') }
    })
      .sort({ createdAt: -1 })
      .populate('jobId', 'jobTitle title company');
    
    if (userApplications.length === 0) {
      console.log(`❌ No applications found for ${testEmail}`);
    } else {
      userApplications.forEach((app, index) => {
        console.log(`${index + 1}. Job: ${app.jobId?.jobTitle || app.jobId?.title || 'Unknown Job'}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.createdAt.toLocaleString()}`);
      });
    }

    console.log(`\n📊 Total applications in database: ${await Application.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkRecentApplications();