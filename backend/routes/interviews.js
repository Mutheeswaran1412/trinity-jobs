import express from 'express';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { meetingService } from '../services/meetingService.js';
import { sendInterviewScheduledEmail } from '../services/emailService.js';

const router = express.Router();

// GET /api/interviews - Get interviews for employer
router.get('/', async (req, res) => {
  try {
    const { employerId, employerEmail } = req.query;
    
    const interviews = await Interview.find({ employerId })
      .populate('jobId', 'jobTitle title company')
      .populate('candidateId', 'name email')
      .sort({ scheduledDate: -1 });
    
    res.json(interviews);
  } catch (error) {
    console.error('Interviews API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      interviews: []
    });
  }
});

// GET /api/interviews/my-interviews - Get user's interviews
router.get('/my-interviews', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    const interviews = await Interview.find({
      $or: [{ candidateId: userId }, { employerId: userId }]
    })
      .populate('jobId', 'jobTitle title company')
      .populate('candidateId', 'name email')
      .populate('employerId', 'name email company')
      .sort({ scheduledDate: -1 });
    
    res.json(interviews);
  } catch (error) {
    console.error('My interviews API error:', error);
    res.status(500).json([]);
  }
});

// POST /api/interviews/schedule - Schedule new interview
router.post('/schedule', async (req, res) => {
  try {
    const { applicationId, candidateId, candidateEmail, jobId, scheduledDate, duration, type, meetingLink, location, notes } = req.body;
    
    // Get application details
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Get candidate details
    const candidate = await User.findById(candidateId || application.candidateId);
    const job = await Job.findById(application.jobId);

    // Create interview
    const interview = new Interview({
      jobId: application.jobId,
      candidateId: candidateId || application.candidateId,
      employerId: application.employerId,
      applicationId,
      scheduledDate,
      duration: duration || 60,
      type: type || 'video',
      meetingLink,
      location,
      notes,
      status: 'scheduled',
      employerConfirmed: true
    });

    await interview.save();
    
    // Send email to candidate
    if (candidate && candidate.email) {
      await sendInterviewScheduledEmail(
        candidate.email,
        candidate.name || candidateEmail,
        job?.jobTitle || job?.title || 'Position',
        job?.company || 'Company',
        { scheduledDate, duration, type, meetingLink, location, notes }
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Interview scheduled successfully and email sent to candidate',
      interview 
    });
  } catch (error) {
    console.error('Schedule interview API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/interviews/create-with-meeting - Schedule interview with Zoom meeting
router.post('/create-with-meeting', async (req, res) => {
  try {
    const { applicationId, candidateId, candidateEmail, jobId, scheduledDate, duration, type, platform, notes } = req.body;
    
    let meetingLink = '';
    
    // Create Zoom meeting if type is video
    if (type === 'video' && platform === 'zoom') {
      const meetingResult = await meetingService.createZoomMeeting({
        topic: 'Interview Meeting',
        start_time: scheduledDate,
        duration: duration || 60,
        description: notes || 'Interview meeting scheduled via ZyncJobs'
      });
      
      if (meetingResult.success) {
        meetingLink = meetingResult.meeting.join_url;
      }
    }

    // Get application details
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Get candidate details
    const candidate = await User.findById(candidateId || application.candidateId);
    const job = await Job.findById(application.jobId);

    // Create interview
    const interview = new Interview({
      jobId: application.jobId,
      candidateId: candidateId || application.candidateId,
      employerId: application.employerId,
      applicationId,
      scheduledDate,
      duration: duration || 60,
      type: type || 'video',
      meetingLink,
      notes,
      status: 'scheduled',
      employerConfirmed: true
    });

    await interview.save();
    
    // Send email to candidate
    if (candidate && candidate.email) {
      await sendInterviewScheduledEmail(
        candidate.email,
        candidate.name || candidateEmail,
        job?.jobTitle || job?.title || 'Position',
        job?.company || 'Company',
        { scheduledDate, duration, type, meetingLink, notes }
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Interview scheduled successfully with meeting link and email sent',
      interview,
      meetingLink
    });
  } catch (error) {
    console.error('Create interview with meeting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/interviews/:id/confirm - Confirm interview
router.patch('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findByIdAndUpdate(
      id,
      { candidateConfirmed: true, status: 'confirmed' },
      { new: true }
    );
    res.json({ success: true, message: 'Interview confirmed', interview });
  } catch (error) {
    console.error('Confirm interview API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/interviews/:id/reschedule - Reschedule interview
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;
    const interview = await Interview.findByIdAndUpdate(
      id,
      { scheduledDate, status: 'rescheduled' },
      { new: true }
    );
    res.json({ success: true, message: 'Interview rescheduled', interview });
  } catch (error) {
    console.error('Reschedule interview API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/interviews/:id/status - Update interview status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const interview = await Interview.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    res.json({ success: true, interview });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;