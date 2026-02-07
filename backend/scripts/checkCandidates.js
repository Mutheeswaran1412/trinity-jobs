import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function checkCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const candidates = await User.find({ userType: 'candidate', status: 'active' })
      .select('name email location profile.skills title createdAt')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Total Active Candidates: ${candidates.length}\n`);
    
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Location: ${candidate.location || 'Not specified'}`);
      console.log(`   Title: ${candidate.title || 'Not specified'}`);
      console.log(`   Skills: ${candidate.profile?.skills?.join(', ') || 'None listed'}`);
      console.log(`   Registered: ${candidate.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCandidates();