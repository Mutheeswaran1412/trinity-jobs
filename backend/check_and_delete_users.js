import mongoose from 'mongoose';
import User from './models/User.js';
import Application from './models/Application.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jobportal_user:YOUR_PASSWORD@jobportal.pnp4szn.mongodb.net/?retryWrites=true&w=majority&appName=Jobportal');

async function checkAndDeleteUsers() {
  try {
    console.log('🔍 Checking current users in database...\n');

    // Check if User model exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasUsers = collections.some(col => col.name === 'users');
    
    if (!hasUsers) {
      console.log('❌ No users collection found in database');
      return;
    }

    // Get all users
    const allUsers = await User.find({});
    console.log(`📊 Total users found: ${allUsers.length}\n`);
    
    if (allUsers.length === 0) {
      console.log('✅ No users in database - already clean!');
      return;
    }

    // Show all users
    console.log('👥 Current users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Type: ${user.userType || 'unknown'}`);
      console.log(`   Name: ${user.fullName || user.name || 'No name'}`);
      console.log('');
    });

    // Delete all applications first
    console.log('🗑️ Deleting all applications...');
    const appResult = await Application.deleteMany({});
    console.log(`✅ Deleted ${appResult.deletedCount} applications\n`);

    // Delete non-admin users
    console.log('🗑️ Deleting candidate and employer users...');
    const deleteResult = await User.deleteMany({
      $and: [
        { email: { $ne: 'admin@trinity.com' } },
        { userType: { $ne: 'admin' } },
        { fullName: { $ne: 'Trinity Admin' } }
      ]
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} users\n`);

    // Check remaining users
    const remainingUsers = await User.find({});
    console.log(`📊 Remaining users: ${remainingUsers.length}`);
    
    if (remainingUsers.length > 0) {
      console.log('\n👥 Remaining users (should only be admin):');
      remainingUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.userType} - ${user.fullName || user.name}`);
      });
    }

    console.log('\n✅ Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkAndDeleteUsers();