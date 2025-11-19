import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import pdfService from '../services/pdfService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// POST /api/resume/generate-pdf - Generate resume PDF
router.post('/generate-pdf', authenticateToken, [
  body('resumeData').notEmpty().withMessage('Resume data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resumeData } = req.body;
    const pdfBuffer = await pdfService.generateResumePDF(resumeData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/resume/enhance - Enhance resume with AI
router.post('/enhance', authenticateToken, [
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
      enhancement: enhancement,
      originalData: resumeData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;