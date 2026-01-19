import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const removePriyaCandidate = async () => {
  try {
    await connectDB();
    
    console.log('Searching for Priya Sharma candidate...');
    
    // Search for candidates with name "Priya Sharma" or similar
    const candidates = await User.find({
      $or: [
        { name: /priya.*sharma/i },
        { fullName: /priya.*sharma/i },
        { location: /bangalore.*india/i }
      ],
      userType: 'candidate'
    });
    
    console.log(`Found ${candidates.length} matching candidates:`);
    candidates.forEach(candidate => {
      console.log(`- ID: ${candidate._id}`);
      console.log(`  Name: ${candidate.name || candidate.fullName}`);
      console.log(`  Email: ${candidate.email}`);
      console.log(`  Location: ${candidate.location}`);
      console.log(`  Skills: ${candidate.skills || 'No skills listed'}`);
      console.log('---');
    });
    
    if (candidates.length > 0) {
      // Remove the candidates
      const result = await User.deleteMany({
        $or: [
          { name: /priya.*sharma/i },
          { fullName: /priya.*sharma/i }
        ],
        userType: 'candidate'
      });
      
      console.log(`✅ Removed ${result.deletedCount} unofficial candidate(s)`);
    } else {
      console.log('No Priya Sharma candidates found in database');
    }
    
  } catch (error) {
    console.error('Error removing candidate:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

removePriyaCandidate();