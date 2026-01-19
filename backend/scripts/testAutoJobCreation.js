import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const testAutoJobCreation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test job that will be automatically assigned to mutheeswaran124@gmail.com
    const testJob = new Job({
      jobTitle: 'Senior Software Engineer',
      company: 'Google',
      companyLogo: 'https://logo.clearbit.com/google.com',
      location: 'Chennai, India',
      jobType: 'Full-time',
      locationType: 'Hybrid',
      description: 'We are looking for a Senior Software Engineer to join our team...',
      requirements: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD',
        period: 'yearly'
      },
      status: 'approved',
      employerEmail: 'mutheeswaran124@gmail.com',
      postedBy: 'Mutheeswaran',
      employerCompany: 'Trinity Technology',
      postedFor: 'Google',
      isThirdPartyPosting: true,
      isActive: true,
      moderationFlags: {
        isSpam: false,
        isFake: false,
        hasComplianceIssues: false,
        isDuplicate: false
      }
    });

    await testJob.save();
    console.log('✅ Test job created successfully!');
    console.log('Job ID:', testJob._id);
    console.log('Assigned to:', testJob.employerEmail);
    console.log('Company:', testJob.company);
    console.log('Posted by:', testJob.postedBy);

    // Verify the job was created
    const jobs = await Job.find({ employerEmail: 'mutheeswaran124@gmail.com' });
    console.log(`\n📊 Total jobs for mutheeswaran124@gmail.com: ${jobs.length}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAutoJobCreation();