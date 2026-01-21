import express from 'express';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

// Schedule interview
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { jobId, candidateId, applicationId, scheduledDate, duration, type, meetingLink, location, notes } = req.body;
    
    const interview = new Interview({
      jobId,
      candidateId,
      employerId: req.user.id,
      applicationId,
      scheduledDate: new Date(scheduledDate),
      duration,
      type,
      meetingLink,
      location,
      notes
    });
    
    await interview.save();
    await interview.populate(['jobId', 'candidateId', 'employerId']);
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get interviews for user
router.get('/my-interviews', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'employer' 
      ? { employerId: req.user.id }
      : { candidateId: req.user.id };
    
    const interviews = await Interview.find(query)
      .populate('jobId', 'title company')
      .populate('candidateId', 'name email')
      .populate('employerId', 'name email')
      .sort({ scheduledDate: 1 });
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm interview
router.patch('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    
    if (req.user.role === 'employer' && interview.employerId.toString() === req.user.id) {
      interview.employerConfirmed = true;
    } else if (interview.candidateId.toString() === req.user.id) {
      interview.candidateConfirmed = true;
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (interview.candidateConfirmed && interview.employerConfirmed) {
      interview.status = 'confirmed';
    }
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule interview
router.patch('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { scheduledDate, notes } = req.body;
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    
    interview.scheduledDate = new Date(scheduledDate);
    interview.status = 'rescheduled';
    interview.notes = notes || interview.notes;
    interview.candidateConfirmed = false;
    interview.employerConfirmed = false;
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel interview
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    
    interview.status = 'cancelled';
    interview.notes = reason || interview.notes;
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback
router.patch('/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, notes, decision } = req.body;
    const interview = await Interview.findById(req.params.id);
    
    if (!interview || interview.employerId.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    interview.feedback = {
      rating,
      notes,
      decision,
      submittedBy: req.user.id,
      submittedAt: new Date()
    };
    interview.status = 'completed';
    
    await interview.save();
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available time slots
router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const { date, employerId } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const bookedSlots = await Interview.find({
      employerId: employerId || req.user.id,
      scheduledDate: { $gte: startDate, $lt: endDate },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('scheduledDate duration');
    
    // Generate available slots (9 AM to 5 PM, 1-hour intervals)
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const slotTime = new Date(startDate);
      slotTime.setHours(hour, 0, 0, 0);
      
      const isBooked = bookedSlots.some(slot => {
        const slotStart = new Date(slot.scheduledDate);
        const slotEnd = new Date(slotStart.getTime() + slot.duration * 60000);
        return slotTime >= slotStart && slotTime < slotEnd;
      });
      
      if (!isBooked) {
        slots.push(slotTime.toISOString());
      }
    }
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;