import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testThirdPartyPosting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    // Create a test job posted by Trinity Technology for Google
    const testJob = new Job({
      jobTitle: 'Senior React Developer',
      company: 'Google', // Job shows as Google
      companyLogo: 'https://logo.clearbit.com/google.com',
      location: 'Mountain View, CA',
      jobType: 'Full-time',
      description: 'Join Google as a Senior React Developer and work on cutting-edge projects.',
      requirements: ['React', 'JavaScript', 'TypeScript'],
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      salary: {
        min: 150000,
        max: 200000,
        currency: 'USD',
        period: 'yearly'
      },
      // Employer details (Trinity Technology)
      employerEmail: 'mutheeswaran124@gmail.com',
      employerId: '696dbc109d0c7f038f7d6a9a', // Trinity Technology employer ID
      employerCompany: 'Trinity Technology', // Actual employer
      postedBy: 'Mutheeswaran',
      postedFor: 'Google', // Company job is posted for
      isThirdPartyPosting: true,
      status: 'approved',
      isActive: true
    });

    await testJob.save();
    console.log('✅ Test job created successfully!');
    console.log('Job Details:');
    console.log(`- Job Title: ${testJob.jobTitle}`);
    console.log(`- Company (displayed): ${testJob.company}`);
    console.log(`- Employer Company (actual): ${testJob.employerCompany}`);
    console.log(`- Posted by: ${testJob.postedBy}`);
    console.log(`- Third Party Posting: ${testJob.isThirdPartyPosting}`);

    // Test dashboard query
    const dashboardJobs = await Job.find({
      $or: [
        { employerEmail: 'mutheeswaran124@gmail.com' },
        { 
          $and: [
            { employerEmail: 'mutheeswaran124@gmail.com' },
            { isThirdPartyPosting: true }
          ]
        }
      ]
    });

    console.log(`\n📊 Dashboard will show ${dashboardJobs.length} jobs for Trinity Technology:`);
    dashboardJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.jobTitle} at ${job.company} (Third-party: ${job.isThirdPartyPosting})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testThirdPartyPosting();