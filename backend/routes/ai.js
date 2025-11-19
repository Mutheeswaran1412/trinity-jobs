import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/enhance-resume - Enhance resume with AI
router.post('/enhance-resume', authenticateToken, [
  body('resumeData').notEmpty().withMessage('Resume data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resumeData } = req.body;
    const enhancement = await aiService.enhanceResume(resumeData);

    res.json({
      success: true,
      enhancement: enhancement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/generate-job-description - Generate job description
router.post('/generate-job-description', authenticateToken, [
  body('jobTitle').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobTitle, company, requirements } = req.body;
    const jobDescription = await aiService.generateJobDescription(jobTitle, company, requirements);

    res.json({
      success: true,
      jobDescription: jobDescription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/career-advice - Get career advice
router.post('/career-advice', authenticateToken, [
  body('query').notEmpty().withMessage('Query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.body;
    const advice = await aiService.provideCareerAdvice(query, req.user);

    res.json({
      success: true,
      advice: advice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/match-jobs - Match jobs to candidate
router.post('/match-jobs', authenticateToken, async (req, res) => {
  try {
    const { jobListings } = req.body;
    const matches = await aiService.matchJobs(req.user, jobListings);

    res.json({
      success: true,
      matches: matches
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;