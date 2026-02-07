import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function cleanupAndUpdateCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove sample candidates
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

    const deleteResult = await User.deleteMany({ email: { $in: sampleEmails } });
    console.log(`🗑️ Removed ${deleteResult.deletedCount} sample candidates`);

    // Update mutheeswaran to be a proper candidate
    const mutheeswaran = await User.findOne({ email: 'mutheeswaran1424@gmail.com' });
    if (mutheeswaran) {
      await User.updateOne(
        { email: 'mutheeswaran1424@gmail.com' },
        {
          $set: {
            userType: 'candidate',
            role: 'candidate',
            title: 'Software Developer',
            location: 'Chennai, India',
            salary: '$50,000 - $70,000',
            availability: 'Available',
            rating: 4.5,
            'profile.skills': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
            'profile.experience': 2,
            'profile.bio': 'Passionate software developer with experience in full-stack web development.'
          }
        }
      );
      console.log('✅ Updated mutheeswaran1424 to be a proper candidate with profile details');
    }

    // Check final candidate count
    const finalCandidates = await User.find({ userType: 'candidate', status: 'active' })
      .select('name email location profile.skills title')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Final Active Candidates: ${finalCandidates.length}\n`);
    
    finalCandidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name}`);
      console.log(`   Email: ${candidate.email}`);
      console.log(`   Location: ${candidate.location || 'Not specified'}`);
      console.log(`   Title: ${candidate.title || 'Not specified'}`);
      console.log(`   Skills: ${candidate.profile?.skills?.join(', ') || 'None listed'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupAndUpdateCandidates();