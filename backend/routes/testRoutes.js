import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// POST /api/test/update-status - Test endpoint to update application status
router.post('/update-status', async (req, res) => {
  try {
    const { applicationId, status, note, updatedBy } = req.body;
    
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status
    application.status = status;
    
    // Add to timeline
    application.timeline.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: updatedBy || 'Test User'
    });
    
    await application.save();
    
    res.json({ 
      message: 'Status updated successfully',
      application 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    
  }
});

// GET /api/test/applications - Get all applications for testing
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'jobTitle company')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;