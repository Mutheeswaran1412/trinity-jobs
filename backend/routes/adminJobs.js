import express from 'express';
import Job from '../models/Job.js';
import { mistralDetector } from '../utils/mistralJobDetector.js';

const router = express.Router();

// GET /api/admin/jobs/pending - Get pending jobs
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20, company, status = 'pending' } = req.query;
    
    const filter = { status };
    if (company) filter.company = { $regex: company, $options: 'i' };
    
    const jobs = await Job.find(filter)
      .populate('employerId', 'name email company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);
    
    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/jobs/summary - Moderation summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [pending, approvedToday, rejectedToday, suspicious] = await Promise.all([
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ 
        status: 'approved', 
        moderatedAt: { $gte: today } 
      }),
      Job.countDocuments({ 
        status: 'rejected', 
        moderatedAt: { $gte: today } 
      }),
      Job.countDocuments({ status: 'flagged' })
    ]);
    
    res.json({
      pending,
      approvedToday,
      rejectedToday,
      suspicious
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/jobs/:jobId - Get single job details
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('employerId', 'name email company phone')
      .populate('moderatedBy', 'name email');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/:jobId/approve - Approve job
router.post('/:jobId/approve', async (req, res) => {
  try {
    const { approved_by, notes } = req.body;
    
    const job = await Job.findByIdAndUpdate(req.params.jobId, {
      status: 'approved',
      moderatedBy: approved_by,
      moderatedAt: new Date(),
      moderationNotes: notes || 'Job approved by admin'
    }, { new: true });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      message: 'Job approved successfully', 
      job 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/:jobId/reject - Reject job
router.post('/:jobId/reject', async (req, res) => {
  try {
    const { reason, rejected_by } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const job = await Job.findByIdAndUpdate(req.params.jobId, {
      status: 'rejected',
      moderatedBy: rejected_by,
      moderatedAt: new Date(),
      moderationNotes: reason
    }, { new: true });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      message: 'Job rejected successfully', 
      job,
      reason 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/:jobId/flag - Mark job as suspicious
router.post('/:jobId/flag', async (req, res) => {
  try {
    const { flag_type, notes, flagged_by } = req.body;
    
    const validFlags = ['spam', 'duplicate', 'scam', 'fake', 'inappropriate'];
    if (!validFlags.includes(flag_type)) {
      return res.status(400).json({ error: 'Invalid flag type' });
    }
    
    const job = await Job.findByIdAndUpdate(req.params.jobId, {
      status: 'flagged',
      moderatedBy: flagged_by,
      moderatedAt: new Date(),
      moderationNotes: `Flagged as ${flag_type}: ${notes || 'No additional notes'}`,
      'moderationFlags.isSpam': flag_type === 'spam',
      'moderationFlags.isDuplicate': flag_type === 'duplicate',
      'moderationFlags.isFake': ['scam', 'fake'].includes(flag_type)
    }, { new: true });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ 
      message: `Job flagged as ${flag_type}`, 
      job 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/:jobId/note - Add admin notes
router.post('/:jobId/note', async (req, res) => {
  try {
    const { note, admin_id } = req.body;
    
    if (!note) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const timestamp = new Date().toISOString();
    const adminNote = `[${timestamp}] Admin Note: ${note}`;
    
    job.moderationNotes = job.moderationNotes 
      ? `${job.moderationNotes}\n${adminNote}`
      : adminNote;
    
    await job.save();
    
    res.json({ 
      message: 'Note added successfully', 
      job 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/:jobId/analyze - AI analyze job
router.post('/:jobId/analyze', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const analysis = await mistralDetector.detectJobIssues(job);
    
    // Update job with AI analysis
    job.moderationFlags = {
      isSpam: analysis.isSpam,
      isFake: analysis.isFake,
      hasComplianceIssues: analysis.hasComplianceIssues,
      isDuplicate: false
    };
    
    await job.save();

    res.json({
      analysis,
      recommendation: analysis.recommendation,
      riskScore: analysis.riskScore,
      issues: analysis.issues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;