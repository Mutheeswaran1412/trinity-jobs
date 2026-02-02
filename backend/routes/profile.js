import express from 'express';
import mongoose from 'mongoose';

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
    
    const profile = await Profile.findOneAndUpdate(
      { $or: [{ userId }, { email }] },
      { userId, email, ...profileData, updatedAt: new Date() },
      { upsert: true, new: true }
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
