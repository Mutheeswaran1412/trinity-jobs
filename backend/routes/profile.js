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
  bannerPhoto: String,
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const Profile = mongoose.model('Profile', ProfileSchema);

// Save/Update profile
router.post('/save', async (req, res) => {
  try {
    const { userId, email, ...profileData } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { $or: [{ userId }, { email }] },
      { userId, email, ...profileData, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
router.get('/:identifier', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      $or: [
        { userId: req.params.identifier },
        { email: req.params.identifier }
      ]
    });
    
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
