import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { requireRole, requirePermission, PERMISSIONS } from '../middleware/roleAuth.js';
import { mistralDetector } from '../utils/mistralJobDetector.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load companies data for logo lookup
let companiesData = [];
try {
  const companiesPath = path.join(__dirname, '../data/companies.json');
  const rawData = fs.readFileSync(companiesPath, 'utf8');
  companiesData = JSON.parse(rawData);
} catch (error) {
  console.error('Error loading companies data:', error);
}

// GET /api/jobs/titles - Get all job titles (MUST be before /:id route)
router.get('/titles', (req, res) => {
  try {
    const titlesPath = path.join(__dirname, '../data/job_titles.json');
    const rawData = fs.readFileSync(titlesPath, 'utf8');
    const data = JSON.parse(rawData);
    res.json({ job_titles: data.job_titles || [] });
  } catch (error) {
    console.error('Error loading job titles:', error);
    res.json({ job_titles: [] });
  }
});

// GET /api/jobs/countries - Get all countries (MUST be before /:id route)
router.get('/countries', (req, res) => {
  try {
    const locationsPath = path.join(__dirname, '../data/locations.json');
    const rawData = fs.readFileSync(locationsPath, 'utf8');
    const data = JSON.parse(rawData);
    res.json({ countries: data.locations || [] });
  } catch (error) {
    console.error('Error loading locations:', error);
    res.json({ countries: [] });
  }
});

// GET /api/jobs/search - Search jobs (MUST be before /:id route)
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
    
    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));
    
    res.json(jobsWithLogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate job code
function generateJobCode(jobTitle, company) {
  const titleCode = jobTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const companyCode = company.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${titleCode}${companyCode}${timestamp}${randomNum}`;
}

// Helper function to get company logo
function getCompanyLogo(companyName) {
  if (!companyName) return null;
  
  const company = companiesData.find(c => 
    c.name.toLowerCase().trim() === companyName.toLowerCase().trim() ||
    c.name.toLowerCase().includes(companyName.toLowerCase()) ||
    companyName.toLowerCase().includes(c.name.toLowerCase())
  );
  
  return company ? company.logo : null;
}

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

    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));

    const total = await Job.countDocuments(query);

    res.json(jobsWithLogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get single job (MUST be after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Add company logo
    const jobWithLogo = {
      ...job,
      companyLogo: getCompanyLogo(job.company)
    };
    
    res.json(jobWithLogo);
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
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get employer info from request body or headers
    const employerEmail = req.body.employerEmail || req.headers['x-employer-email'];
    const employerName = req.body.employerName || req.headers['x-employer-name'];
    const employerCompany = req.body.employerCompany || req.body.company;

    if (!employerEmail) {
      return res.status(400).json({ error: 'Employer email is required' });
    }

    const jobData = {
      ...req.body,
      status: 'approved',
      employerEmail: employerEmail,
      postedBy: employerEmail,
      employerCompany: employerCompany,
      experience: req.body.experienceRange || req.body.experience,
      experienceLevel: req.body.experienceRange || req.body.experience,
      isActive: true,
      jobCode: generateJobCode(req.body.jobTitle, req.body.company)
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
    console.log('Job created for employer:', employerEmail, 'Job ID:', job._id);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/jobs/search - Search jobs (MUST be before /:id route)
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
    
    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));
    
    res.json(jobsWithLogos);
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
    
    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));
    
    res.json(jobsWithLogos);
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
    
    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));
    
    res.json(jobsWithLogos);
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
    
    // Add company logos to jobs
    const jobsWithLogos = jobs.map(job => ({
      ...job,
      companyLogo: getCompanyLogo(job.company)
    }));
    
    res.json(jobsWithLogos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete job from database
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;