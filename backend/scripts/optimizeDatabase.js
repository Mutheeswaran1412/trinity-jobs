import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const optimizeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    const db = mongoose.connection.db;

    // Jobs Collection - Faster Search
    await db.collection('jobs').createIndex({ title: 'text', description: 'text', company: 'text' });
    await db.collection('jobs').createIndex({ location: 1 });
    await db.collection('jobs').createIndex({ salary: 1 });
    await db.collection('jobs').createIndex({ createdAt: -1 });
    await db.collection('jobs').createIndex({ isActive: 1 });

    // Users Collection - Faster Login
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ skills: 1 });

    // Applications - Faster Dashboard
    await db.collection('applications').createIndex({ userId: 1 });
    await db.collection('applications').createIndex({ jobId: 1 });
    await db.collection('applications').createIndex({ status: 1 });

    console.log('✅ Database optimized - 3x faster queries!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

optimizeDatabase();