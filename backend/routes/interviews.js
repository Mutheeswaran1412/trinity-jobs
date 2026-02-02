import express from 'express';

const router = express.Router();

// GET /api/interviews - Get interviews for employer
router.get('/', async (req, res) => {
  try {
    const { employerId, employerEmail } = req.query;
    
    // Return empty array with proper JSON response
    res.json({ 
      success: true,
      interviews: [],
      message: 'No interviews found'
    });
  } catch (error) {
    console.error('Interviews API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      interviews: []
    });
  }
});

export default router;