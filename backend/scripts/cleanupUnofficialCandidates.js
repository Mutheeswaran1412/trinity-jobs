import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

const cleanupUnofficialCandidates = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Searching for unofficial candidates...');
    
    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check Users collection
    const usersCollection = db.collection('users');
    const priyaCandidates = await usersCollection.find({
      $or: [
        { name: /priya.*sharma/i },
        { fullName: /priya.*sharma/i }
      ]
    }).toArray();
    
    console.log(`Found ${priyaCandidates.length} Priya Sharma candidates in users collection`);
    priyaCandidates.forEach(candidate => {
      console.log(`- ID: ${candidate._id}`);
      console.log(`  Name: ${candidate.name || candidate.fullName}`);
      console.log(`  Email: ${candidate.email}`);
      console.log(`  Location: ${candidate.location}`);
      console.log('---');
    });
    
    // Check Profiles collection
    const profilesCollection = db.collection('profiles');
    const priyaProfiles = await profilesCollection.find({
      $or: [
        { name: /priya.*sharma/i },
        { fullName: /priya.*sharma/i }
      ]
    }).toArray();
    
    console.log(`Found ${priyaProfiles.length} Priya Sharma profiles in profiles collection`);
    priyaProfiles.forEach(profile => {
      console.log(`- ID: ${profile._id}`);
      console.log(`  Name: ${profile.name}`);
      console.log(`  Email: ${profile.email}`);
      console.log(`  Location: ${profile.location}`);
      console.log('---');
    });
    
    // Remove from users collection
    if (priyaCandidates.length > 0) {
      const userResult = await usersCollection.deleteMany({
        $or: [
          { name: /priya.*sharma/i },
          { fullName: /priya.*sharma/i }
        ]
      });
      console.log(`✅ Removed ${userResult.deletedCount} candidates from users collection`);
    }
    
    // Remove from profiles collection
    if (priyaProfiles.length > 0) {
      const profileResult = await profilesCollection.deleteMany({
        $or: [
          { name: /priya.*sharma/i },
          { fullName: /priya.*sharma/i }
        ]
      });
      console.log(`✅ Removed ${profileResult.deletedCount} profiles from profiles collection`);
    }
    
    // Also check for any applications by this candidate
    const applicationsCollection = db.collection('applications');
    const priyaApplications = await applicationsCollection.find({
      candidateName: /priya.*sharma/i
    }).toArray();
    
    console.log(`Found ${priyaApplications.length} applications by Priya Sharma`);
    if (priyaApplications.length > 0) {
      const appResult = await applicationsCollection.deleteMany({
        candidateName: /priya.*sharma/i
      });
      console.log(`✅ Removed ${appResult.deletedCount} applications`);
    }
    
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

cleanupUnofficialCandidates();