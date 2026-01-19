import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = ['users', 'jobs', 'applications', 'companies', 'messages', 'notifications', 'resumes', 'resumeversions'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`✅ Cleared ${collection} collection`);
      } catch (error) {
        console.log(`⚠️  Collection ${collection} might not exist or already empty`);
      }
    }

    console.log('🎉 All data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearAllData();