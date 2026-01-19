import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearSampleJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    // Delete all jobs that don't have a real employerId or employerEmail
    const result = await Job.deleteMany({
      $and: [
        {
          $or: [
            { employerId: { $exists: false } },
            { employerId: null },
            { employerEmail: { $exists: false } },
            { employerEmail: null },
            { employerEmail: '' }
          ]
        },
        {
          // Also delete jobs that look like sample data (no real employer info)
          $or: [
            { postedBy: { $exists: false } },
            { postedBy: null },
            { company: { $regex: /^(Tech Company|TechCorp|Company)$/i } }
          ]
        }
      ]
    });

    console.log(`✅ Deleted ${result.deletedCount} sample jobs`);
    
    // Show remaining jobs count
    const remainingJobs = await Job.countDocuments();
    console.log(`📊 Remaining jobs in database: ${remainingJobs}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error clearing sample jobs:', error);
    process.exit(1);
  }
}

clearSampleJobs();