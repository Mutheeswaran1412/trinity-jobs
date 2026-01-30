import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

// GET /api/analytics/profile/:email - Get profile performance metrics
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { userType } = req.query;

    console.log('📊 Analytics request for:', email, 'userType:', userType);

    if (userType === 'employer') {
      // For employers: Jobs Posted and Applications Received
      const jobsPosted = await Job.countDocuments({ 
        $or: [
          { employerEmail: { $regex: new RegExp(email, 'i') } },
          { postedBy: { $regex: new RegExp(email, 'i') } },
          { 'employer.email': { $regex: new RegExp(email, 'i') } }
        ],
        isActive: { $ne: false }
      });

      const applicationsReceived = await Application.countDocuments({ 
        $or: [
          { employerEmail: { $regex: new RegExp(email, 'i') } },
          { 'employer.email': { $regex: new RegExp(email, 'i') } }
        ]
      });

      console.log('📈 Employer analytics result:', { jobsPosted, applicationsReceived, email });

      res.json({
        jobsPosted,
        applicationsReceived
      });
    } else {
      // For candidates: Real analytics from database
      const applicationsSent = await Application.countDocuments({ 
        candidateEmail: { $regex: new RegExp(email, 'i') }
      });

      // Get real analytics data from database
      const searchAppearances = await Analytics.countDocuments({
        email: { $regex: new RegExp(email, 'i') },
        eventType: 'search_appearance'
      });

      const recruiterActions = await Analytics.countDocuments({
        email: { $regex: new RegExp(email, 'i') },
        eventType: 'recruiter_action'
      });

      console.log('📈 Candidate analytics result:', { applicationsSent, searchAppearances, recruiterActions, email });

      res.json({
        searchAppearances: searchAppearances || 0,
        recruiterActions: recruiterActions || 0
      });
    }
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;