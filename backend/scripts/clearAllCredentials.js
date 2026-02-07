const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function clearAllCredentials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all users
    const userResult = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);

    // Clear all jobs
    const jobResult = await mongoose.connection.db.collection('jobs').deleteMany({});
    console.log(`Deleted ${jobResult.deletedCount} jobs`);

    // Clear all applications
    const appResult = await mongoose.connection.db.collection('applications').deleteMany({});
    console.log(`Deleted ${appResult.deletedCount} applications`);

    console.log('All credentials cleared successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

clearAllCredentials();