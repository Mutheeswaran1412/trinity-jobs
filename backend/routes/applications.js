import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
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

    const { jobId, candidateName, candidateEmail, candidatePhone, coverLetter } = req.body;

    console.log('📝 Creating application with data:', {
      jobId,
      candidateName,
      candidateEmail,
      candidatePhone,
      coverLetter
    });

    // Validate required fields
    if (!jobId || !candidateName || !candidateEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: jobId, candidateName, candidateEmail' 
      });
    }

    // Create application with minimal validation
    const application = new Application({
      jobId: jobId.toString(),
      candidateName: candidateName,
      candidateEmail: candidateEmail,
      candidatePhone: candidatePhone || '',
      coverLetter: coverLetter || '',
      status: 'pending'
    });

    await application.save();
    console.log('✅ Application saved successfully with ID:', application._id);

    // Get job details for email
    let jobTitle = 'Job Position';
    let company = 'Company';
    try {
      const job = await Job.findById(jobId);
      if (job) {
        jobTitle = job.jobTitle || job.title || 'Job Position';
        company = job.company || 'Company';
      }
    } catch (error) {
      console.log('Could not fetch job details for email');
    }

    // Send confirmation email
    await sendJobApplicationEmail(candidateEmail, candidateName, jobTitle, company);

    res.status(201).json({ 
      message: 'Application submitted successfully! Check your email for confirmation.',
      application 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/candidate/:email - Get applications by candidate email
router.get('/candidate/:email', async (req, res) => {
  try {
    const applications = await Application.find({ candidateEmail: req.params.email })
      .sort({ createdAt: -1 });
    
    // Manually populate job details since jobId is stored as string
    const populatedApplications = [];
    for (const app of applications) {
      try {
        const job = await Job.findById(app.jobId);
        const populatedApp = {
          ...app.toObject(),
          jobId: {
            _id: app.jobId,
            jobTitle: job?.jobTitle || job?.title || 'Job Position',
            company: job?.company || 'Company',
            location: job?.location || ''
          }
        };
        populatedApplications.push(populatedApp);
      } catch (jobError) {
        // If job not found, still include application with basic info
        populatedApplications.push({
          ...app.toObject(),
          jobId: {
            _id: app.jobId,
            jobTitle: 'Job Position',
            company: 'Company',
            location: ''
          }
        });
      }
    }
    
    res.json(populatedApplications);
  } catch (error) {
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

    // Find and update application
    const application = await Application.findById(applicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // Send email notification based on status
    if (status === 'rejected') {
      await sendApplicationRejectionEmail(
        application.candidateEmail,
        application.candidateName,
        application.jobId.jobTitle,
        application.jobId.company
      );
    } else if (['reviewed', 'shortlisted', 'hired'].includes(status)) {
      await sendApplicationStatusEmail(
        application.candidateEmail,
        application.candidateName,
        application.jobId.jobTitle,
        application.jobId.company,
        status
      );
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
    const { status, jobId, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    const applications = await Application.find(query)
      .populate('jobId', 'jobTitle company')
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
