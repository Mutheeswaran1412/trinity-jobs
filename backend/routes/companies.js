import express from 'express';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load companies from JSON file
let popularCompanies = [];
try {
  const companiesPath = path.join(__dirname, '../data/companies.json');
  const data = fs.readFileSync(companiesPath, 'utf8');
  popularCompanies = JSON.parse(data);
  console.log(`✅ Loaded ${popularCompanies.length} companies from JSON`);
} catch (error) {
  console.error('❌ Error loading companies.json:', error.message);
}

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    console.log('Fetching companies from Company collection');
    const { search, industry, employees, workSetting, isHiring } = req.query;
    
    // If search query, return popular companies + DB results
    if (search) {
      const query = search.toLowerCase();
      
      // Search in popular companies from JSON
      const popularMatches = popularCompanies
        .filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.domain.toLowerCase().includes(query)
        )
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          name: c.name,
          domain: c.domain,
          logo: `https://img.logo.dev/${c.domain}?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
          followers: 10000,
          source: 'json'
        }));
      
      // Search in database
      const dbQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } }
        ]
      };
      
      const dbCompanies = await Company.find(dbQuery).limit(5).sort({ name: 1 });
      const dbMatches = dbCompanies.map(c => {
        const domain = c.website ? c.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : null;
        return {
          id: c._id.toString(),
          name: c.name,
          domain: domain,
          logo: c.logo || (domain ? `https://img.logo.dev/${domain}?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200` : ''),
          followers: c.followers || 5000,
          source: 'database'
        };
      });
      
      // Combine and deduplicate
      const allMatches = [...popularMatches, ...dbMatches];
      const uniqueMatches = Array.from(
        new Map(allMatches.map(item => [item.name.toLowerCase(), item])).values()
      ).slice(0, 10);
      
      return res.json(uniqueMatches);
    }
    
    // Regular query without search
    const query = {};
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