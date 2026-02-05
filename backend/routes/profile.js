import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

const ProfileSchema = new mongoose.Schema({
  userId: String,
  email: String,
  name: String,
  phone: String,
  location: String,
  title: String,
  yearsExperience: String,
  skills: [String],
  experience: String,
  education: String,
  certifications: String,
  workAuthorization: String,
  securityClearance: String,
  employmentType: String,
  resume: Object,
  profilePhoto: String,
  profileFrame: String,
  coverPhoto: String,
  bannerPhoto: String,
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const Profile = mongoose.model('Profile', ProfileSchema);

// Save/Update profile
router.post('/save', async (req, res) => {
  try {
    const { userId, email, ...profileData } = req.body;
    console.log('Profile save request:', { userId, email, hasProfilePhoto: !!profileData.profilePhoto });
    
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email required' });
    }
    
    // Save to Profile collection
    const profile = await Profile.findOneAndUpdate(
      { $or: [{ userId }, { email }] },
      { userId, email, ...profileData, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    // Also update User collection with key fields
    await User.findOneAndUpdate(
      { $or: [{ _id: userId }, { email }] },
      {
        $set: {
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          title: profileData.title,
          'profile.skills': profileData.skills,
          'profile.experienceYears': profileData.yearsExperience,
          'profile.bio': profileData.experience,
          'profile.resumeData': profileData.resume,
          // Add comprehensive fields
          profileSummary: profileData.profileSummary,
          employment: profileData.employment,
          projects: profileData.projects,
          internships: profileData.internships,
          languages: profileData.languages,
          certifications: profileData.certifications,
          awards: profileData.awards,
          clubsCommittees: profileData.clubsCommittees,
          competitiveExams: profileData.competitiveExams,
          academicAchievements: profileData.academicAchievements,
          birthday: profileData.birthday,
          gender: profileData.gender,
          college: profileData.college,
          degree: profileData.degree,
          profilePhoto: profileData.profilePhoto,
          profileFrame: profileData.profileFrame
        }
      },
      { upsert: false }
    );
    
    console.log('Profile saved successfully:', profile._id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get profile
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    console.log('Profile get request for identifier:', identifier);
    
    let profile = await Profile.findOne({
      $or: [
        { userId: identifier },
        { email: identifier }
      ]
    });
    
    if (profile) {
      console.log('Profile found:', profile._id);
      res.json(profile);
    } else {
      console.log('Profile not found for identifier:', identifier);
      // Create a basic profile entry if it doesn't exist
      if (identifier.includes('@')) {
        profile = new Profile({
          email: identifier,
          updatedAt: new Date()
        });
        await profile.save();
        console.log('Created new profile for:', identifier);
        res.json(profile);
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    }
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
