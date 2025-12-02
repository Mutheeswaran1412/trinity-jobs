import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = express.Router();

// POST /api/admin/bulk/users - Bulk user operations
router.post('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userIds, action, value } = req.body;
    
    let updateData = {};
    if (action === 'status') updateData.status = value;
    if (action === 'role') updateData.userType = value;
    if (action === 'delete') updateData = { status: 'deleted', isActive: false };
    
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );
    
    res.json({ message: `${result.modifiedCount} users updated`, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/bulk/jobs - Bulk job operations
router.post('/jobs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { jobIds, action, notes } = req.body;
    
    const statusMap = { approve: 'approved', reject: 'rejected', flag: 'flagged' };
    
    const result = await Job.updateMany(
      { _id: { $in: jobIds } },
      { 
        status: statusMap[action],
        moderationNotes: notes,
        moderatedAt: new Date()
      }
    );
    
    res.json({ message: `${result.modifiedCount} jobs ${action}d`, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;