import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { requireRole, requirePermission, PERMISSIONS } from '../middleware/roleAuth.js';
import { mistralDetector } from '../utils/mistralJobDetector.js';

const router = express.Router();

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, location, jobType, search } = req.query;
    const query = { isActive: true, status: 'approved' };

    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (search) {
      query.$text = { $search: search };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Job.countDocuments(query);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs - Create new job (Auto-assign to mutheeswaran124@gmail.com)
router.post('/', [
  body('jobTitle').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      status: 'approved', // Auto-approve all jobs
      employerEmail: 'mutheeswaran124@gmail.com', // Always assign to this employer
      postedBy: 'Mutheeswaran',
      employerCompany: 'Trinity Technology',
      isActive: true
    };
    
    const job = new Job(jobData);
    
    // Set moderation flags to approved
    job.moderationFlags = {
      isSpam: false,
      isFake: false,
      hasComplianceIssues: false,
      isDuplicate: false
    };
    
    await job.save();
    console.log('Job automatically created and assigned to mutheeswaran124@gmail.com:', job._id);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/jobs/search - Search jobs
router.get('/search/query', async (req, res) => {
  try {
    const { q, location } = req.query;
    const query = { isActive: true, status: 'approved' };

    if (q || location) {
      const searchConditions = [];
      
      if (q) {
        searchConditions.push(
          { jobTitle: { $regex: q, $options: 'i' } },
          { company: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { skills: { $in: [new RegExp(q, 'i')] } }
        );
      }
      
      if (location) {
        searchConditions.push({ location: { $regex: location, $options: 'i' } });
      }
      
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(20).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/employer/:employerId - Get jobs posted by specific employer
router.get('/employer/:employerId', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      employerId: req.params.employerId,
      isActive: true,
      status: { $in: ['approved', 'pending'] }
    }).sort({ createdAt: -1 }).lean();
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/employer/email/:email - Get jobs by employer email
router.get('/employer/email/:email', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      employerEmail: req.params.email,
      isActive: true,
      status: { $in: ['approved', 'pending'] }
    }).sort({ createdAt: -1 }).lean();
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/my-jobs - Get jobs for mutheeswaran124@gmail.com
router.get('/my-jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      employerEmail: 'mutheeswaran124@gmail.com',
      isActive: true
    }).sort({ createdAt: -1 }).lean();
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;