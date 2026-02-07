import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

async function addSampleApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing jobs
    const jobs = await Job.find({});
    if (jobs.length === 0) {
      console.log('No jobs found. Please run addSampleData.js first');
      process.exit(1);
    }

    // Clear existing applications
    await Application.deleteMany({});
    console.log('Cleared existing applications');

    // Sample applications for user "Muthees"
    const sampleApplications = [
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[0]._id,
        employerEmail: jobs[0].employerEmail,
        status: 'applied',
        coverLetter: 'I am very interested in this React Developer position and believe my skills align well with your requirements.',
        isQuickApply: false,
        createdAt: new Date()
      },
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[1]._id,
        employerEmail: jobs[1].employerEmail,
        status: 'reviewed',
        coverLetter: 'I have extensive experience in Python development and would love to contribute to your team.',
        isQuickApply: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[2]._id,
        employerEmail: jobs[2].employerEmail,
        status: 'shortlisted',
        coverLetter: 'As a full stack developer, I am excited about the opportunity to work on your product.',
        isQuickApply: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    // Add sample applications
    await Application.insertMany(sampleApplications);
    console.log('Added sample applications');

    console.log('Sample application data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample applications:', error);
    process.exit(1);
  }
}

addSampleApplications();