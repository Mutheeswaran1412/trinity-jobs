import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';

const router = express.Router();

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, location, jobType, search } = req.query;
    const query = { isActive: true };

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

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
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

// POST /api/jobs - Create new job
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

    const job = new Job(req.body);
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
    const query = { isActive: true };

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

export default router;