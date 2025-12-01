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
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    // For compatibility with frontend, return just the jobs array
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs - Create new job (Employers and Admins only)
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
      status: 'pending', // All jobs start as pending for admin review
      employerEmail: req.body.employerEmail || req.user?.email || 'employer@test.com'
    };
    
    // Only add employerId if it's a valid ObjectId
    if (req.user?.id && req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
      jobData.employerId = req.user.id;
    }
    
    const job = new Job(jobData);
    
    // Auto-moderate with Mistral AI on creation
    console.log('🤖 Starting Mistral AI job analysis for:', jobData.jobTitle);
    try {
      const mistralAnalysis = await mistralDetector.detectJobIssues(jobData);
      console.log('✅ Mistral AI Analysis Result:', mistralAnalysis);
      
      job.moderationFlags = {
        isSpam: mistralAnalysis.isSpam,
        isFake: mistralAnalysis.isFake,
        hasComplianceIssues: mistralAnalysis.hasComplianceIssues,
        isDuplicate: false
      };
      
      // Only auto-approve very clean jobs, otherwise keep pending for admin review
      if (mistralAnalysis.recommendation === 'approve' && mistralAnalysis.riskScore < 20) {
        job.status = 'approved';
        console.log('✅ Job auto-approved by Mistral AI');
      } else {
        console.log('⏳ Job kept pending for admin review. Risk score:', mistralAnalysis.riskScore);
      }
    } catch (error) {
      console.error('❌ Mistral moderation failed:', error.message);
      // Keep as pending if AI fails
    }
    
    await job.save();
    res.status(201).json(job);
  } catch (error) {
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

    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(20);
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
    }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;