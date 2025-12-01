import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function optimizeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create indexes for Users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ userType: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Create indexes for Jobs collection
    await db.collection('jobs').createIndex({ title: 'text', description: 'text' });
    await db.collection('jobs').createIndex({ location: 1 });
    await db.collection('jobs').createIndex({ company: 1 });
    await db.collection('jobs').createIndex({ skills: 1 });
    await db.collection('jobs').createIndex({ createdAt: -1 });
    await db.collection('jobs').createIndex({ isActive: 1 });

    console.log('Database optimization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database optimization failed:', error);
    process.exit(1);
  }
}

optimizeDatabase();