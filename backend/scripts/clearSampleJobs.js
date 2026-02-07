import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

async function clearSampleJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all jobs (sample data)
    const result = await Job.deleteMany({});
    console.log(`Deleted ${result.deletedCount} sample jobs`);

    console.log('Sample jobs cleared. Only real employer-posted jobs will now show.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing jobs:', error);
    process.exit(1);
  }
}

clearSampleJobs();