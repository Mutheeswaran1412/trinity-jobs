import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkCurrentData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');
    
    console.log('\n=== JOBS IN DATABASE ===');
    const jobs = await Job.find({}).limit(5);
    console.log(`Found ${jobs.length} jobs:`);
    
    jobs.forEach((job, index) => {
      console.log(`\nJob ${index + 1}:`);
      console.log('  ID:', job._id);
      console.log('  Title:', job.jobTitle);
      console.log('  Company:', job.company);
      console.log('  Posted By:', job.postedBy);
      console.log('  Employer Email:', job.employerEmail);
      console.log('  Employer Name:', job.employerName);
      console.log('  Employer Company:', job.employerCompany);
      console.log('  Created At:', job.createdAt);
    });
    
    console.log('\n=== EMPLOYER USERS IN DATABASE ===');
    const employers = await User.find({ userType: 'employer' });
    console.log(`Found ${employers.length} employers:`);
    
    employers.forEach((user, index) => {
      console.log(`\nEmployer ${index + 1}:`);
      console.log('  ID:', user._id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Company:', user.company);
      console.log('  Company Logo:', user.companyLogo);
      console.log('  User Type:', user.userType);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentData();