import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function findTrinitechJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find trinitetech user
    const trinitechUser = await User.findOne({ 
      email: { $regex: 'trinitetech', $options: 'i' } 
    });
    
    if (trinitechUser) {
      console.log('Found trinitetech user:', trinitechUser.email);
      console.log('User ID:', trinitechUser._id);
    }
    
    // Search for jobs by different criteria
    console.log('\n=== Searching for Trinitetech jobs ===');
    
    // Search by company name
    const jobsByCompany = await Job.find({ 
      company: { $regex: 'trinity', $options: 'i' } 
    });
    console.log(`Jobs by company name (trinity): ${jobsByCompany.length}`);
    
    // Search by employer email
    const jobsByEmail = await Job.find({ 
      employerEmail: { $regex: 'trinitetech', $options: 'i' } 
    });
    console.log(`Jobs by employer email (trinitetech): ${jobsByEmail.length}`);
    
    // Search by posted by user ID
    if (trinitechUser) {
      const jobsByUserId = await Job.find({ 
        postedBy: trinitechUser._id 
      });
      console.log(`Jobs by user ID: ${jobsByUserId.length}`);
    }
    
    // Get all jobs and check details
    const allJobs = await Job.find({});
    console.log(`\nTotal jobs in database: ${allJobs.length}`);
    
    console.log('\n=== All jobs details ===');
    allJobs.forEach((job, index) => {
      console.log(`${index + 1}. Title: ${job.title || 'No title'}`);
      console.log(`   Company: ${job.company || 'No company'}`);
      console.log(`   Email: ${job.employerEmail || 'No email'}`);
      console.log(`   Posted by: ${job.postedBy || 'No user ID'}`);
      console.log(`   Status: ${job.status || 'No status'}`);
      console.log(`   Active: ${job.isActive}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findTrinitechJobs();