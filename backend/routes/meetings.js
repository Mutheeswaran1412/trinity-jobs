import express from 'express';
import { meetingService } from '../services/meetingService.js';

const router = express.Router();

// Create meeting (supports both Zoom and Google Meet)
router.post('/create', async (req, res) => {
  try {
    const { platform, topic, start_time, duration, description } = req.body;
    
    if (!platform) {
      return res.status(400).json({ 
        success: false, 
        error: 'Platform is required (zoom or googlemeet)' 
      });
    }
    
    const result = await meetingService.createMeeting({
      platform,
      topic: topic || 'Interview Meeting',
      start_time,
      duration: duration || 60,
      description: description || 'Interview meeting'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Zoom meeting (legacy endpoint)
router.post('/zoom/create', async (req, res) => {
  try {
    const { scheduledDate, duration, topic, start_time } = req.body;
    
    const result = await meetingService.createZoomMeeting({
      start_time: start_time || scheduledDate,
      duration,
      topic: topic || 'Interview Meeting'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Google Meet (legacy endpoint)
router.post('/google-meet/create', async (req, res) => {
  try {
    const { scheduledDate, duration, summary, start_time } = req.body;
    
    const result = await meetingService.createGoogleMeet({
      start_time: start_time || scheduledDate,
      duration,
      topic: summary || 'Interview Meeting'
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;