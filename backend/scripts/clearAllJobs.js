import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectAndClearJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    // First, let's see what jobs exist
    const allJobs = await Job.find({}).limit(5);
    console.log('Sample jobs in database:');
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.jobTitle} at ${job.company}`);
      console.log(`   employerId: ${job.employerId}`);
      console.log(`   employerEmail: ${job.employerEmail}`);
      console.log(`   postedBy: ${job.postedBy}`);
      console.log('---');
    });

    // Delete ALL jobs to reset the database
    const result = await Job.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} jobs`);
    
    // Show remaining jobs count
    const remainingJobs = await Job.countDocuments();
    console.log(`📊 Remaining jobs in database: ${remainingJobs}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectAndClearJobs();