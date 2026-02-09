import express from 'express';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// Save/Update profile
router.post('/save', async (req, res) => {
  try {
    const { userId, email, ...profileData } = req.body;
    console.log('Profile save request:', { userId, email, hasProfilePhoto: !!profileData.profilePhoto });
    
    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email required' });
    }
    
    // Save to Profile collection
    const [profile] = await Profile.upsert({
      userId, 
      email, 
      ...profileData
    });
    
    // Also update User collection with key fields
    await User.update({
      name: profileData.name,
      phone: profileData.phone,
      location: profileData.location,
      title: profileData.title,
      skills: profileData.skills,
      profilePicture: profileData.profilePhoto
    }, {
      where: { id: userId }
    });
    
    console.log('Profile saved successfully:', profile.id);
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
    
    const { Op } = await import('sequelize');
    let profile = await Profile.findOne({
      where: {
        [Op.or]: [
          { userId: identifier },
          { email: identifier }
        ]
      }
    });
    
    if (profile) {
      console.log('Profile found:', profile.id);
      res.json(profile);
    } else {
      console.log('Profile not found for identifier:', identifier);
      // Create a basic profile entry if it doesn't exist
      if (identifier.includes('@')) {
        profile = await Profile.create({
          email: identifier
        });
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
