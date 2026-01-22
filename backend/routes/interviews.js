import express from 'express';

const router = express.Router();

// GET /api/interviews - Get interviews for employer
router.get('/', async (req, res) => {
  try {
    const { employerId, employerEmail } = req.query;
    
    // Return empty array for now since interviews feature is not implemented
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;