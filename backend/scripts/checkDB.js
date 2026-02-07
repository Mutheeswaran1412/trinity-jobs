import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== ALL APPLICATIONS ===');
    const apps = await Application.find({}).populate('jobId');
    console.log(`Total applications: ${apps.length}`);
    
    apps.forEach(app => {
      console.log(`ID: ${app._id}`);
      console.log(`Job: ${app.jobId?.jobTitle || app.jobId?.title || 'NO JOB'}`);
      console.log(`Candidate: ${app.candidateName} (${app.candidateEmail})`);
      console.log(`Status: ${app.status}`);
      console.log(`JobId: ${app.jobId?._id || app.jobId}`);
      console.log('---');
    });
    
    console.log('\n=== ALL JOBS ===');
    const jobs = await Job.find({});
    console.log(`Total jobs: ${jobs.length}`);
    
    jobs.forEach(job => {
      console.log(`ID: ${job._id}`);
      console.log(`Title: ${job.jobTitle || job.title}`);
      console.log(`Company: ${job.company}`);
      console.log(`Employer: ${job.employerEmail}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();