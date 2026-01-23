import mongoose from 'mongoose';
import Application from '../models/Application.js';
import dotenv from 'dotenv';

dotenv.config();

async function clearHardcodedApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove hardcoded test applications
    const hardcodedEmails = [
      'surojit@example.com',
      'rahul@example.com', 
      'amit@example.com',
      'john.doe@example.com',
      'jane.smith@example.com',
      'mike.johnson@example.com',
      'muthees@example.com'
    ];

    const hardcodedNames = [
      'Surojit Das',
      'Rahul Kumar',
      'Amit Sharma',
      'John Doe',
      'Jane Smith', 
      'Mike Johnson',
      'Muthees'
    ];

    // Delete applications with hardcoded emails or names
    const result = await Application.deleteMany({
      $or: [
        { candidateEmail: { $in: hardcodedEmails } },
        { candidateName: { $in: hardcodedNames } }
      ]
    });

    console.log(`Removed ${result.deletedCount} hardcoded applications`);

    // Verify remaining applications
    const remainingApps = await Application.find({});
    console.log(`Remaining applications: ${remainingApps.length}`);

    if (remainingApps.length > 0) {
      console.log('Remaining applications:');
      remainingApps.forEach(app => {
        console.log(`- ${app.candidateName} (${app.candidateEmail}) - ${app.status}`);
      });
    }

    console.log('Hardcoded applications cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing applications:', error);
    process.exit(1);
  }
}

clearHardcodedApplications();