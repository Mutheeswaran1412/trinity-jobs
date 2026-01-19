import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all employers
    const employerResult = await User.deleteMany({ userType: 'employer' });
    console.log(`Deleted ${employerResult.deletedCount} employers`);

    // Delete all jobs
    const jobResult = await Job.deleteMany({});
    console.log(`Deleted ${jobResult.deletedCount} jobs`);

    // Delete all applications
    const applicationResult = await Application.deleteMany({});
    console.log(`Deleted ${applicationResult.deletedCount} applications`);

    // Clear appliedJobs from all users
    const userUpdateResult = await User.updateMany(
      {},
      { $set: { appliedJobs: [], savedJobs: [] } }
    );
    console.log(`Cleared applied/saved jobs from ${userUpdateResult.modifiedCount} users`);

    console.log('Database cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupDatabase();