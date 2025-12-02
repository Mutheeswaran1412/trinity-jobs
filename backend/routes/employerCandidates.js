import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { AIScoring } from '../utils/aiScoring.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = express.Router();

// GET /api/employer/jobs/:jobId/applicants - Get job applicants
router.get('/jobs/:jobId/applicants', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all users who applied to this job
    const applicants = await User.find({
      'appliedJobs.jobId': req.params.jobId,
      userType: 'candidate'
    }).select('-password -refreshTokens');

    // Add AI scoring for each applicant
    const applicantsWithScores = applicants.map(applicant => {
      const application = applicant.appliedJobs.find(app => app.jobId.toString() === req.params.jobId);
      const aiScore = AIScoring.calculateOverallScore(applicant, job);
      
      return {
        ...applicant.toObject(),
        application,
        aiScore: aiScore.overall,
        aiRecommendation: aiScore.recommendation,
        aiConfidence: aiScore.confidence,
        matchScore: AIScoring.scoreMatch(applicant, job)
      };
    });

    res.json({
      job: job,
      applicants: applicantsWithScores,
      total: applicantsWithScores.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/employer/shortlist - Shortlist candidate
router.post('/shortlist', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const { candidateId, jobId, notes } = req.body;

    const candidate = await User.findById(candidateId);
    const job = await Job.findById(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ error: 'Candidate or job not found' });
    }

    // Update application status to shortlisted
    const application = candidate.appliedJobs.find(app => app.jobId.toString() === jobId);
    if (application) {
      application.status = 'shortlisted';
      application.shortlistedAt = new Date();
      application.employerNotes = notes;
      await candidate.save();
    }

    res.json({ message: 'Candidate shortlisted successfully', candidate: candidate.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/employer/jobs/:jobId/shortlisted - Get shortlisted candidates
router.get('/jobs/:jobId/shortlisted', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const shortlisted = await User.find({
      'appliedJobs': {
        $elemMatch: {
          jobId: req.params.jobId,
          status: 'shortlisted'
        }
      }
    }).select('-password -refreshTokens');

    res.json({
      shortlisted,
      total: shortlisted.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/employer/candidate/:candidateId/status - Update candidate status
router.put('/candidate/:candidateId/status', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const { jobId, status, notes } = req.body; // status: shortlisted, rejected, interviewed, hired
    
    const candidate = await User.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const application = candidate.appliedJobs.find(app => app.jobId.toString() === jobId);
    if (application) {
      application.status = status;
      application.employerNotes = notes;
      application.updatedAt = new Date();
      await candidate.save();
    }

    res.json({ message: `Candidate status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;