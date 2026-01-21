import express from 'express';
import { sendJobApplicationEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/test-email - Test email functionality
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    const result = await sendJobApplicationEmail(
      email, 
      name, 
      'Test Position', 
      'Trinity Tech'
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;