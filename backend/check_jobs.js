import mongoose from 'mongoose';
import Job from './models/Job.js';

const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function checkJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const jobs = await Job.find({});
    console.log(`Total jobs: ${jobs.length}`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} - ${job.company} - Status: ${job.status} - Active: ${job.isActive}`);
    });
    
    // Update all jobs to be active and approved
    await Job.updateMany({}, { 
      isActive: true, 
      status: 'approved' 
    });
    
    console.log('Updated all jobs to be active and approved');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkJobs();