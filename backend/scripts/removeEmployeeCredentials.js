import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const removeEmployeeCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Remove sensitive credential fields from all users
    const result = await usersCollection.updateMany(
      {},
      {
        $unset: {
          password: "",
          refreshTokens: "",
          resetPasswordToken: "",
          resetPasswordExpiry: ""
        }
      }
    );

    console.log(`✓ Removed credentials from ${result.modifiedCount} users`);
    console.log('✓ All employee credentials have been removed from the database');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error removing credentials:', error);
    process.exit(1);
  }
};

removeEmployeeCredentials();
