import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function removeAllJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    // Get current counts
    const jobCount = await Job.countDocuments();
    const appCount = await Application.countDocuments();
    
    console.log(`📊 Current database status:`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Applications: ${appCount}`);

    // Delete all jobs
    const jobResult = await Job.deleteMany({});
    console.log(`✅ Deleted ${jobResult.deletedCount} jobs`);

    // Delete all applications (since they reference jobs)
    const appResult = await Application.deleteMany({});
    console.log(`✅ Deleted ${appResult.deletedCount} applications`);
    
    // Verify deletion
    const remainingJobs = await Job.countDocuments();
    const remainingApps = await Application.countDocuments();
    
    console.log(`📊 Final database status:`);
    console.log(`   Jobs: ${remainingJobs}`);
    console.log(`   Applications: ${remainingApps}`);

    await mongoose.disconnect();
    console.log('✅ Database cleaned and disconnected');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeAllJobs();