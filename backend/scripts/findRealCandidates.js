import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function findRealCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Search for mutheeswaran1424
    const mutheeswaran = await User.findOne({ 
      $or: [
        { name: { $regex: 'mutheeswaran', $options: 'i' } },
        { email: { $regex: 'mutheeswaran', $options: 'i' } }
      ]
    });

    if (mutheeswaran) {
      console.log('🔍 Found Mutheeswaran:');
      console.log(`   Name: ${mutheeswaran.name}`);
      console.log(`   Email: ${mutheeswaran.email}`);
      console.log(`   UserType: ${mutheeswaran.userType}`);
      console.log(`   Location: ${mutheeswaran.location || 'Not specified'}`);
      console.log(`   Title: ${mutheeswaran.title || 'Not specified'}`);
      console.log(`   Skills: ${mutheeswaran.profile?.skills?.join(', ') || 'None listed'}`);
      console.log('');
    } else {
      console.log('❌ No candidate found with "mutheeswaran" in name or email');
    }

    // Get all real candidates (excluding sample ones)
    const sampleEmails = [
      'sarah.johnson@email.com',
      'michael.chen@email.com', 
      'emily.rodriguez@email.com',
      'david.kim@email.com',
      'jessica.thompson@email.com',
      'alex.martinez@email.com',
      'rachel.green@email.com',
      'james.wilson@email.com'
    ];

    const realCandidates = await User.find({ 
      userType: 'candidate', 
      status: 'active',
      email: { $nin: sampleEmails }
    }).select('name email location profile.skills title createdAt')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Real Candidates (excluding samples): ${realCandidates.length}\n`);
    
    realCandidates.forEach((candidate, index) => {
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

findRealCandidates();