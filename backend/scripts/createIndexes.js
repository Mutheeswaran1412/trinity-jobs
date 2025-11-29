import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

dotenv.config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create indexes for all models
    await Job.createIndexes();
    await User.createIndexes();
    await Company.createIndexes();

    console.log('✓ All indexes created successfully');
    
    // List all indexes
    const jobIndexes = await Job.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();
    const companyIndexes = await Company.collection.getIndexes();

    console.log('\nJob Indexes:', Object.keys(jobIndexes));
    console.log('User Indexes:', Object.keys(userIndexes));
    console.log('Company Indexes:', Object.keys(companyIndexes));

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createIndexes();