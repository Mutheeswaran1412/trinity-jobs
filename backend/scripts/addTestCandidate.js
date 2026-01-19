import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function addTestCandidate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('test123', 10);

    const testCandidate = {
      name: 'Priya Sharma',
      email: 'priya.test@example.com',
      password: hashedPassword,
      userType: 'candidate',
      phone: '+91-9876543210',
      location: 'Bangalore, India',
      title: 'Frontend Developer',
      salary: '$60,000 - $80,000',
      availability: 'Available',
      rating: 4.3,
      profile: {
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
        experience: 3,
        bio: 'Frontend developer with 3 years of experience in building responsive web applications.'
      }
    };

    // Check if already exists
    const existing = await User.findOne({ email: testCandidate.email });
    if (existing) {
      console.log('Test candidate already exists, updating...');
      await User.updateOne({ email: testCandidate.email }, testCandidate);
    } else {
      await User.create(testCandidate);
      console.log('✅ Test candidate created successfully!');
    }

    // Check total candidates now
    const totalCandidates = await User.countDocuments({ userType: 'candidate', status: 'active' });
    console.log(`\n📊 Total active candidates now: ${totalCandidates}`);

    // List all candidates
    const candidates = await User.find({ userType: 'candidate', status: 'active' })
      .select('name email location title profile.skills')
      .sort({ createdAt: -1 });

    console.log('\n👥 All Active Candidates:');
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.email})`);
      console.log(`   Title: ${candidate.title || 'Not specified'}`);
      console.log(`   Location: ${candidate.location || 'Not specified'}`);
      console.log(`   Skills: ${candidate.profile?.skills?.join(', ') || 'None listed'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestCandidate();