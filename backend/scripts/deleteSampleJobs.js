import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteSampleJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all jobs except the one from Trinity technology solution (Software Developer)
    const result = await Job.deleteMany({
      $or: [
        { company: { $in: ['Swiggy', 'Microsoft', 'Apple', 'Morgan Stanley', 'Visa', 'DXC Technology', 'HDFC Bank', 'HCL Technologies'] } },
        { description: { $regex: /^Exciting opportunity for/i } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} sample jobs`);
    
    // Show remaining jobs
    const remainingJobs = await Job.find({});
    console.log(`\nRemaining jobs: ${remainingJobs.length}`);
    remainingJobs.forEach(job => {
      console.log(`- ${job.title || job.jobTitle} at ${job.company}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteSampleJobs();
