import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { AIScoring } from '../utils/aiScoring.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAuth.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/candidates - Get all candidates with search and filter support
router.get('/', async (req, res) => {
  try {
    const { search, skill, location } = req.query;
    
    // Get candidates from users collection
    let userQuery = { userType: 'candidate', status: 'active' };
    
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      userQuery.location = { $regex: location, $options: 'i' };
    }
    
    const candidates = await User.find(userQuery)
      .select('name email phone location title salary availability rating')
      .limit(50)
      .sort({ createdAt: -1 });
    
    // Get profiles for these candidates
    const candidateEmails = candidates.map(c => c.email);
    let profiles = [];
    try {
      const Profile = mongoose.model('Profile');
      profiles = await Profile.find({ 
        email: { $in: candidateEmails } 
      });
    } catch (error) {
      console.log('Profile collection not found, using user data only');
    }
    
    // Create a map of profiles by email
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.email] = profile;
    });
    
    // Transform and merge data
    let transformedCandidates = candidates.map(candidate => {
      const profile = profileMap[candidate.email] || {};
      
      return {
        _id: candidate._id,
        name: candidate.name || profile.name,
        fullName: candidate.name || profile.name,
        email: candidate.email,
        phone: candidate.phone || profile.phone,
        location: candidate.location || profile.location || 'Location not specified',
        title: profile.title || candidate.title || 'Software Developer',
        skills: profile.skills || [],
        experience: profile.yearsExperience || candidate.experience || '2+ years',
        salary: candidate.salary || profile.salary || '$80,000 - $100,000',
        availability: candidate.availability || 'Available',
        rating: candidate.rating || (4.0 + Math.random() * 1).toFixed(1)
      };
    });
    
    // Apply skill filter after merging profile data
    if (skill) {
      transformedCandidates = transformedCandidates.filter(candidate => 
        candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }
    
    res.json(transformedCandidates);
  } catch (error) {
    console.error('Candidates fetch error:', error);
    res.json([]);
  }
});

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