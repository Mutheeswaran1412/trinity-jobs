import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { sendJobApplicationEmail, sendApplicationRejectionEmail, sendApplicationStatusEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/applications - Submit job application
router.post('/', [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('candidateName').notEmpty().withMessage('Name is required'),
  body('candidateEmail').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, candidateName, candidateEmail, candidatePhone, coverLetter, candidateId, resumeUrl } = req.body;

    // Check for duplicate application
    const existingApplication = await Application.findOne({ jobId, candidateEmail });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Create application
    const application = new Application({
      jobId: new mongoose.Types.ObjectId(jobId),
      candidateId: candidateId ? new mongoose.Types.ObjectId(candidateId) : null,
      candidateName,
      candidateEmail,
      candidatePhone: candidatePhone || '',
      employerId: job.employerId || null,
      employerEmail: job.employerEmail || '',
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'pending'
    });

    await application.save();

    // Update user's appliedJobs array
    if (candidateId) {
      await User.findByIdAndUpdate(candidateId, {
        $push: {
          appliedJobs: {
            jobId: new mongoose.Types.ObjectId(jobId),
            appliedAt: new Date(),
            status: 'pending'
          }
        }
      });
    }

    // Send confirmation email (don't fail if email fails)
    try {
      await sendJobApplicationEmail(
        candidateEmail, 
        candidateName, 
        job.jobTitle || job.title, 
        job.company
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(201).json({ 
      message: 'Application submitted successfully! Check your email for confirmation.',
      application 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/candidate/:email - Get applications by candidate email
router.get('/candidate/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    console.log('Fetching applications for email:', email);
    
    const applications = await Application.find({ 
      candidateEmail: { $regex: new RegExp(`^${email}$`, 'i') }
    })
      .populate('jobId', 'jobTitle title company location')
      .sort({ createdAt: -1 });
    
    console.log('Found applications:', applications.length);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/job/:jobId - Get applications for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // Update user's appliedJobs status
    if (application.candidateId) {
      await User.findOneAndUpdate(
        { _id: application.candidateId, 'appliedJobs.jobId': application.jobId },
        { 
          $set: { 
            'appliedJobs.$.status': status,
            'appliedJobs.$.updatedAt': new Date()
          } 
        }
      );
    }

    // Send email notification (don't fail if email fails)
    try {
      if (status === 'rejected') {
        await sendApplicationRejectionEmail(
          application.candidateEmail,
          application.candidateName,
          application.jobId.jobTitle || application.jobId.title,
          application.jobId.company
        );
      } else if (['reviewed', 'shortlisted', 'hired'].includes(status)) {
        await sendApplicationStatusEmail(
          application.candidateEmail,
          application.candidateName,
          application.jobId.jobTitle || application.jobId.title,
          application.jobId.company,
          status
        );
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.json({ 
      message: `Application status updated to ${status}. Email notification sent to candidate.`,
      application,
      oldStatus,
      newStatus: status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/applications/:id - Update application (for candidates)
router.put('/:id', [
  body('coverLetter').optional().isLength({ max: 1000 }).withMessage('Cover letter must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coverLetter } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only allow editing if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot edit application after it has been reviewed' });
    }

    application.coverLetter = coverLetter;
    await application.save();

    res.json({ 
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications - Get all applications (for admin/employer)
router.get('/', async (req, res) => {
  try {
    const { status, jobId, employerId, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;
    if (employerId) query.employerId = employerId;

    const applications = await Application.find(query)
      .populate('jobId', 'jobTitle title company location')
      .populate('candidateId', 'name email phone location skills')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
