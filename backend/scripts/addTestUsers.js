const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  company: String,
  phone: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function addTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('test123', 10);

    const testUsers = [
      {
        name: 'Test Candidate',
        email: 'test@test.com',
        password: hashedPassword,
        userType: 'candidate',
        phone: '9876543210',
        location: 'Chennai'
      },
      {
        name: 'Test Employer',
        email: 'employer@test.com',
        password: hashedPassword,
        userType: 'employer',
        company: 'Test Company',
        phone: '9876543211',
        location: 'Bangalore'
      },
      {
        name: 'ZyncJobs Admin',
        email: 'admin@zyncjobs.com',
        password: hashedPassword,
        userType: 'admin',
        company: 'ZyncJobs',
        phone: '9876543212',
        location: 'Mumbai'
      },
      {
        name: 'Demo User',
        email: 'demo@demo.com',
        password: hashedPassword,
        userType: 'candidate',
        phone: '9876543213',
        location: 'Delhi'
      }
    ];

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists, updating...`);
        await User.updateOne({ email: userData.email }, userData);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('\n✅ Test users added successfully!');
    console.log('\nLogin credentials (password for all: test123):');
    console.log('- test@test.com (Candidate)');
    console.log('- employer@test.com (Employer)');
    console.log('- admin@zyncjobs.com (Admin)');
    console.log('- demo@demo.com (Candidate)');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestUsers();
