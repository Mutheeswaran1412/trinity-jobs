import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Script to hash existing plain text passwords
async function hashExistingPasswords() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with plain text passwords (passwords without bcrypt hash format)
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log(`⏭️  Skipping ${user.email} - Already hashed`);
        skipped++;
        continue;
      }

      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
      
      console.log(`✅ Updated ${user.email} - Password hashed`);
      updated++;
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updated} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (already hashed)`);
    console.log(`   📊 Total: ${users.length} users`);
    
    console.log('\n🎉 Password hashing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

hashExistingPasswords();
