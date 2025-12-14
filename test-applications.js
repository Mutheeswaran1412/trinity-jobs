import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testApplications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false }));
    
    const applications = await Application.find({});
    console.log(`\n📊 Total Applications: ${applications.length}\n`);
    
    if (applications.length > 0) {
      console.log('Sample Application:');
      console.log(JSON.stringify(applications[0], null, 2));
    } else {
      console.log('❌ No applications found in database');
      console.log('\n💡 To test: Apply for a job from the frontend');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApplications();
