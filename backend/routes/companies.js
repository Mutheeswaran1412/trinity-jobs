import express from 'express';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

const router = express.Router();

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    console.log('Fetching companies from Company collection');
    const { search, industry, employees, workSetting, isHiring } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    if (industry) query.industry = industry;
    if (employees) query.employees = employees;
    if (workSetting) query.workSetting = workSetting;
    if (isHiring === 'true') query.isHiring = true;

    const companies = await Company.find(query).sort({ name: 1 });
    console.log('Found companies:', companies.length);
    
    // Add job count for each company
    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ 
          company: company.name, 
          isActive: true 
        });
        return {
          ...company.toObject(),
          openJobs: jobCount
        };
      })
    );

    res.json(companiesWithJobs);
  } catch (error) {
    console.error('Companies route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/companies - Create new company
router.post('/', async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;