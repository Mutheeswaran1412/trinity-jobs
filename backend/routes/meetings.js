import express from 'express';
import { createZoomMeeting, createGoogleMeet } from '../services/meetingService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create Zoom meeting
router.post('/zoom/create', authenticateToken, async (req, res) => {
  try {
    const { scheduledDate, duration, topic } = req.body;
    
    const result = await createZoomMeeting({
      scheduledDate,
      duration,
      topic: topic || 'Interview Meeting'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Google Meet
router.post('/google-meet/create', authenticateToken, async (req, res) => {
  try {
    const { scheduledDate, duration, summary } = req.body;
    
    const result = await createGoogleMeet({
      scheduledDate,
      duration,
      summary: summary || 'Interview Meeting'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;