import express from 'express';
import { analyzeMistralResume } from '../utils/mistralResumeAI.js';

const router = express.Router();

// POST /api/resume/analyze - Mistral AI resume analysis
router.post('/analyze', async (req, res) => {
  try {
    const { resumeText, userProfile } = req.body;
    
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume content too short or missing' });
    }
    
    // Analyze with Mistral AI
    const analysis = await analyzeMistralResume(resumeText, userProfile || {});
    
    res.json({
      message: 'Resume analyzed successfully',
      analysis,
      status: analysis.recommendation === 'approve' ? 'approved' : 
              analysis.recommendation === 'reject' ? 'rejected' : 'pending'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/resume/parse-profile - Parse resume to profile data
router.post('/parse-profile', async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume content too short for parsing' });
    }
    
    const { resumeParser } = await import('../utils/resumeParserAI.js');
    const profileData = await resumeParser.parseResumeToProfile(resumeText);
    
    res.json({
      message: 'Resume parsed successfully',
      profileData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/resume/upload - Simple upload endpoint
router.post('/upload', async (req, res) => {
  try {
    const { fileName, fileSize, resumeText, userId } = req.body;
    
    res.json({
      message: 'Resume uploaded successfully',
      resume: {
        id: Date.now().toString(),
        filename: fileName || 'resume.pdf',
        originalName: fileName || 'Resume.pdf',
        fileSize: fileSize || 0,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/resume/moderation - Mock moderation data
router.get('/moderation', async (req, res) => {
  try {
    res.json({
      resumes: [],
      pagination: {
        current: 1,
        total: 1,
        count: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;