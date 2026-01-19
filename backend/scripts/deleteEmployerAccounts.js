import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function deleteEmployerAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    // Get current counts
    const userCount = await User.countDocuments({ userType: 'employer' });
    const jobCount = await Job.countDocuments();
    const appCount = await Application.countDocuments();
    
    console.log(`📊 Current database status:`);
    console.log(`   Employer accounts: ${userCount}`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Applications: ${appCount}`);

    // Delete all employer accounts
    const userResult = await User.deleteMany({ userType: 'employer' });
    console.log(`✅ Deleted ${userResult.deletedCount} employer accounts`);

    // Delete all jobs
    const jobResult = await Job.deleteMany({});
    console.log(`✅ Deleted ${jobResult.deletedCount} jobs`);

    // Delete all applications
    const appResult = await Application.deleteMany({});
    console.log(`✅ Deleted ${appResult.deletedCount} applications`);
    
    // Verify deletion
    const remainingUsers = await User.countDocuments({ userType: 'employer' });
    const remainingJobs = await Job.countDocuments();
    const remainingApps = await Application.countDocuments();
    const candidateCount = await User.countDocuments({ userType: 'candidate' });
    
    console.log(`📊 Final database status:`);
    console.log(`   Employer accounts: ${remainingUsers}`);
    console.log(`   Jobs: ${remainingJobs}`);
    console.log(`   Applications: ${remainingApps}`);
    console.log(`   Candidates: ${candidateCount} (preserved)`);

    await mongoose.disconnect();
    console.log('✅ Database cleaned and disconnected');
    console.log('🎉 Fresh start ready! You can now register new employer accounts.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteEmployerAccounts();