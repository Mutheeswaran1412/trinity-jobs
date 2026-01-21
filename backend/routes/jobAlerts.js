import express from 'express';
import { body, validationResult } from 'express-validator';
import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';
import { sendJobAlertEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/job-alerts - Create job alert
router.post('/', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('alertName').notEmpty().withMessage('Alert name is required'),
  body('criteria.keywords').optional().isArray().withMessage('Keywords must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobAlert = new JobAlert(req.body);
    await jobAlert.save();
    
    res.status(201).json({ 
      message: 'Job alert created successfully!', 
      jobAlert 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/job-alerts/user/:userId - Get user's job alerts
router.get('/user/:userId', async (req, res) => {
  try {
    const jobAlerts = await JobAlert.find({ 
      userId: req.params.userId,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(jobAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/job-alerts/:id - Update job alert
router.put('/:id', async (req, res) => {
  try {
    const jobAlert = await JobAlert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!jobAlert) {
      return res.status(404).json({ error: 'Job alert not found' });
    }
    
    res.json({ message: 'Job alert updated successfully', jobAlert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/job-alerts/:id - Delete job alert
router.delete('/:id', async (req, res) => {
  try {
    const jobAlert = await JobAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!jobAlert) {
      return res.status(404).json({ error: 'Job alert not found' });
    }
    
    res.json({ message: 'Job alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/job-alerts/check-and-send - Check for matching jobs and send alerts
router.post('/check-and-send', async (req, res) => {
  try {
    const activeAlerts = await JobAlert.find({ isActive: true });
    let alertsSent = 0;
    
    for (const alert of activeAlerts) {
      // Build query based on alert criteria
      const query = { isActive: true };
      
      if (alert.criteria.keywords && alert.criteria.keywords.length > 0) {
        query.$or = [
          { jobTitle: { $regex: alert.criteria.keywords.join('|'), $options: 'i' } },
          { description: { $regex: alert.criteria.keywords.join('|'), $options: 'i' } },
          { skills: { $in: alert.criteria.keywords } }
        ];
      }
      
      if (alert.criteria.location) {
        query.location = { $regex: alert.criteria.location, $options: 'i' };
      }
      
      if (alert.criteria.jobType && alert.criteria.jobType.length > 0) {
        query.jobType = { $in: alert.criteria.jobType };
      }
      
      if (alert.criteria.salaryMin) {
        query['salary.min'] = { $gte: alert.criteria.salaryMin };
      }
      
      // Get jobs posted since last alert
      const lastSent = alert.lastSent || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      query.createdAt = { $gte: lastSent };
      
      const matchingJobs = await Job.find(query).limit(10);
      
      if (matchingJobs.length > 0) {
        try {
          await sendJobAlertEmail(alert.email, alert.alertName, matchingJobs);
          
          // Update alert
          alert.lastSent = new Date();
          alert.totalJobsSent += matchingJobs.length;
          await alert.save();
          
          alertsSent++;
        } catch (emailError) {
          console.error(`Failed to send alert to ${alert.email}:`, emailError);
        }
      }
    }
    
    res.json({ 
      message: `Processed ${activeAlerts.length} alerts, sent ${alertsSent} notifications` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;