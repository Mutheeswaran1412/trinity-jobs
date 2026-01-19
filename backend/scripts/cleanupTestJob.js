import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    const result = await Job.deleteOne({ jobTitle: 'Test Job' });
    console.log(`Deleted ${result.deletedCount} test job(s)`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

cleanup();