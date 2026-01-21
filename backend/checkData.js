import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  userType: String,
  company: String
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  jobTitle: String,
  company: String,
  location: String,
  employerEmail: String,
  postedBy: String,
  isActive: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb+srv://Jopportal:Trinity123@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Check users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`📧 ${user.email} - ${user.name} (${user.userType}) - Company: ${user.company || 'N/A'}`);
    });

    // Check jobs
    const jobs = await Job.find({});
    console.log(`\n💼 Found ${jobs.length} jobs:`);
    jobs.forEach(job => {
      console.log(`🏢 ${job.jobTitle} at ${job.company} - Posted by: ${job.postedBy || job.employerEmail} - Active: ${job.isActive !== false}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();