import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function deleteSpecificEmployer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB');

    const targetEmail = 'mutheeswaran124@gmail.com';

    // Find the user first
    const user = await User.findOne({ email: targetEmail });
    if (user) {
      console.log(`Found user: ${user.name} (${user.email}) - ${user.userType}`);
    } else {
      console.log(`❌ User with email ${targetEmail} not found`);
      await mongoose.disconnect();
      return;
    }

    // Delete jobs posted by this employer
    const jobResult = await Job.deleteMany({ 
      $or: [
        { employerEmail: targetEmail },
        { postedBy: targetEmail }
      ]
    });
    console.log(`✅ Deleted ${jobResult.deletedCount} jobs posted by ${targetEmail}`);

    // Delete applications for jobs posted by this employer
    const appResult = await Application.deleteMany({ employerEmail: targetEmail });
    console.log(`✅ Deleted ${appResult.deletedCount} applications for jobs by ${targetEmail}`);

    // Delete the user account
    const userResult = await User.deleteOne({ email: targetEmail });
    console.log(`✅ Deleted user account: ${targetEmail}`);

    // Show remaining counts
    const remainingUsers = await User.countDocuments({ userType: 'employer' });
    const remainingJobs = await Job.countDocuments();
    const remainingApps = await Application.countDocuments();
    
    console.log(`📊 Remaining in database:`);
    console.log(`   Employer accounts: ${remainingUsers}`);
    console.log(`   Jobs: ${remainingJobs}`);
    console.log(`   Applications: ${remainingApps}`);

    await mongoose.disconnect();
    console.log('✅ Specific employer account deleted successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteSpecificEmployer();