import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
  try {
    await mongoose.connect('mongodb+srv://Jopportal:Trinity123@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections`);

    // Drop all collections
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`🗑️ Dropped collection: ${collection.name}`);
    }

    console.log('\n✅ Database cleared successfully!');
    console.log('🧹 All users, jobs, applications, and other data removed');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearDatabase();