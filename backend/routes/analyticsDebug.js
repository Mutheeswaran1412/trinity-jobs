import express from 'express';

const router = express.Router();

// Debug endpoint to check analytics data
router.get('/debug/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const Analytics = (await import('../models/Analytics.js')).default;
    
    // Get all analytics for this email
    const allAnalytics = await Analytics.find({
      email: { $regex: new RegExp(email, 'i') }
    }).sort({ createdAt: -1 });
    
    const searchAppearances = await Analytics.countDocuments({
      email: { $regex: new RegExp(email, 'i') },
      eventType: 'search_appearance'
    });

    const recruiterActions = await Analytics.countDocuments({
      email: { $regex: new RegExp(email, 'i') },
      eventType: 'recruiter_action'
    });
    
    res.json({
      email,
      totalRecords: allAnalytics.length,
      searchAppearances,
      recruiterActions,
      allData: allAnalytics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;