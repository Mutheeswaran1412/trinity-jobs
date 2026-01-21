const { MongoClient } = require('mongodb');

// MongoDB connection string - using the actual connection from .env
const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('jobportal'); // Using the correct database name
    
    // Delete all employer users
    const employerResult = await db.collection('users').deleteMany({
      userType: 'employer'
    });
    console.log(`Deleted ${employerResult.deletedCount} employer accounts`);
    
    // Delete all job posts
    const jobsResult = await db.collection('jobs').deleteMany({});
    console.log(`Deleted ${jobsResult.deletedCount} job posts`);
    
    // Delete all applications
    const applicationsResult = await db.collection('applications').deleteMany({});
    console.log(`Deleted ${applicationsResult.deletedCount} applications`);
    
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupDatabase();