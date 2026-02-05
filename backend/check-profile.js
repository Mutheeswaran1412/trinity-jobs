import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkProfileUpdates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for your profile
    const email = 'mutheeswaran124@gmail.com';
    console.log(`\n🔍 Checking profile for: ${email}`);
    
    const user = await User.findOne({ 
      $or: [
        { email: { $regex: new RegExp(email, 'i') } },
        { email: email }
      ]
    });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name || 'Not set'}`);
      console.log(`📍 Location: ${user.location || 'Not set'}`);
      console.log(`📱 Phone: ${user.phone || 'Not set'}`);
      console.log(`🎂 Birthday: ${user.birthday || 'Not set'}`);
      console.log(`⚧️ Gender: ${user.gender || 'Not set'}`);
      console.log(`🏫 College: ${user.college || 'Not set'}`);
      console.log(`🎓 Degree: ${user.degree || 'Not set'}`);
      console.log(`📸 Profile Photo: ${user.profilePhoto ? 'Set' : 'Not set'}`);
      console.log(`🔧 Skills: ${user.skills ? user.skills.join(', ') : 'Not set'}`);
      console.log(`📄 Resume: ${user.resume ? 'Uploaded' : 'Not uploaded'}`);
      console.log(`📝 Profile Summary: ${user.profileSummary ? 'Set' : 'Not set'}`);
      console.log(`💼 Employment: ${user.employment || user.experience ? 'Set' : 'Not set'}`);
      console.log(`🏗️ Projects: ${user.projects ? 'Set' : 'Not set'}`);
      console.log(`🎯 Internships: ${user.internships ? 'Set' : 'Not set'}`);
      console.log(`🗣️ Languages: ${user.languages ? 'Set' : 'Not set'}`);
      console.log(`🏆 Certifications: ${user.certifications ? 'Set' : 'Not set'}`);
      console.log(`🥇 Awards: ${user.awards ? 'Set' : 'Not set'}`);
      console.log(`🎪 Clubs & Committees: ${user.clubsCommittees ? 'Set' : 'Not set'}`);
      console.log(`📊 Competitive Exams: ${user.competitiveExams ? 'Set' : 'Not set'}`);
      console.log(`🎓 Academic Achievements: ${user.academicAchievements ? 'Set' : 'Not set'}`);
      console.log(`📅 Last Updated: ${user.updatedAt || user.createdAt}`);
      
      // Calculate completion percentage
      const fields = ['name', 'email', 'location', 'phone', 'birthday', 'gender', 'college', 'degree', 'profilePhoto', 'skills', 'resume', 'profileSummary', 'employment', 'projects', 'internships', 'languages', 'certifications'];
      const completed = fields.filter(field => {
        const value = user[field];
        return value && (Array.isArray(value) ? value.length > 0 : value.toString().length > 0);
      }).length;
      
      const percentage = Math.round((completed / fields.length) * 100);
      console.log(`\n📊 Profile Completion: ${percentage}% (${completed}/${fields.length} fields)`);
      
    } else {
      console.log('❌ User not found in database');
      
      // Check all users to see what's in the database
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('name email phone').limit(10);
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name || 'No name'} - ${u.email} - ${u.phone || 'No phone'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkProfileUpdates();