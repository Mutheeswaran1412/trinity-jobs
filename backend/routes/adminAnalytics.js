import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = express.Router();

// GET /api/admin/analytics/dashboard - Dashboard stats
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApplications, activeJobs] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Job.countDocuments(),
      User.aggregate([{ $unwind: '$appliedJobs' }, { $count: 'total' }]),
      Job.countDocuments({ status: 'approved', isActive: true })
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [newUsersToday, newJobsToday] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: today } }),
      Job.countDocuments({ createdAt: { $gte: today } })
    ]);

    res.json({
      totalUsers,
      totalJobs,
      totalApplications: totalApplications[0]?.total || 0,
      activeJobs,
      newUsersToday,
      newJobsToday
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/analytics/users - User analytics
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const usersByType = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    const usersByStatus = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ usersByType, usersByStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;