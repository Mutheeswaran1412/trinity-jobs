import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const removeTestData = async () => {
  try {
    await connectDB();
    
    console.log('Removing all test jobs and applications for Mutheeswaran...');
    
    // Remove all jobs posted by Mutheeswaran or with his email
    const deletedJobs = await Job.deleteMany({ 
      $or: [
        { postedBy: 'Mutheeswaran' },
        { employerEmail: 'mutheeswaran124@gmail.com' }
      ]
    });
    
    console.log(`✅ Deleted ${deletedJobs.deletedCount} jobs`);
    
    // Remove all applications for Mutheeswaran's email
    const deletedApps = await Application.deleteMany({ 
      employerEmail: 'mutheeswaran124@gmail.com' 
    });
    
    console.log(`✅ Deleted ${deletedApps.deletedCount} applications`);
    
    // Verify the cleanup
    const remainingJobs = await Job.countDocuments({ 
      $or: [
        { postedBy: 'Mutheeswaran' },
        { employerEmail: 'mutheeswaran124@gmail.com' }
      ]
    });
    
    const remainingApps = await Application.countDocuments({ 
      employerEmail: 'mutheeswaran124@gmail.com' 
    });
    
    console.log(`\n📊 After cleanup:`);
    console.log(`- Remaining jobs for Mutheeswaran: ${remainingJobs}`);
    console.log(`- Remaining applications for Mutheeswaran: ${remainingApps}`);
    
    if (remainingJobs === 0 && remainingApps === 0) {
      console.log('✅ All test data successfully removed!');
      console.log('Dashboard will now be empty until you post real jobs.');
    } else {
      console.log('⚠️ Some data may still remain');
    }
    
  } catch (error) {
    console.error('Error removing test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

removeTestData();