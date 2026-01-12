import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const removeEmployerCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Remove credentials only from employer users
    const result = await usersCollection.updateMany(
      { userType: 'employer' },
      {
        $unset: {
          password: "",
          refreshTokens: "",
          resetPasswordToken: "",
          resetPasswordExpiry: ""
        }
      }
    );

    console.log(`✓ Removed credentials from ${result.modifiedCount} employer users`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeEmployerCredentials();
