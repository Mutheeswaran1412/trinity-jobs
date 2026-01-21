import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all applications
    const applications = await Application.find({});
    console.log(`Found ${applications.length} applications`);

    // Get all jobs
    const jobs = await Job.find({});
    console.log(`Found ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.log('No jobs found. Please run addSampleData.js first');
      process.exit(1);
    }

    // Delete all existing applications and create new ones with proper references
    await Application.deleteMany({});
    console.log('Cleared existing applications');

    // Create sample applications for Muthees
    const sampleApplications = [
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[0]._id,
        employerEmail: jobs[0].employerEmail,
        status: 'applied',
        coverLetter: 'I am very interested in this React Developer position.',
        isQuickApply: false,
        timeline: [{
          status: 'applied',
          date: new Date(),
          note: 'Applied to position',
          updatedBy: 'Muthees'
        }],
        createdAt: new Date()
      },
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[1]._id,
        employerEmail: jobs[1].employerEmail,
        status: 'reviewed',
        coverLetter: 'I have extensive experience in Python development.',
        isQuickApply: true,
        timeline: [
          {
            status: 'applied',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            note: 'Quick applied to position',
            updatedBy: 'Muthees'
          },
          {
            status: 'reviewed',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            note: 'Application is being reviewed',
            updatedBy: 'HR Team'
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        candidateName: 'Muthees',
        candidateEmail: 'muthees@example.com',
        candidatePhone: '+1234567890',
        jobId: jobs[2]._id,
        employerEmail: jobs[2].employerEmail,
        status: 'shortlisted',
        coverLetter: 'As a full stack developer, I am excited about this opportunity.',
        isQuickApply: false,
        timeline: [
          {
            status: 'applied',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            note: 'Applied to position',
            updatedBy: 'Muthees'
          },
          {
            status: 'reviewed',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            note: 'Application reviewed',
            updatedBy: 'HR Team'
          },
          {
            status: 'shortlisted',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            note: 'Candidate shortlisted for interview',
            updatedBy: 'Hiring Manager'
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    // Insert new applications
    await Application.insertMany(sampleApplications);
    console.log('Added sample applications with proper job references');

    // Verify the applications
    const verifyApps = await Application.find({}).populate('jobId', 'jobTitle title company location');
    console.log('Verification:');
    verifyApps.forEach(app => {
      console.log(`- ${app.candidateName}: ${app.jobId?.jobTitle || app.jobId?.title || 'NO JOB TITLE'} at ${app.jobId?.company || 'NO COMPANY'} (${app.status})`);
    });

    console.log('Applications fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing applications:', error);
    process.exit(1);
  }
}

fixApplications();