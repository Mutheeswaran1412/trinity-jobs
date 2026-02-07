import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteSpecificJob = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete the Software Developer job at Trinity technology solution
    const result = await Job.deleteOne({
      jobTitle: 'Software Developer',
      company: 'Trinity technology solution'
    });

    console.log(`Deleted ${result.deletedCount} job(s)`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteSpecificJob();
