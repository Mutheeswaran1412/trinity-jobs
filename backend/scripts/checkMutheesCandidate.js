import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

const checkMutheesCandidate = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Searching for muthees candidate...');
    
    const db = mongoose.connection.db;
    
    // Check Users collection
    const usersCollection = db.collection('users');
    const mutheesUsers = await usersCollection.find({
      $or: [
        { email: 'mutheeswaran1424@gmail.com' },
        { name: /muthees/i },
        { fullName: /muthees/i }
      ]
    }).toArray();
    
    console.log(`\n📋 Found ${mutheesUsers.length} users matching muthees:`);
    mutheesUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name || user.fullName || 'Not set'}`);
      console.log(`Email: ${user.email}`);
      console.log(`Location: ${user.location || 'Not set'}`);
      console.log(`Phone: ${user.phone || 'Not set'}`);
      console.log(`Title: ${user.title || user.jobTitle || 'Not set'}`);
      console.log(`Skills: ${user.skills ? JSON.stringify(user.skills) : 'No skills listed'}`);
      console.log(`Experience: ${user.experience || user.yearsExperience || 'Not set'}`);
      console.log(`Salary: ${user.salary || 'Not set'}`);
      console.log(`Job Type: ${user.jobType || user.employmentType || 'Not specified'}`);
      console.log(`Work Auth: ${user.workAuthorization || 'Not set'}`);
      console.log(`User Type: ${user.userType || 'Not set'}`);
      console.log(`Created: ${user.createdAt || 'Not set'}`);
    });
    
    // Check Profiles collection
    const profilesCollection = db.collection('profiles');
    const mutheesProfiles = await profilesCollection.find({
      $or: [
        { email: 'mutheeswaran1424@gmail.com' },
        { name: /muthees/i }
      ]
    }).toArray();
    
    console.log(`\n📋 Found ${mutheesProfiles.length} profiles matching muthees:`);
    mutheesProfiles.forEach((profile, index) => {
      console.log(`\n--- Profile ${index + 1} ---`);
      console.log(`ID: ${profile._id}`);
      console.log(`Name: ${profile.name || 'Not set'}`);
      console.log(`Email: ${profile.email}`);
      console.log(`Location: ${profile.location || 'Not set'}`);
      console.log(`Phone: ${profile.phone || 'Not set'}`);
      console.log(`Title: ${profile.title || 'Not set'}`);
      console.log(`Skills: ${profile.skills ? JSON.stringify(profile.skills) : 'No skills listed'}`);
      console.log(`Experience: ${profile.experience || profile.yearsExperience || 'Not set'}`);
      console.log(`Education: ${profile.education || 'Not set'}`);
      console.log(`Updated: ${profile.updatedAt || 'Not set'}`);
    });
    
    // If no complete profile found, suggest creating one
    if (mutheesUsers.length > 0 && mutheesProfiles.length === 0) {
      console.log('\n⚠️  User exists but no profile found. Creating profile from user data...');
      
      const user = mutheesUsers[0];
      const profileData = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name || user.fullName || 'muthees',
        phone: user.phone || '',
        location: user.location || 'Chennai, India',
        title: user.title || user.jobTitle || 'Software Developer',
        yearsExperience: user.experience || user.yearsExperience || '2+ years',
        skills: user.skills || [],
        experience: user.workExperience || '',
        education: user.education || '',
        certifications: user.certifications || '',
        workAuthorization: user.workAuthorization || '',
        securityClearance: user.securityClearance || '',
        salary: user.salary || '',
        jobType: user.jobType || user.employmentType || '',
        updatedAt: new Date()
      };
      
      const result = await profilesCollection.insertOne(profileData);
      console.log(`✅ Created profile with ID: ${result.insertedId}`);
    }
    
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('Error checking candidate:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkMutheesCandidate();