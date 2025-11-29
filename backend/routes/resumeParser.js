import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import resumeParserService from '../services/resumeParserService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/resumes';
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created uploads directory:', uploadDir);
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/resume/parse - Parse resume and match jobs
router.post('/parse', upload.single('resume'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    filePath = req.file.path;
    console.log('Processing resume:', req.file.originalname);
    
    // Parse resume
    const parsedResume = await resumeParserService.parseResume(filePath);
    console.log('Resume parsed successfully');
    
    // Match jobs
    const jobMatches = await resumeParserService.matchJobsToResume(parsedResume);
    console.log(`Found ${jobMatches.matchCount} matching jobs`);
    
    // Calculate match scores
    const jobsWithScores = jobMatches.matchingJobs.map(job => {
      const jobObj = job.toObject ? job.toObject() : job;
      return {
        ...jobObj,
        matchScore: resumeParserService.calculateMatchScore(job, jobMatches.extractedSkills)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      parsedData: {
        email: parsedResume.email || '',
        phone: parsedResume.phone || '',
        name: parsedResume.name || '',
        extractedSkills: jobMatches.extractedSkills || []
      },
      jobMatches: {
        count: jobMatches.matchCount || 0,
        jobs: jobsWithScores || []
      }
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Resume parsing failed',
      details: error.message,
      success: false
    });
  }
});

// POST /api/resume/match-skills - Match jobs based on skills
router.post('/match-skills', async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    const mockParsedResume = { text: skills.join(' ') };
    const jobMatches = await resumeParserService.matchJobsToResume(mockParsedResume);
    
    const jobsWithScores = jobMatches.matchingJobs.map(job => ({
      ...job.toObject(),
      matchScore: resumeParserService.calculateMatchScore(job, skills)
    })).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      matchingJobs: jobsWithScores,
      matchCount: jobMatches.matchCount
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Job matching failed',
      details: error.message 
    });
  }
});

export default router;